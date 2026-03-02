from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase, Session
from sqlalchemy import select, Column, Integer, String, Text, Float, DateTime, ForeignKey, Boolean, Index, func
from sqlalchemy.sql import func as sql_func
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import os
import json
import asyncio

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./livecodeinno.db")

engine = create_async_engine(DATABASE_URL, echo=False)
async_session_maker = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

# Models
class Room(Base):
    __tablename__ = "rooms"
    id = Column(String, primary_key=True, index=True)
    language = Column(String, default="python")
    created_at = Column(DateTime(timezone=True), server_default=sql_func.now())

class LeaderboardEntry(Base):
    __tablename__ = "leaderboard"
    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(String, ForeignKey("rooms.id"), nullable=False)
    user_name = Column(String, nullable=False)
    problem_id = Column(String, nullable=False)
    problem_title = Column(String, nullable=False)
    time_seconds = Column(Float, nullable=False)
    language = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=sql_func.now())

class CodeVersion(Base):
    __tablename__ = "code_versions"
    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(String, ForeignKey("rooms.id"), nullable=False)
    file_name = Column(String, default="main.py")
    code = Column(Text, nullable=False)
    language = Column(String, default="python")
    saved_by = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=sql_func.now())

# Create tables
async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# Pydantic schemas
class RoomCreate(BaseModel):
    id: str
    language: str = "python"

class RoomResponse(BaseModel):
    id: str
    language: str
    class Config:
        from_attributes = True

class LeaderboardEntryCreate(BaseModel):
    user_name: str
    problem_id: str
    problem_title: str
    time_seconds: float
    language: str

class LeaderboardEntryResponse(BaseModel):
    id: int
    room_id: str
    user_name: str
    problem_id: str
    problem_title: str
    time_seconds: float
    language: str
    created_at: datetime
    class Config:
        from_attributes = True

class CodeVersionCreate(BaseModel):
    file_name: Optional[str] = "main.py"
    code: str
    language: Optional[str] = "python"
    saved_by: Optional[str] = None

# FastAPI app
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await init_db()

# API Routes
@app.get("/api/health")
def health():
    return {"ok": True, "service": "livecodeinno-api"}

@app.post("/api/rooms", response_model=RoomResponse)
async def create_room(room: RoomCreate):
    async with async_session_maker() as db:
        db_room = Room(id=room.id, language=room.language)
        db.add(db_room)
        await db.commit()
        await db.refresh(db_room)
        return db_room

@app.get("/api/rooms/{room_id}", response_model=RoomResponse)
async def get_room(room_id: str):
    async with async_session_maker() as db:
        result = await db.execute(select(Room).where(Room.id == room_id))
        room = result.scalar_one_or_none()
        if not room:
            raise HTTPException(status_code=404, detail="Room not found")
        return room

@app.put("/api/rooms/{room_id}", response_model=RoomResponse)
async def update_room(room_id: str, language: str):
    async with async_session_maker() as db:
        result = await db.execute(select(Room).where(Room.id == room_id))
        room = result.scalar_one_or_none()
        if not room:
            room = Room(id=room_id, language=language)
            db.add(room)
        else:
            room.language = language
        await db.commit()
        await db.refresh(room)
        return room

@app.post("/api/rooms/{room_id}/leaderboard", response_model=LeaderboardEntryResponse)
async def add_leaderboard_entry(room_id: str, entry: LeaderboardEntryCreate):
    async with async_session_maker() as db:
        result = await db.execute(
            select(LeaderboardEntry)
            .where(LeaderboardEntry.room_id == room_id)
            .where(LeaderboardEntry.user_name == entry.user_name)
            .where(LeaderboardEntry.problem_id == entry.problem_id)
        )
        existing = result.scalar_one_or_none()
        if existing:
            if entry.time_seconds < existing.time_seconds:
                existing.time_seconds = entry.time_seconds
                await db.commit()
                await db.refresh(existing)
                return existing
            return existing
        db_entry = LeaderboardEntry(
            room_id=room_id,
            user_name=entry.user_name,
            problem_id=entry.problem_id,
            problem_title=entry.problem_title,
            time_seconds=entry.time_seconds,
            language=entry.language,
        )
        db.add(db_entry)
        await db.commit()
        await db.refresh(db_entry)
        return db_entry

@app.get("/api/rooms/{room_id}/leaderboard", response_model=List[LeaderboardEntryResponse])
async def get_leaderboard(room_id: str, problem_id: Optional[str] = None, limit: int = 10):
    async with async_session_maker() as db:
        query = select(LeaderboardEntry).where(LeaderboardEntry.room_id == room_id)
        if problem_id:
            query = query.where(LeaderboardEntry.problem_id == problem_id)
        query = query.order_by(LeaderboardEntry.time_seconds.asc()).limit(limit)
        result = await db.execute(query)
        entries = result.scalars().all()
        return entries

@app.post("/api/rooms/{room_id}/code", response_model=CodeVersionCreate)
async def save_code_version(room_id: str, version: CodeVersionCreate):
    async with async_session_maker() as db:
        db_version = CodeVersion(
            room_id=room_id,
            file_name=version.file_name,
            code=version.code,
            language=version.language,
            saved_by=version.saved_by,
        )
        db.add(db_version)
        await db.commit()
        await db.refresh(db_version)
        return version

@app.get("/api/rooms/{room_id}/code", response_model=List[CodeVersionCreate])
async def get_code_versions(room_id: str, limit: int = 20):
    async with async_session_maker() as db:
        query = (
            select(CodeVersion)
            .where(CodeVersion.room_id == room_id)
            .order_by(CodeVersion.created_at.desc())
            .limit(limit)
        )
        result = await db.execute(query)
        versions = result.scalars().all()
        return versions

# WebSocket for real-time updates
@app.websocket("/api/ws/rooms/{room_id}")
async def room_ws(websocket: WebSocket, room_id: str):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            # Broadcast to all connected clients
            await websocket.send_json({
                "type": "room.message",
                "room_id": room_id,
                "data": msg
            })
    except WebSocketDisconnect:
        pass

@app.websocket("/api/yjs/{room_id}")
async def yjs_ws(websocket: WebSocket, room_id: str):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_bytes()
            # Simple echo for Yjs sync
            await websocket.send_bytes(data)
    except WebSocketDisconnect:
        pass
