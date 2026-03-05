from pydantic import BaseModel


# ── Problem ──
class ProblemCreate(BaseModel):
    title: str
    description: str
    difficulty: str = "beginner"
    schema_sql: str
    solution_query: str
    starter_code: str | None = None
    table_name: str | None = None
    requirements: list[str] | None = None
    order_index: int = 0


class ProblemOut(BaseModel):
    id: int
    lesson_id: int
    title: str
    description: str
    difficulty: str
    table_name: str | None = None
    starter_code: str | None = None
    requirements: list[str] | None = None
    order_index: int
    hint_count: int = 0
    dataset_count: int = 0

    model_config = {"from_attributes": True}


class ProblemDetailOut(ProblemOut):
    """Full detail — for instructor/admin only."""
    schema_sql: str
    solution_query: str


# ── Dataset ──
class DatasetCreate(BaseModel):
    name: str
    insert_sql: str
    order_index: int = 0


class DatasetOut(BaseModel):
    id: int
    problem_id: int
    name: str
    order_index: int

    model_config = {"from_attributes": True}


# ── Hint ──
class HintCreate(BaseModel):
    message: str
    order_index: int = 0


class HintOut(BaseModel):
    id: int
    problem_id: int
    message: str
    order_index: int

    model_config = {"from_attributes": True}
