from pydantic import BaseModel
from datetime import datetime


# ── Course ──
class CourseCreate(BaseModel):
    code: str
    name: str
    description: str | None = None
    access_code: str


class CourseOut(BaseModel):
    id: int
    code: str
    name: str
    description: str | None = None
    access_code: str | None = None  # Hidden from students
    instructor_id: int | None = None
    instructor_name: str | None = None
    is_active: bool
    created_at: datetime
    module_count: int = 0
    enrolled_count: int = 0

    model_config = {"from_attributes": True}


class CourseEnroll(BaseModel):
    access_code: str


# ── Module ──
class ModuleCreate(BaseModel):
    title: str
    description: str | None = None
    order_index: int = 0


class ModuleOut(BaseModel):
    id: int
    course_id: int
    title: str
    description: str | None = None
    order_index: int
    is_active: bool
    lesson_count: int = 0

    model_config = {"from_attributes": True}


# ── Lesson ──
class LessonCreate(BaseModel):
    title: str
    content: str | None = None
    order_index: int = 0
    lesson_type: str = "CONTENT"


class LessonOut(BaseModel):
    id: int
    module_id: int
    title: str
    content: str | None = None
    order_index: int
    lesson_type: str
    is_active: bool
    problem_count: int = 0

    model_config = {"from_attributes": True}
