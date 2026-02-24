from __future__ import annotations
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, WebSocket
from app.yjs_server import handle_yjs_ws
from .ws.routes import router as ws_router

import sys
import asyncio

if sys.platform.startswith("win"):
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
app = FastAPI()


@app.websocket("/yjs/{room_id}")
async def yjs_ws(ws: WebSocket, room_id: str):
    await handle_yjs_ws(ws, room_id)
    
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health():
    return {"ok": True}

app.include_router(ws_router)
