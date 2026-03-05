"""
SQL Result Comparator.
Compares student query results vs. golden (reference) query results.
"""

from typing import Optional


def compare_results(
    student_columns: list[str],
    student_rows: list[list],
    expected_columns: list[str],
    expected_rows: list[list],
    order_matters: bool = False,
) -> dict:
    """
    Compare student result with expected result.

    Returns:
        {
            "is_correct": bool,
            "error": str | None,
            "details": {
                "column_match": bool,
                "row_count_match": bool,
                "data_match": bool,
                "missing_rows": [...],
                "extra_rows": [...],
            }
        }
    """
    details = {
        "column_match": False,
        "row_count_match": False,
        "data_match": False,
        "missing_rows": [],
        "extra_rows": [],
    }

    # ── 1. Column check ──
    student_cols_lower = [c.lower().strip() for c in student_columns]
    expected_cols_lower = [c.lower().strip() for c in expected_columns]

    if student_cols_lower != expected_cols_lower:
        # Check if it's a column name mismatch vs count mismatch
        if len(student_cols_lower) != len(expected_cols_lower):
            return {
                "is_correct": False,
                "error": f"Column count mismatch: got {len(student_cols_lower)}, expected {len(expected_cols_lower)}",
                "details": details,
            }
        # Same count but different names
        if set(student_cols_lower) == set(expected_cols_lower):
            # Same columns, different order — check if data matches with reordered columns
            # Reorder student rows to match expected column order
            col_mapping = [student_cols_lower.index(c) for c in expected_cols_lower]
            student_rows = [
                [row[col_mapping[i]] for i in range(len(expected_cols_lower))]
                for row in student_rows
            ]
            details["column_match"] = True
        else:
            return {
                "is_correct": False,
                "error": f"Column names mismatch: got {student_cols_lower}, expected {expected_cols_lower}",
                "details": details,
            }
    else:
        details["column_match"] = True

    # ── 2. Row count check ──
    if len(student_rows) != len(expected_rows):
        details["row_count_match"] = False
        return {
            "is_correct": False,
            "error": f"Row count mismatch: got {len(student_rows)}, expected {len(expected_rows)}",
            "details": details,
        }
    details["row_count_match"] = True

    # ── 3. Data check ──
    # Normalize values for comparison
    def normalize_row(row):
        return tuple(
            str(v).strip().lower() if v is not None else ""
            for v in row
        )

    if order_matters:
        # Compare row-by-row in order
        for i, (s_row, e_row) in enumerate(zip(student_rows, expected_rows)):
            if normalize_row(s_row) != normalize_row(e_row):
                return {
                    "is_correct": False,
                    "error": f"Row {i + 1} mismatch",
                    "details": {**details, "data_match": False},
                }
    else:
        # Compare as sets (order doesn't matter)
        student_set = sorted([normalize_row(r) for r in student_rows])
        expected_set = sorted([normalize_row(r) for r in expected_rows])

        if student_set != expected_set:
            # Find missing and extra rows
            student_multiset = {}
            for r in student_set:
                student_multiset[r] = student_multiset.get(r, 0) + 1
            expected_multiset = {}
            for r in expected_set:
                expected_multiset[r] = expected_multiset.get(r, 0) + 1

            missing = []
            for r, count in expected_multiset.items():
                diff = count - student_multiset.get(r, 0)
                if diff > 0:
                    missing.extend([list(r)] * diff)

            extra = []
            for r, count in student_multiset.items():
                diff = count - expected_multiset.get(r, 0)
                if diff > 0:
                    extra.extend([list(r)] * diff)

            details["missing_rows"] = missing[:5]  # Limit for display
            details["extra_rows"] = extra[:5]

            return {
                "is_correct": False,
                "error": "Data mismatch: rows don't match expected output",
                "details": details,
            }

    details["data_match"] = True
    return {
        "is_correct": True,
        "error": None,
        "details": details,
    }
