# app/routes/assessment.py

import io
import json
from typing import Any, Union

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from app.assessment import (
    GAD7_OPTIONS,
    GAD7_QUESTIONS,
    PHQ9_OPTIONS,
    PHQ9_QUESTIONS,
    AssessmentRequest,
    calculate_gad7_score,
    calculate_phq9_score,
)
from app.auth import get_current_user
from app.database import get_session
from app.email_utils import build_ultimate_email_html, send_email_with_pdf
from app.models import Assessment, User
from app.reports import generate_assessment_pdf

router = APIRouter(prefix="/assessment", tags=["Assessment"])


def extract_username_from_email(email: str) -> str:
    return email.split("@")[0]


def _extract_pdf_bytes(pdf_obj: Union[bytes, bytearray, Any]) -> bytes:
    if isinstance(pdf_obj, (bytes, bytearray)):
        return bytes(pdf_obj)
    if isinstance(pdf_obj, io.BytesIO):
        return pdf_obj.getvalue()
    # fallback for file-like objects that provide getvalue()
    if hasattr(pdf_obj, "getvalue") and callable(getattr(pdf_obj, "getvalue")):
        return pdf_obj.getvalue()
    raise ValueError(
        "generate_assessment_pdf returned unsupported type; expected BytesIO or bytes"
    )


# =========================
# GAD-7 Questions
# =========================
@router.get("/gad7/questions")
def get_gad7_questions():
    return {
        "questions": GAD7_QUESTIONS,
        "options": GAD7_OPTIONS,
        "instructions": "Over the last 2 weeks, how often have you been bothered by the following problems?",
    }


# =========================
# PHQ-9 Questions
# =========================
@router.get("/phq9/questions")
def get_phq9_questions():
    return {
        "questions": PHQ9_QUESTIONS,
        "options": PHQ9_OPTIONS,
        "instructions": "Over the last 2 weeks, how often have you been bothered by the following symptoms?",
    }


# =========================
# GAD-7 Submission + Email PDF
# =========================
@router.post("/gad7")
def submit_gad7(
    data: AssessmentRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if current_user.id is None:
        raise HTTPException(status_code=400, detail="User ID missing")

    if len(data.responses) != 7:
        raise HTTPException(status_code=400, detail="GAD-7 requires 7 responses")

    result = calculate_gad7_score(data.responses, data.difficulty)

    assessment = Assessment(
        user_id=current_user.id,
        test_type="gad7",
        total_score=result.total_score,
        severity=result.severity,
        responses=json.dumps(data.responses),
        difficulty=data.difficulty.value,
    )

    session.add(assessment)
    session.commit()
    session.refresh(assessment)

    # Generate PDF
    pdf_buffer = generate_assessment_pdf(
        email=current_user.email,
        test_type="gad7",
        responses=data.responses,
        questions=GAD7_QUESTIONS,
        result=result,
    )

    if not pdf_buffer:
        raise HTTPException(status_code=500, detail="PDF generation failed")

    pdf_bytes = pdf_buffer.getvalue()

    if not pdf_bytes:
        raise HTTPException(status_code=500, detail="Empty PDF generated")

    print("PDF BUFFER TYPE:", type(pdf_buffer))
    print("PDF BYTES LENGTH:", len(pdf_bytes))

    body = build_ultimate_email_html(
        test_type="gad7",
        result=result,
        user_name=extract_username_from_email(current_user.email),
    )

    # Send Email (handle SMTP errors)
    try:
        send_email_with_pdf(
            to_email=current_user.email,
            subject="Your GAD-7 Assessment Report",
            body=body,
            pdf_bytes=pdf_bytes,
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to send email: {e}")

    return {
        "message": "Assessment completed. Report sent to email.",
        "result": result,
    }


# =========================
# PHQ-9 Submission + Email PDF
# =========================
@router.post("/phq9")
def submit_phq9(
    data: AssessmentRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if current_user.id is None:
        raise HTTPException(status_code=400, detail="User ID missing")

    if len(data.responses) != 9:
        raise HTTPException(status_code=400, detail="PHQ-9 requires 9 responses")

    result = calculate_phq9_score(data.responses, data.difficulty)

    assessment = Assessment(
        user_id=current_user.id,
        test_type="phq9",
        total_score=result.total_score,
        severity=result.severity,
        responses=json.dumps(data.responses),
        difficulty=data.difficulty.value,
    )

    session.add(assessment)
    session.commit()
    session.refresh(assessment)

    # Generate PDF
    pdf_buffer = generate_assessment_pdf(
        email=current_user.email,
        test_type="phq9",
        responses=data.responses,
        questions=PHQ9_QUESTIONS,
        result=result,
    )

    if not pdf_buffer:
        raise HTTPException(status_code=500, detail="PDF generation failed")

    pdf_bytes = pdf_buffer.getvalue()

    if not pdf_bytes:
        raise HTTPException(status_code=500, detail="Empty PDF generated")

    print("PDF BUFFER TYPE:", type(pdf_buffer))
    print("PDF BYTES LENGTH:", len(pdf_bytes))

    body = build_ultimate_email_html(
        test_type="phq9",
        result=result,
        user_name=extract_username_from_email(current_user.email),
    )

    # Send Email (handle SMTP errors)
    try:
        send_email_with_pdf(
            to_email=current_user.email,
            subject="Your PHQ-9 Assessment Report",
            body=body,
            pdf_bytes=pdf_bytes,
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to send email: {e}")

    return {
        "message": "Assessment completed. Report sent to email.",
        "result": result,
    }
