#!/bin/sh
mkdir -p /app/alembic/versions
echo "Running Alembic Upgrades"
alembic upgrade head
echo "Starting Uvicorn"
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
