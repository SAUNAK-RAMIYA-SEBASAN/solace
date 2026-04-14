# app/main.py

from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

# from app import models
from app.auth import get_current_user
from app.database import create_db_and_tables
from app.models import User
from app.routes.assessment import router as assessment_router
from app.routes.auth import router as auth_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://proud-grass-09ddc1400.7.azurestaticapps.net",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
