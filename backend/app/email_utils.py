import os
import smtplib
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from dotenv import load_dotenv

load_dotenv()

SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")


# -----------------------------
# PREMIUM EMAIL HTML BUILDER
# -----------------------------
def build_ultimate_email_html(test_type: str, result, user_name: str = "there") -> str:

    # Dynamic severity styling
    severity = result.severity.lower()

    if "severe" in severity:
        accent = "#ef4444"  # red
    elif "moderate" in severity:
        accent = "#f59e0b"  # amber
    else:
        accent = "#22c55e"  # green

    return f"""
    <html>
    <head>
        <style>
            body {{
                margin: 0;
                padding: 0;
                background: #f4f6fb;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
                color: #111827;
            }}

            .container {{
                max-width: 680px;
                margin: 40px auto;
                background: #ffffff;
                border-radius: 18px;
                overflow: hidden;
                box-shadow: 0 12px 40px rgba(0,0,0,0.08);
            }}

            .topbar {{
                height: 6px;
                background: {accent};
            }}

            .header {{
                padding: 28px;
            }}

            .title {{
                font-size: 20px;
                font-weight: 700;
                margin: 0;
            }}

            .subtext {{
                margin-top: 6px;
                font-size: 13px;
                color: #6b7280;
            }}

            .grid {{
                display: flex;
                justify-content: space-between;
                padding: 0 28px;
                gap: 12px;
            }}

            .card {{
                flex: 1;
                background: #f9fafb;
                border: 1px solid #eee;
                padding: 14px;
                border-radius: 14px;
            }}

            .score {{
                font-size: 32px;
                font-weight: 800;
                color: {accent};
            }}

            .label {{
                font-size: 12px;
                color: #6b7280;
            }}

            .section {{
                padding: 0 28px;
                margin-top: 20px;
            }}

            .section h3 {{
                font-size: 14px;
                margin-bottom: 8px;
            }}

            .box {{
                background: #fafafa;
                border: 1px solid #eee;
                border-radius: 12px;
                padding: 14px;
                font-size: 13px;
                color: #4b5563;
                line-height: 1.6;
            }}

            ul {{
                margin: 0;
                padding-left: 18px;
                font-size: 13px;
                color: #4b5563;
            }}

            li {{
                margin-bottom: 6px;
            }}

            .insight {{
                margin: 20px 28px;
                padding: 16px;
                background: linear-gradient(135deg, #eef2ff, #f5f3ff);
                border: 1px solid #e0e7ff;
                border-radius: 14px;
                font-size: 13px;
                color: #374151;
            }}

            .cta {{
                margin: 24px 28px;
                padding: 18px;
                border-radius: 14px;
                background: {accent};
                color: white;
                text-align: center;
            }}

            .cta h3 {{
                margin: 0;
                font-size: 15px;
            }}

            .cta p {{
                margin-top: 6px;
                font-size: 12px;
                opacity: 0.9;
            }}

            .footer {{
                text-align: center;
                font-size: 11px;
                color: #9ca3af;
                padding: 18px;
                border-top: 1px solid #eee;
            }}
        </style>
    </head>

    <body>
        <div class="container">

            <div class="topbar"></div>

            <div class="header">
                <h1 class="title">Hi {user_name}, your assessment report is ready</h1>
                <div class="subtext">
                    A structured psychological screening summary based on validated clinical scales
                </div>
            </div>

            <div class="grid">

                <div class="card">
                    <div class="label">Total Score</div>
                    <div class="score">{result.total_score}</div>
                </div>

                <div class="card">
                    <div class="label">Severity Level</div>
                    <div style="font-size:16px;font-weight:700;margin-top:6px;color:{accent};">
                        {result.severity}
                    </div>
                </div>

                <div class="card">
                    <div class="label">Test Type</div>
                    <div style="font-size:16px;font-weight:700;margin-top:6px;">
                        {test_type.upper()}
                    </div>
                </div>

            </div>

            <div class="insight">
                <b>Clinical Insight:</b><br/>
                {result.interpretation}
            </div>

            <div class="section">
                <h3>Functional Impact</h3>
                <div class="box">
                    {result.difficulty_impact}
                </div>
            </div>

            <div class="section">
                <h3>Recommended Actions</h3>
                <div class="box">
                    <ul>
                        {"".join(f"<li>{r}</li>" for r in result.recommendations)}
                    </ul>
                </div>
            </div>

            <div class="cta">
                <h3>Support matters</h3>
                <p>
                    If symptoms are affecting your daily life, consider speaking with a licensed mental health professional.
                    Early support improves outcomes significantly.
                </p>
            </div>

            <div class="footer">
                This report is not a medical diagnosis.<br/>
                It is intended for educational and informational purposes only.
            </div>

        </div>
    </body>
    </html>
    """


# -----------------------------
# EMAIL SENDER (SMTP)
# -----------------------------
def send_email_with_pdf(to_email: str, subject: str, body: str, pdf_bytes: bytes):

    # -----------------------------
    # STRICT ENV VALIDATION
    # -----------------------------
    if not SMTP_HOST:
        raise ValueError("SMTP_HOST is not set in environment variables")

    if not SMTP_PORT:
        raise ValueError("SMTP_PORT is not set in environment variables")

    if not SMTP_USER:
        raise ValueError("SMTP_USER is not set in environment variables")

    if not SMTP_PASSWORD:
        raise ValueError("SMTP_PASSWORD is not set in environment variables")

    if not pdf_bytes:
        raise ValueError("PDF is empty or None")

    # -----------------------------
    # BUILD EMAIL
    # -----------------------------
    msg = MIMEMultipart()
    msg["From"] = SMTP_USER
    msg["To"] = to_email
    msg["Subject"] = subject

    msg.attach(MIMEText(body, "html"))

    part = MIMEApplication(pdf_bytes, _subtype="pdf")
    part.add_header(
        "Content-Disposition",
        "attachment",
        filename="assessment_report.pdf",
    )
    msg.attach(part)

    # -----------------------------
    # SMTP CONNECTION
    # -----------------------------
    server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
    server.starttls()

    server.login(SMTP_USER, SMTP_PASSWORD)
    server.send_message(msg)
    server.quit()

    return {"status": "sent"}
