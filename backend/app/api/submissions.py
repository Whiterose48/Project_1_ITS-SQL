"""
Submission endpoints — submit SQL queries for grading, view history.
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.database import get_db
from app.models.user import User, Role
from app.models.problem import Problem
from app.models.submission import Submission, SubmissionLog
from app.models.assignment import Assignment
from app.schemas.submission import SubmissionCreate, SubmissionOut, GradingResult
from app.middleware.auth import get_current_user, require_ta
from app.services.grading_service import grade_submission

router = APIRouter(prefix="/submissions", tags=["Submissions"])


@router.post("", response_model=GradingResult)
async def submit_query(
    payload: SubmissionCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Submit an SQL query for grading.
    1. Load the problem + datasets
    2. Run in sandbox (student query vs golden query)
    3. Compare results
    4. Store submission record
    5. Return grading result
    """
    # Load problem
    result = await db.execute(select(Problem).where(Problem.id == payload.problem_id))
    problem = result.scalar_one_or_none()
    if not problem:
        raise HTTPException(404, "Problem not found")

    # Check assignment constraints (if this is an assignment submission)
    if payload.assignment_id:
        asgn_result = await db.execute(
            select(Assignment).where(Assignment.id == payload.assignment_id)
        )
        assignment = asgn_result.scalar_one_or_none()
        if not assignment:
            raise HTTPException(404, "Assignment not found")
        if not assignment.is_active:
            raise HTTPException(400, "Assignment is not active")

        # Check attempt limit
        if assignment.max_attempts > 0:
            attempt_count_result = await db.execute(
                select(func.count(Submission.id)).where(
                    and_(
                        Submission.user_id == user.id,
                        Submission.problem_id == payload.problem_id,
                        Submission.assignment_id == payload.assignment_id,
                    )
                )
            )
            attempt_count = attempt_count_result.scalar()
            if attempt_count >= assignment.max_attempts:
                raise HTTPException(400, f"Maximum attempts ({assignment.max_attempts}) reached")

    # Calculate attempt number
    attempt_result = await db.execute(
        select(func.count(Submission.id)).where(
            and_(
                Submission.user_id == user.id,
                Submission.problem_id == payload.problem_id,
            )
        )
    )
    attempt_number = attempt_result.scalar() + 1

    # Grade the submission
    grading_result = await grade_submission(
        student_query=payload.query,
        problem=problem,
    )

    # Save submission
    submission = Submission(
        user_id=user.id,
        problem_id=payload.problem_id,
        assignment_id=payload.assignment_id,
        query=payload.query,
        is_correct=grading_result.is_correct,
        execution_time_ms=grading_result.execution_time_ms,
        error_message=grading_result.error_message,
        result_snapshot=grading_result.student_result,
        attempt_number=attempt_number,
    )
    db.add(submission)

    # Also log it
    log_entry = SubmissionLog(
        user_id=user.id,
        problem_id=payload.problem_id,
        query=payload.query,
        execution_time_ms=grading_result.execution_time_ms,
        error_message=grading_result.error_message,
        is_correct=grading_result.is_correct,
    )
    db.add(log_entry)

    await db.commit()

    return grading_result


@router.get("/my", response_model=List[SubmissionOut])
async def my_submissions(
    problem_id: int = None,
    limit: int = 50,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current user's submissions, optionally filtered by problem."""
    query = select(Submission).where(Submission.user_id == user.id)
    if problem_id:
        query = query.where(Submission.problem_id == problem_id)
    query = query.order_by(Submission.submitted_at.desc()).limit(limit)

    result = await db.execute(query)
    submissions = result.scalars().all()
    return [
        {
            "id": s.id,
            "user_id": s.user_id,
            "problem_id": s.problem_id,
            "assignment_id": s.assignment_id,
            "query": s.query,
            "is_correct": s.is_correct,
            "execution_time_ms": s.execution_time_ms,
            "error_message": s.error_message,
            "result_snapshot": s.result_snapshot,
            "attempt_number": s.attempt_number,
            "submitted_at": s.submitted_at,
        }
        for s in submissions
    ]


@router.get("/problem/{problem_id}/all")
async def list_submissions_for_problem(
    problem_id: int,
    user: User = Depends(require_ta),
    db: AsyncSession = Depends(get_db),
):
    """List all submissions for a problem. TA/Instructor/Admin only."""
    result = await db.execute(
        select(Submission)
        .where(Submission.problem_id == problem_id)
        .order_by(Submission.submitted_at.desc())
        .limit(200)
    )
    submissions = result.scalars().all()
    return [
        {
            "id": s.id,
            "user_id": s.user_id,
            "user_name": s.user.name if s.user else None,
            "student_id": s.user.student_id if s.user else None,
            "problem_id": s.problem_id,
            "query": s.query,
            "is_correct": s.is_correct,
            "execution_time_ms": s.execution_time_ms,
            "error_message": s.error_message,
            "attempt_number": s.attempt_number,
            "submitted_at": s.submitted_at.isoformat(),
        }
        for s in submissions
    ]


@router.get("/student/{student_user_id}")
async def list_submissions_for_student(
    student_user_id: int,
    course_id: int = None,
    user: User = Depends(require_ta),
    db: AsyncSession = Depends(get_db),
):
    """List all submissions for a specific student. TA/Instructor/Admin only."""
    query = select(Submission).where(Submission.user_id == student_user_id)
    query = query.order_by(Submission.submitted_at.desc()).limit(200)

    result = await db.execute(query)
    submissions = result.scalars().all()
    return [
        {
            "id": s.id,
            "user_id": s.user_id,
            "problem_id": s.problem_id,
            "problem_title": s.problem.title if s.problem else None,
            "query": s.query,
            "is_correct": s.is_correct,
            "execution_time_ms": s.execution_time_ms,
            "error_message": s.error_message,
            "attempt_number": s.attempt_number,
            "submitted_at": s.submitted_at.isoformat(),
        }
        for s in submissions
    ]
