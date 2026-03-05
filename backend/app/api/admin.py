"""
Admin endpoints — user management, role assignment, system overview.
Also: Assignment CRUD.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from datetime import datetime, timedelta, timezone

from app.database import get_db
from app.models.user import User, Role
from app.models.course import Course
from app.models.submission import Submission, SubmissionLog
from app.models.enrollment import Enrollment
from app.models.assignment import Assignment, AssignmentProblem
from app.schemas.user import UserOut, UserUpdate, UserRoleAssign
from app.schemas.submission import AssignmentCreate, AssignmentOut
from app.middleware.auth import (
    get_current_user,
    require_admin,
    require_instructor,
    require_ta,
)

router = APIRouter(prefix="/admin", tags=["Admin"])


# ─── User Management ────────────────────────────────────────────────

@router.get("/users", response_model=List[UserOut])
async def list_users(
    role: str = None,
    search: str = None,
    user: User = Depends(require_ta),
    db: AsyncSession = Depends(get_db),
):
    """List all users. Filter by role or search by name/email."""
    query = select(User).order_by(User.created_at.desc())
    if role:
        query = query.where(User.role == role)
    if search:
        query = query.where(
            (User.name.ilike(f"%{search}%")) | (User.email.ilike(f"%{search}%"))
        )
    result = await db.execute(query.limit(500))
    users = result.scalars().all()
    return users


@router.get("/users/{user_id}", response_model=UserOut)
async def get_user(
    user_id: int,
    user: User = Depends(require_ta),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific user."""
    result = await db.execute(select(User).where(User.id == user_id))
    target = result.scalar_one_or_none()
    if not target:
        raise HTTPException(404, "User not found")
    return target


@router.put("/users/{user_id}/role")
async def assign_role(
    user_id: int,
    payload: UserUpdate,
    user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Assign/change a user's role. Admin only."""
    result = await db.execute(select(User).where(User.id == user_id))
    target = result.scalar_one_or_none()
    if not target:
        raise HTTPException(404, "User not found")

    if payload.role is not None:
        target.role = payload.role
    if payload.name is not None:
        target.name = payload.name
    if payload.is_active is not None:
        target.is_active = payload.is_active

    await db.commit()
    await db.refresh(target)
    return {"message": "User updated", "user_id": target.id, "role": target.role.value}


@router.post("/users/assign-role")
async def bulk_assign_role(
    payload: UserRoleAssign,
    user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Assign a role to a user by email. Creates user if needed. Admin only."""
    result = await db.execute(select(User).where(User.email == payload.email.lower()))
    target = result.scalar_one_or_none()

    if target:
        target.role = payload.role
    else:
        # Pre-register user — they'll be updated on first login
        target = User(
            email=payload.email.lower(),
            name=payload.email.split("@")[0],
            role=payload.role,
        )
        db.add(target)

    await db.commit()
    await db.refresh(target)
    return {"message": f"Role {payload.role.value} assigned to {payload.email}", "user_id": target.id}


@router.put("/users/{user_id}/deactivate")
async def deactivate_user(
    user_id: int,
    user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Deactivate a user account. Admin only."""
    result = await db.execute(select(User).where(User.id == user_id))
    target = result.scalar_one_or_none()
    if not target:
        raise HTTPException(404, "User not found")
    target.is_active = False
    await db.commit()
    return {"message": "User deactivated", "user_id": user_id}


# ─── System Overview ─────────────────────────────────────────────────

@router.get("/stats")
async def system_stats(
    user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """System-wide statistics. Admin only."""
    users_count = (await db.execute(select(func.count(User.id)))).scalar()
    students_count = (await db.execute(
        select(func.count(User.id)).where(User.role == Role.STUDENT)
    )).scalar()
    courses_count = (await db.execute(select(func.count(Course.id)))).scalar()
    submissions_count = (await db.execute(select(func.count(Submission.id)))).scalar()

    # Recent activity (24h)
    day_ago = datetime.now(timezone.utc) - timedelta(hours=24)
    subs_24h = (await db.execute(
        select(func.count(Submission.id)).where(Submission.submitted_at >= day_ago)
    )).scalar()

    # Active users (7 days)
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    active_users = (await db.execute(
        select(func.count(User.id)).where(User.last_login >= week_ago)
    )).scalar()

    return {
        "total_users": users_count,
        "total_students": students_count,
        "total_courses": courses_count,
        "total_submissions": submissions_count,
        "submissions_24h": subs_24h,
        "active_users_7d": active_users,
    }


# ─── Assignments ─────────────────────────────────────────────────────

@router.get("/courses/{course_id}/assignments", response_model=List[AssignmentOut])
async def list_assignments(
    course_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List assignments for a course."""
    result = await db.execute(
        select(Assignment)
        .where(Assignment.course_id == course_id)
        .order_by(Assignment.created_at.desc())
    )
    assignments = result.scalars().all()

    now = datetime.now(timezone.utc)
    output = []
    for a in assignments:
        # Students only see active, open assignments
        if user.role == Role.STUDENT:
            if not a.is_active:
                continue
            if a.open_date and a.open_date > now:
                continue

        output.append({
            "id": a.id,
            "course_id": a.course_id,
            "title": a.title,
            "description": a.description,
            "open_date": a.open_date,
            "due_date": a.due_date,
            "max_attempts": a.max_attempts,
            "is_active": a.is_active,
            "created_at": a.created_at,
            "problem_count": len(a.problems) if a.problems else 0,
        })
    return output


@router.post("/courses/{course_id}/assignments", status_code=status.HTTP_201_CREATED)
async def create_assignment(
    course_id: int,
    payload: AssignmentCreate,
    user: User = Depends(require_instructor),
    db: AsyncSession = Depends(get_db),
):
    """Create an assignment for a course. Instructor/Admin only."""
    assignment = Assignment(
        course_id=course_id,
        title=payload.title,
        description=payload.description,
        open_date=payload.open_date,
        due_date=payload.due_date,
        max_attempts=payload.max_attempts,
        created_by=user.id,
    )
    db.add(assignment)
    await db.flush()

    # Add problems to the assignment
    for idx, problem_id in enumerate(payload.problem_ids):
        ap = AssignmentProblem(
            assignment_id=assignment.id,
            problem_id=problem_id,
            order_index=idx,
        )
        db.add(ap)

    await db.commit()
    await db.refresh(assignment)
    return {
        "id": assignment.id,
        "course_id": assignment.course_id,
        "title": assignment.title,
        "description": assignment.description,
        "open_date": assignment.open_date,
        "due_date": assignment.due_date,
        "max_attempts": assignment.max_attempts,
        "is_active": assignment.is_active,
        "created_at": assignment.created_at,
        "problem_count": len(payload.problem_ids),
    }


@router.put("/assignments/{assignment_id}")
async def update_assignment(
    assignment_id: int,
    payload: AssignmentCreate,
    user: User = Depends(require_instructor),
    db: AsyncSession = Depends(get_db),
):
    """Update an assignment."""
    result = await db.execute(select(Assignment).where(Assignment.id == assignment_id))
    assignment = result.scalar_one_or_none()
    if not assignment:
        raise HTTPException(404, "Assignment not found")

    assignment.title = payload.title
    assignment.description = payload.description
    assignment.open_date = payload.open_date
    assignment.due_date = payload.due_date
    assignment.max_attempts = payload.max_attempts

    # Replace problems
    await db.execute(
        select(AssignmentProblem).where(AssignmentProblem.assignment_id == assignment_id)
    )
    # Delete existing
    existing = (await db.execute(
        select(AssignmentProblem).where(AssignmentProblem.assignment_id == assignment_id)
    )).scalars().all()
    for ep in existing:
        await db.delete(ep)

    # Add new
    for idx, problem_id in enumerate(payload.problem_ids):
        ap = AssignmentProblem(
            assignment_id=assignment.id,
            problem_id=problem_id,
            order_index=idx,
        )
        db.add(ap)

    await db.commit()
    await db.refresh(assignment)
    return {"message": "Assignment updated", "id": assignment.id}


@router.delete("/assignments/{assignment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_assignment(
    assignment_id: int,
    user: User = Depends(require_instructor),
    db: AsyncSession = Depends(get_db),
):
    """Delete an assignment."""
    result = await db.execute(select(Assignment).where(Assignment.id == assignment_id))
    assignment = result.scalar_one_or_none()
    if not assignment:
        raise HTTPException(404, "Assignment not found")
    await db.delete(assignment)
    await db.commit()


# ─── TA Management ───────────────────────────────────────────────────

@router.post("/courses/{course_id}/ta/{user_id}")
async def assign_ta(
    course_id: int,
    user_id: int,
    user: User = Depends(require_instructor),
    db: AsyncSession = Depends(get_db),
):
    """Assign a user as TA for a course. Instructor/Admin only."""
    # Check if user exists
    result = await db.execute(select(User).where(User.id == user_id))
    target = result.scalar_one_or_none()
    if not target:
        raise HTTPException(404, "User not found")

    # Update their global role to TA if they're a student
    if target.role == Role.STUDENT:
        target.role = Role.TA

    # Check enrollment
    enroll_result = await db.execute(
        select(Enrollment).where(
            and_(
                Enrollment.user_id == user_id,
                Enrollment.course_id == course_id,
            )
        )
    )
    enrollment = enroll_result.scalar_one_or_none()

    if enrollment:
        enrollment.role = "ta"
    else:
        enrollment = Enrollment(
            user_id=user_id,
            course_id=course_id,
            role="ta",
        )
        db.add(enrollment)

    await db.commit()
    return {"message": f"User {target.name} assigned as TA for course {course_id}"}


@router.delete("/courses/{course_id}/ta/{user_id}")
async def remove_ta(
    course_id: int,
    user_id: int,
    user: User = Depends(require_instructor),
    db: AsyncSession = Depends(get_db),
):
    """Remove TA role from a user for a course."""
    enroll_result = await db.execute(
        select(Enrollment).where(
            and_(
                Enrollment.user_id == user_id,
                Enrollment.course_id == course_id,
            )
        )
    )
    enrollment = enroll_result.scalar_one_or_none()
    if enrollment:
        enrollment.role = "student"
        await db.commit()
    return {"message": "TA role removed"}
