from __future__ import annotations

import sys
import asyncio
import warnings


warnings.filterwarnings(
    "ignore",
    message=".*WindowsProactorEventLoopPolicy.*deprecated.*",
    category=DeprecationWarning,
)
warnings.filterwarnings(
    "ignore",
    message=".*asyncio.set_event_loop_policy.*deprecated.*",
    category=DeprecationWarning,
)

# ВАЖНО: ставим политику ДО запуска uvicorn
if sys.platform.startswith("win"):
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

import uvicorn

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=False)
