"""
Grading Service — orchestrates sandbox execution + result comparison.
Called from the submissions API to grade a student's SQL query.
"""

from app.models.problem import Problem
from app.grading.sandbox import execute_in_sandbox
from app.grading.comparator import compare_results
from app.schemas.submission import GradingResult


async def grade_submission(
    student_query: str,
    problem: Problem,
) -> GradingResult:
    """
    Grade a student's SQL submission against the golden query.

    Process:
    1. Gather all datasets for the problem
    2. For each dataset, run both queries in a sandbox
    3. Compare results
    4. Return GradingResult (must pass ALL datasets)
    """
    if not student_query.strip():
        return GradingResult(
            is_correct=False,
            execution_time_ms=0,
            error_message="Empty query submitted",
            hints=["Please write a SQL query before submitting."],
        )

    # Collect datasets
    datasets = problem.datasets or []
    if not datasets:
        # No datasets — run with just the schema (no INSERT data)
        dataset_sqls = [""]
    else:
        dataset_sqls = [d.insert_sql for d in datasets]

    total_time_ms = 0
    all_student_results = None
    all_expected_results = None

    # Run against each dataset
    for idx, dataset_sql in enumerate(dataset_sqls):
        sandbox_result = await execute_in_sandbox(
            schema_sql=problem.schema_sql,
            dataset_sqls=[dataset_sql] if dataset_sql else [],
            student_query=student_query,
            golden_query=problem.solution_query,
        )

        total_time_ms += sandbox_result["execution_time_ms"]

        # If sandbox execution failed
        if not sandbox_result["success"]:
            hints = _generate_hints(sandbox_result["error"], problem)
            return GradingResult(
                is_correct=False,
                execution_time_ms=total_time_ms,
                error_message=sandbox_result["error"],
                student_result=_format_result_snapshot(
                    sandbox_result["student_columns"],
                    sandbox_result["student_rows"],
                ),
                expected_result=_format_result_snapshot(
                    sandbox_result["expected_columns"],
                    sandbox_result["expected_rows"],
                ),
                hints=hints,
            )

        # Compare results
        comparison = compare_results(
            student_columns=sandbox_result["student_columns"],
            student_rows=sandbox_result["student_rows"],
            expected_columns=sandbox_result["expected_columns"],
            expected_rows=sandbox_result["expected_rows"],
        )

        # Store first dataset's results for display
        if idx == 0:
            all_student_results = _format_result_snapshot(
                sandbox_result["student_columns"],
                sandbox_result["student_rows"],
            )
            all_expected_results = _format_result_snapshot(
                sandbox_result["expected_columns"],
                sandbox_result["expected_rows"],
            )

        # If comparison failed on any dataset
        if not comparison["is_correct"]:
            dataset_name = datasets[idx].name if idx < len(datasets) else "default"
            hints = _generate_hints(comparison["error"], problem)
            if len(datasets) > 1:
                hints.insert(0, f"Failed on dataset '{dataset_name}'. Your query must work for ALL datasets.")
            return GradingResult(
                is_correct=False,
                execution_time_ms=total_time_ms,
                error_message=comparison["error"],
                student_result=_format_result_snapshot(
                    sandbox_result["student_columns"],
                    sandbox_result["student_rows"],
                ),
                expected_result=_format_result_snapshot(
                    sandbox_result["expected_columns"],
                    sandbox_result["expected_rows"],
                ),
                comparison=comparison["details"],
                hints=hints,
            )

    # All datasets passed
    return GradingResult(
        is_correct=True,
        execution_time_ms=total_time_ms,
        student_result=all_student_results,
        expected_result=all_expected_results,
        comparison={"column_match": True, "row_count_match": True, "data_match": True},
        hints=[],
    )


def _format_result_snapshot(
    columns: list[str],
    rows: list[list],
    max_rows: int = 50,
) -> dict | None:
    """Format query result into a serializable snapshot for the frontend."""
    if not columns:
        return None
    return {
        "columns": columns,
        "rows": rows[:max_rows],
        "total_rows": len(rows),
        "truncated": len(rows) > max_rows,
    }


def _generate_hints(error: str | None, problem: Problem) -> list[str]:
    """Generate contextual hints based on the error and problem."""
    hints = []
    if not error:
        return hints

    error_lower = error.lower()

    # Syntax hints
    if "syntax" in error_lower or "near" in error_lower:
        hints.append("Check your SQL syntax — look for missing commas, parentheses, or keywords.")

    # Table/column not found
    if "no such table" in error_lower:
        hints.append(f"Make sure you're using the correct table name. Try: {problem.table_name or 'check the schema'}.")
    if "no such column" in error_lower:
        hints.append("Check the column names — they are case-sensitive in some databases.")

    # Result mismatch
    if "column count" in error_lower:
        hints.append("Your query returns a different number of columns than expected. Check your SELECT clause.")
    if "column name" in error_lower:
        hints.append("Column names don't match. You may need to use aliases (AS).")
    if "row count" in error_lower:
        hints.append("Your query returns a different number of rows. Check your WHERE conditions or JOINs.")
    if "data mismatch" in error_lower:
        hints.append("The data in your results doesn't match. Double-check your logic and conditions.")

    # Add problem-specific hints from DB
    if problem.hints:
        for hint in problem.hints[:3]:
            hints.append(hint.message)

    return hints
