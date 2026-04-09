# app/routes/auth.py

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from sqlmodel import Session, select

from app.auth import create_access_token, hash_password, verify_password
from app.database import get_session
from app.models import User

router = APIRouter(prefix="/auth", tags=["Auth"])


# =========================
# Request Schema (Signup only)
# =========================
class SignupRequest(BaseModel):
    email: EmailStr
    password: str


# =========================
# Signup
# =========================
@router.post("/signup")
def signup(data: SignupRequest, session: Session = Depends(get_session)):
    existing_user = session.exec(select(User).where(User.email == data.email)).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(email=data.email, hashed_password=hash_password(data.password))

    session.add(user)
    session.commit()
    session.refresh(user)

    return {"message": "User created successfully"}


# =========================
# Login (OAuth2 Compatible)
# =========================
@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session),
):
    user = session.exec(select(User).where(User.email == form_data.username)).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": str(user.id)})

    return {"access_token": token, "token_type": "bearer"}
