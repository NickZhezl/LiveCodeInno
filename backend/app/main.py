from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import WebSocket

from app.routes import router as api_router
from app.ws.routes import router as ws_router
from app.yjs_server import handle_yjs_ws
from app.config import settings

import sys
import asyncio

if sys.platform.startswith("win"):
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

app = FastAPI(title="LiveCodeInno API")

# CORS
cors_origins = settings.CORS_ORIGINS.split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Yjs WebSocket for collaborative editing
@app.websocket("/yjs/{room_id}")
async def yjs_ws(ws: WebSocket, room_id: str):
    await handle_yjs_ws(ws, room_id)

# Include routers
app.include_router(api_router, prefix="/api")
app.include_router(ws_router, prefix="/api")


@app.get("/health")
def health():
    return {"ok": True, "service": "livecodeinno-api"}
