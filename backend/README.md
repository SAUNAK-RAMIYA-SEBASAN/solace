# Solace Backend API

A scalable and secure backend service for the Solace Mental Health Assessment platform, built using FastAPI. This service handles user authentication, mental health assessments (GAD-7 and PHQ-9), PDF report generation, and email delivery.

---

## Overview

The backend provides RESTful APIs for:

- User authentication (JWT-based)
- Mental health assessments (GAD-7, PHQ-9)
- Score calculation and interpretation
- PDF report generation
- Email delivery of reports
- Data persistence using a relational database

---

## Tech Stack

- FastAPI
- Python 3.10+
- SQLModel (ORM)
- PostgreSQL / SQLite
- Docker & Docker Compose
- Nginx (reverse proxy)
- ReportLab (PDF generation)
- SMTP (email service)

---

## Project Structure

```

app/
│
├── main.py              # Application entry point
├── models.py            # Database models
├── database.py          # DB connection and session
├── auth.py              # JWT authentication logic
├── assessment.py        # Assessment logic (GAD-7, PHQ-9)
├── reports.py           # PDF generation
├── email_utils.py       # Email sending logic
│
└── routes/
├── auth.py          # Auth routes
└── assessment.py    # Assessment routes

```

---

## Features

### Authentication
- User signup and login
- JWT-based authentication
- Protected routes

### Assessments
- GAD-7 (Anxiety)
- PHQ-9 (Depression)
- Severity classification
- Crisis detection

### Reports
- Professional PDF report generation
- Email delivery with attachment

---

## API Endpoints

### Auth

| Method | Endpoint        | Description       |
|--------|----------------|------------------|
| POST   | /auth/signup   | Register user    |
| POST   | /auth/login    | Login user       |

---

### Assessment

| Method | Endpoint                      | Description                  |
|--------|-------------------------------|------------------------------|
| GET    | /assessment/gad7/questions    | Get GAD-7 questions          |
| POST   | /assessment/gad7              | Submit GAD-7 assessment      |
| GET    | /assessment/phq9/questions    | Get PHQ-9 questions          |
| POST   | /assessment/phq9              | Submit PHQ-9 assessment      |

---
