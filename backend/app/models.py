# app/models.py

from datetime import datetime
from typing import List, Optional

from sqlmodel import Field, Relationship, SQLModel


# =========================
# User Table
# =========================
class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    email: str = Field(index=True, unique=True, nullable=False)
    hashed_password: str = Field(nullable=False)

    created_at: datetime = Field(default_factory=datetime.now)

    # Relationship
    assessments: List["Assessment"] = Relationship(back_populates="user")


# =========================
# Assessment Table
# =========================
class Assessment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    user_id: int = Field(foreign_key="user.id", nullable=False)

    test_type: str = Field(nullable=False)  # "gad7" or "phq9"

    total_score: int = Field(nullable=False)
    severity: str = Field(nullable=False)

    responses: str = Field(nullable=False)  # JSON string
    difficulty: str = Field(nullable=False)

    created_at: datetime = Field(default_factory=datetime.now)

    # Relationship
    user: Optional[User] = Relationship(back_populates="assessments")
