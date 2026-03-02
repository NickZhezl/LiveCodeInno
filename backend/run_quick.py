"""
Quick start script for development without Docker
Uses SQLite instead of PostgreSQL for local testing
"""
import sys
import asyncio

# Set Windows event loop policy before importing uvicorn
if sys.platform.startswith("win"):
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

# Override database URL to use SQLite for quick testing
import os
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./livecodeinno.db"

import uvicorn

if __name__ == "__main__":
    print("=" * 60)
    print("  LiveCodeInno Backend - Quick Start (SQLite)")
    print("=" * 60)
    print()
    print("  Backend:  http://localhost:8000")
    print("  API Docs: http://localhost:8000/docs")
    print("  Health:   http://localhost:8000/health")
    print()
    print("  Note: Using SQLite for quick testing.")
    print("  For production, use PostgreSQL with Docker.")
    print()
    print("  Press Ctrl+C to stop")
    print("=" * 60)
    
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=False)
