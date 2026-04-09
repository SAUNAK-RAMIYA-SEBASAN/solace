# app/reports.py

from datetime import datetime
from io import BytesIO
from typing import List

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

PURPLE = colors.HexColor("#6C4CF1")
LIGHT_PURPLE = colors.HexColor("#F4F1FF")

TEXT_DARK = colors.HexColor("#2E2E2E")
TEXT_LIGHT = colors.HexColor("#6B6B6B")

GREEN = colors.HexColor("#2ECC71")
YELLOW = colors.HexColor("#F1C40F")
ORANGE = colors.HexColor("#E67E22")
RED = colors.HexColor("#E74C3C")


def get_severity_color(severity: str):
    s = severity.lower()
    if "minimal" in s:
        return GREEN
    if "mild" in s:
        return YELLOW
    if "moderate" in s:
        return ORANGE
    return RED


def generate_assessment_pdf(
    email: str, test_type: str, responses: List[int], questions: List[str], result
) -> BytesIO:
    buffer = BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=30,
        leftMargin=30,
        topMargin=20,
        bottomMargin=20,
    )

    styles = getSampleStyleSheet()
    severity_color = get_severity_color(result.severity)

    # Compact Styles
    header_title = ParagraphStyle(
        "HeaderTitle",
        parent=styles["Title"],
        textColor=colors.white,
        alignment=1,
        fontSize=14,
    )

    header_sub = ParagraphStyle(
        "HeaderSub",
        parent=styles["Normal"],
        textColor=colors.white,
        alignment=1,
        fontSize=7,
    )

    section_title = ParagraphStyle(
        "Section",
        parent=styles["Heading2"],
        textColor=PURPLE,
        fontSize=11,
        spaceAfter=2,
    )

    body = ParagraphStyle(
        "Body",
        parent=styles["Normal"],
        textColor=TEXT_DARK,
        fontSize=9,
        leading=11,
    )

    muted = ParagraphStyle(
        "Muted",
        parent=styles["Normal"],
        textColor=TEXT_LIGHT,
        fontSize=7.5,
    )

    score_style = ParagraphStyle(
        "Score",
        parent=styles["Heading1"],
        textColor=severity_color,
        alignment=1,
        fontSize=18,
    )

    elements = []

    # Header (compact)
    header = Table(
        [
            [Paragraph("Mental Health Report", header_title)],
            [Paragraph("Confidential • Self Assessment", header_sub)],
        ],
        colWidths=[520],
    )

    header.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), PURPLE),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )

    elements.append(header)
    elements.append(Spacer(1, 8))

    # Info (compact)
    info = Table(
        [
            ["Email", email],
            ["Test", test_type.upper()],
            ["Date", datetime.now().strftime("%Y-%m-%d %H:%M")],
        ],
        colWidths=[80, 420],
    )

    info.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), LIGHT_PURPLE),
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )

    elements.append(info)
    elements.append(Spacer(1, 8))

    # Score Card (tight)
    score_card = Table(
        [
            [Paragraph(str(result.total_score), score_style)],
            [Paragraph(result.severity, body)],
        ],
        colWidths=[520],
    )

    score_card.setStyle(
        TableStyle(
            [
                ("BOX", (0, 0), (-1, -1), 1, severity_color),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ]
        )
    )

    elements.append(score_card)
    elements.append(Spacer(1, 6))

    # Summary inline (compact)
    elements.append(Paragraph(f"<b>Interpretation:</b> {result.interpretation}", body))
    elements.append(Paragraph(f"<b>Impact:</b> {result.difficulty_impact}", body))
    elements.append(Spacer(1, 6))

    # Recommendations (compact)
    elements.append(Paragraph("Recommendations", section_title))
    for rec in result.recommendations:
        elements.append(Paragraph(f"• {rec}", body))
    elements.append(Spacer(1, 6))

    # Scale
    elements.append(
        Paragraph(
            "0-Not at all | 1-Several days | 2-More than half | 3-Nearly every day",
            muted,
        )
    )
    elements.append(Spacer(1, 6))

    # Responses Table (tight)
    data = [["Question", "Score"]]

    for q, r in zip(questions, responses):
        data.append([q, str(r)])

    table = Table(data, colWidths=[400, 60])

    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), PURPLE),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                (
                    "ROWBACKGROUNDS",
                    (0, 1),
                    (-1, -1),
                    [colors.whitesmoke, colors.transparent],
                ),
                ("GRID", (0, 0), (-1, -1), 0.2, colors.grey),
                ("ALIGN", (1, 1), (-1, -1), "CENTER"),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )

    elements.append(table)

    # Crisis (compact)
    if result.crisis_alert and result.crisis_message:
        elements.append(Spacer(1, 6))
        elements.append(Paragraph(result.crisis_message, muted))

    # Footer (small)
    elements.append(Spacer(1, 8))
    elements.append(
        Paragraph(
            "For informational use only. Not a medical diagnosis.",
            muted,
        )
    )

    doc.build(elements)

    buffer.seek(0)
    return buffer
