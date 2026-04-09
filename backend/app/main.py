# app/main.py

from fastapi import Depends, FastAPI

# from app import models  # ensure models are registered
from app.auth import get_current_user
from app.database import create_db_and_tables
from app.models import User
from app.routes.assessment import router as assessment_router
from app.routes.auth import router as auth_router

app = FastAPI()


# =========================
# Startup
# =========================
@app.on_event("startup")
def on_startup():
    create_db_and_tables()


# =========================
# Routers
# =========================
app.include_router(auth_router)
app.include_router(assessment_router)


# =========================
# Test Routes
# =========================
@app.get("/")
def root():
    return {"message": "API is running"}


@app.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
