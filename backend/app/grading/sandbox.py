"""
SQLite Sandbox for safe SQL query execution.
Creates a temporary in-memory or file-based SQLite DB per grading request,
loads schema + dataset, executes queries, returns results, then destroys the DB.
"""

import aiosqlite
import tempfile
import os
import time
import re
from typing import Optional


# Maximum execution time for a single query (seconds)
MAX_QUERY_TIME = 10
# Maximum rows to return in result snapshot
MAX_RESULT_ROWS = 200


def _mysql_to_sqlite(sql: str) -> str:
    """
    Convert MySQL-flavoured SQL to SQLite-compatible SQL.
    Handles common differences between MySQL and SQLite dialects.
    """
    lines = []
    for line in sql.split("\n"):
        stripped = line.strip()
        # Skip MySQL-specific commands
        if stripped.upper().startswith(("SET ", "USE ", "DROP DATABASE", "CREATE DATABASE")):
            continue
        if stripped.upper().startswith(("ENGINE=", "DEFAULT CHARSET")):
            continue
        if stripped.startswith("/*") or stripped.startswith("--"):
            lines.append(line)
            continue
        lines.append(line)

    text = "\n".join(lines)

    # Remove backticks
    text = text.replace("`", "")

    # Remove AUTO_INCREMENT
    text = re.sub(r'\s+AUTO_INCREMENT', '', text, flags=re.IGNORECASE)

    # Remove UNSIGNED
    text = re.sub(r'\s+UNSIGNED', '', text, flags=re.IGNORECASE)

    # Replace MySQL data types
    text = re.sub(r'\bINT\(\d+\)', 'INTEGER', text, flags=re.IGNORECASE)
    text = re.sub(r'\bTINYINT\(\d+\)', 'INTEGER', text, flags=re.IGNORECASE)
    text = re.sub(r'\bSMALLINT\(\d+\)', 'INTEGER', text, flags=re.IGNORECASE)
    text = re.sub(r'\bMEDIUMINT\(\d+\)', 'INTEGER', text, flags=re.IGNORECASE)
    text = re.sub(r'\bBIGINT\(\d+\)', 'INTEGER', text, flags=re.IGNORECASE)
    text = re.sub(r'\bDECIMAL\([^)]+\)', 'REAL', text, flags=re.IGNORECASE)
    text = re.sub(r'\bFLOAT\([^)]+\)', 'REAL', text, flags=re.IGNORECASE)
    text = re.sub(r'\bDOUBLE\([^)]+\)', 'REAL', text, flags=re.IGNORECASE)
    text = re.sub(r'\bVARCHAR\(\d+\)', 'TEXT', text, flags=re.IGNORECASE)
    text = re.sub(r'\bCHAR\(\d+\)', 'TEXT', text, flags=re.IGNORECASE)
    text = re.sub(r'\bDATETIME\b', 'TEXT', text, flags=re.IGNORECASE)
    text = re.sub(r'\bTIMESTAMP\b', 'TEXT', text, flags=re.IGNORECASE)
    text = re.sub(r'\bENUM\([^)]+\)', 'TEXT', text, flags=re.IGNORECASE)

    # Remove MySQL-specific table options
    text = re.sub(r'\)\s*ENGINE\s*=\s*\w+[^;]*;', ');', text, flags=re.IGNORECASE)

    # Remove KEY/INDEX definitions (not FOREIGN KEY or PRIMARY KEY)
    text = re.sub(r',\s*\n\s*(?:UNIQUE\s+)?KEY\s+\w+\s*\([^)]+\)', '', text, flags=re.IGNORECASE)

    # Fix FOREIGN KEY references (SQLite doesn't need CONSTRAINT names the same way)
    # This handles the basic case gracefully

    return text


def _is_safe_query(query: str) -> tuple[bool, str]:
    """
    Check if the query is safe to execute in a sandbox.
    Only SELECT statements are allowed for student queries.
    """
    normalized = query.strip().upper()

    # Allow only SELECT
    if not normalized.startswith("SELECT"):
        return False, "Only SELECT queries are allowed"

    # Block dangerous patterns
    dangerous = [
        "DROP ", "DELETE ", "UPDATE ", "INSERT ", "ALTER ", "CREATE ",
        "REPLACE ", "TRUNCATE ", "GRANT ", "REVOKE ",
        "ATTACH ", "DETACH ",
        "PRAGMA ",
        "LOAD_EXTENSION",
    ]
    for pattern in dangerous:
        if pattern in normalized:
            return False, f"Forbidden SQL keyword: {pattern.strip()}"

    return True, ""


async def execute_in_sandbox(
    schema_sql: str,
    dataset_sqls: list[str],
    student_query: str,
    golden_query: str,
) -> dict:
    """
    Execute student and golden queries in an isolated SQLite sandbox.

    Args:
        schema_sql: CREATE TABLE statements
        dataset_sqls: List of INSERT statement blocks (one per dataset)
        student_query: Student's SQL query
        golden_query: Reference/golden SQL query

    Returns:
        {
            "success": bool,
            "error": str | None,
            "student_columns": [...],
            "student_rows": [[...]],
            "expected_columns": [...],
            "expected_rows": [[...]],
            "execution_time_ms": float,
        }
    """
    # Validate student query
    is_safe, reason = _is_safe_query(student_query)
    if not is_safe:
        return {
            "success": False,
            "error": reason,
            "student_columns": [],
            "student_rows": [],
            "expected_columns": [],
            "expected_rows": [],
            "execution_time_ms": 0,
        }

    # Convert MySQL to SQLite if needed
    sqlite_schema = _mysql_to_sqlite(schema_sql)

    # Use a temp file for the sandbox database
    tmp_fd, tmp_path = tempfile.mkstemp(suffix=".db", prefix="its_sql_sandbox_")
    os.close(tmp_fd)

    try:
        async with aiosqlite.connect(tmp_path) as db:
            # Enable foreign keys
            await db.execute("PRAGMA foreign_keys = ON;")

            # ── 1. Create schema ──
            try:
                await db.executescript(sqlite_schema)
            except Exception as e:
                return {
                    "success": False,
                    "error": f"Schema error: {str(e)}",
                    "student_columns": [],
                    "student_rows": [],
                    "expected_columns": [],
                    "expected_rows": [],
                    "execution_time_ms": 0,
                }

            # ── 2. Load datasets ──
            for dataset_sql in dataset_sqls:
                try:
                    converted = _mysql_to_sqlite(dataset_sql)
                    await db.executescript(converted)
                except Exception as e:
                    return {
                        "success": False,
                        "error": f"Dataset load error: {str(e)}",
                        "student_columns": [],
                        "student_rows": [],
                        "expected_columns": [],
                        "expected_rows": [],
                        "execution_time_ms": 0,
                    }

            await db.commit()

            # ── 3. Execute golden query ──
            try:
                cursor = await db.execute(golden_query)
                expected_columns = [desc[0] for desc in cursor.description] if cursor.description else []
                expected_rows = await cursor.fetchall()
                expected_rows = [list(row) for row in expected_rows]
            except Exception as e:
                return {
                    "success": False,
                    "error": f"Golden query error (contact instructor): {str(e)}",
                    "student_columns": [],
                    "student_rows": [],
                    "expected_columns": [],
                    "expected_rows": [],
                    "execution_time_ms": 0,
                }

            # ── 4. Execute student query ──
            start_time = time.perf_counter()
            try:
                cursor = await db.execute(student_query)
                student_columns = [desc[0] for desc in cursor.description] if cursor.description else []
                student_rows = await cursor.fetchall()
                student_rows = [list(row) for row in student_rows]
            except Exception as e:
                elapsed = (time.perf_counter() - start_time) * 1000
                return {
                    "success": False,
                    "error": f"Query error: {str(e)}",
                    "student_columns": [],
                    "student_rows": [],
                    "expected_columns": expected_columns,
                    "expected_rows": expected_rows[:MAX_RESULT_ROWS],
                    "execution_time_ms": round(elapsed, 2),
                }

            elapsed = (time.perf_counter() - start_time) * 1000

            return {
                "success": True,
                "error": None,
                "student_columns": student_columns,
                "student_rows": student_rows[:MAX_RESULT_ROWS],
                "expected_columns": expected_columns,
                "expected_rows": expected_rows[:MAX_RESULT_ROWS],
                "execution_time_ms": round(elapsed, 2),
            }

    finally:
        # ── 5. Destroy sandbox ──
        try:
            os.unlink(tmp_path)
        except OSError:
            pass
