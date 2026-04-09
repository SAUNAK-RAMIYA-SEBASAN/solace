# app/database.py

import os
from typing import Generator

from dotenv import load_dotenv
from sqlmodel import Session, SQLModel, create_engine

# Load .env variables
load_dotenv()

# PostgreSQL URL
DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://postgres:root@localhost:5432/mental_health_db"
)

# Create engine
engine = create_engine(
    DATABASE_URL,
    echo=False,  # set True for debugging
    pool_pre_ping=True,  # avoids stale connections
)


# Create tables
def create_db_and_tables() -> None:
    SQLModel.metadata.create_all(engine)


# Dependency (FastAPI)
def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
