# app/assessment.py

from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, field_validator


# =========================
# Enums
# =========================
class DifficultyLevel(str, Enum):
    NOT_DIFFICULT = "not_difficult"
    SOMEWHAT_DIFFICULT = "somewhat_difficult"
    VERY_DIFFICULT = "very_difficult"
    EXTREMELY_DIFFICULT = "extremely_difficult"


# =========================
# Questions
# =========================
GAD7_QUESTIONS = [
    "Feeling nervous, anxious, or on edge",
    "Not being able to stop or control worrying",
    "Worrying too much about different things",
    "Trouble relaxing",
    "Being so restless that it's hard to sit still",
    "Becoming easily annoyed or irritable",
    "Feeling afraid as if something awful might happen",
]

GAD7_OPTIONS = [
    "Not at all (0)",
    "Several days (1)",
    "Over half the days (2)",
    "Nearly every day (3)",
]

PHQ9_QUESTIONS = [
    "Feeling down, depressed, irritable, or hopeless?",
    "Little interest or pleasure in doing things?",
    "Trouble falling asleep, staying asleep, or sleeping too much?",
    "Poor appetite, weight loss, or overeating?",
    "Feeling tired, or having little energy?",
    "Feeling bad about yourself – or feeling that you are a failure?",
    "Trouble concentrating on things like reading or watching TV?",
    "Moving or speaking slowly or being very restless?",
    "Thoughts of self-harm or being better off dead?",
]

PHQ9_OPTIONS = [
    "Not at all (0)",
    "Several days (1)",
    "More than half the days (2)",
    "Nearly every day (3)",
]


# =========================
# Request / Response Models
# =========================
class AssessmentRequest(BaseModel):
    responses: List[int]
    difficulty: DifficultyLevel

    @field_validator("responses")
    def validate_responses(cls, v):
        if not all(isinstance(i, int) and 0 <= i <= 3 for i in v):
            raise ValueError("Responses must be integers between 0 and 3")
        return v


class AssessmentResult(BaseModel):
    total_score: int
    severity: str
    interpretation: str
    recommendations: List[str]
    difficulty_impact: str
    crisis_alert: bool = False
    crisis_message: Optional[str] = None


# =========================
# Helpers
# =========================
def get_difficulty_impact(level: DifficultyLevel) -> str:
    return {
        DifficultyLevel.NOT_DIFFICULT: "Minimal impact",
        DifficultyLevel.SOMEWHAT_DIFFICULT: "Some impact",
        DifficultyLevel.VERY_DIFFICULT: "Significant impact",
        DifficultyLevel.EXTREMELY_DIFFICULT: "Severe impact",
    }[level]


# =========================
# GAD-7 Logic
# =========================
def calculate_gad7_score(
    responses: List[int], difficulty: DifficultyLevel
) -> AssessmentResult:
    total_score = sum(responses)

    if total_score <= 4:
        severity = "Minimal Anxiety"
        interpretation = "Minimal anxiety symptoms"
        recommendations = [
            "Maintain healthy habits",
            "Stay active",
            "Practice mindfulness",
        ]
    elif total_score <= 9:
        severity = "Mild Anxiety"
        interpretation = "Mild anxiety - monitor symptoms"
        recommendations = ["Exercise", "Relaxation techniques", "Monitor stress"]
    elif total_score <= 14:
        severity = "Moderate Anxiety"
        interpretation = "Moderate anxiety - consider professional help"
        recommendations = ["Therapy (CBT)", "Stress management", "Routine care"]
    else:
        severity = "Severe Anxiety"
        interpretation = "Severe anxiety - seek immediate help"
        recommendations = ["Consult psychiatrist", "Therapy + medication"]

    difficulty_impact = get_difficulty_impact(difficulty)

    crisis_alert = difficulty in [
        DifficultyLevel.VERY_DIFFICULT,
        DifficultyLevel.EXTREMELY_DIFFICULT,
    ]

    crisis_message = (
        "National Mental Health Helpline: 1800-599-0019" if crisis_alert else None
    )

    return AssessmentResult(
        total_score=total_score,
        severity=severity,
        interpretation=interpretation,
        recommendations=recommendations,
        difficulty_impact=difficulty_impact,
        crisis_alert=crisis_alert,
        crisis_message=crisis_message,
    )


# =========================
# PHQ-9 Logic
# =========================
def calculate_phq9_score(
    responses: List[int],
    difficulty: DifficultyLevel,
    serious_thoughts: bool = False,
) -> AssessmentResult:
    total_score = sum(responses)
    q9_score = responses[8]

    if total_score <= 4:
        severity = "Minimal Depression"
        interpretation = "Minimal symptoms"
        recommendations = ["Stay active", "Maintain routine"]
    elif total_score <= 9:
        severity = "Mild Depression"
        interpretation = "Mild depression"
        recommendations = ["Exercise", "Talk to someone"]
    elif total_score <= 14:
        severity = "Moderate Depression"
        interpretation = "Moderate depression"
        recommendations = ["Therapy recommended"]
    elif total_score <= 19:
        severity = "Moderately Severe Depression"
        interpretation = "Serious condition"
        recommendations = ["Urgent professional help"]
    else:
        severity = "Severe Depression"
        interpretation = "Emergency condition"
        recommendations = ["Immediate psychiatric care"]

    difficulty_impact = get_difficulty_impact(difficulty)

    crisis_alert = False
    crisis_message = None

    if q9_score >= 2 or serious_thoughts:
        crisis_alert = True
        crisis_message = (
            "Call immediately:\n1800-599-0019\niCall: 9152987821\nEmergency: 108"
        )

    return AssessmentResult(
        total_score=total_score,
        severity=severity,
        interpretation=interpretation,
        recommendations=recommendations,
        difficulty_impact=difficulty_impact,
        crisis_alert=crisis_alert,
        crisis_message=crisis_message,
    )
