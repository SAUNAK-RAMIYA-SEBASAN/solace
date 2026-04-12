# ---- Build stage ----
FROM python:3.12.11-slim AS builder

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

WORKDIR /app

# Copy dependency files first for layer caching
COPY requirements.txt .

# Install dependencies into a virtual environment
RUN uv venv .venv && \
    uv pip install --python .venv/bin/python -r requirements.txt

# ---- Runtime stage ----
FROM python:3.12.11-slim AS runtime

WORKDIR /app

# Copy the venv from builder
COPY --from=builder /app/.venv .venv

# Copy application code
COPY . .

# Make sure the venv binaries are on PATH
ENV PATH="/app/.venv/bin:$PATH"

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
