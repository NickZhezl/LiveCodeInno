from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db, init_db
from app.models import Room, LeaderboardEntry, CodeVersion, RoomProblemState
from app.schemas import (
    RoomCreate,
    RoomResponse,
    LeaderboardEntryCreate,
    LeaderboardEntryResponse,
    CodeVersionCreate,
    CodeVersionResponse,
    ProblemStateUpdate,
    ProblemStateResponse,
)
from typing import List, Optional

router = APIRouter()


@router.on_event("startup")
async def startup():
    await init_db()


# ============== ROOMS ==============

@router.post("/rooms", response_model=RoomResponse)
async def create_room(room: RoomCreate, db: AsyncSession = Depends(get_db)):
    db_room = Room(id=room.id, language=room.language)
    db.add(db_room)
    await db.commit()
    await db.refresh(db_room)
    return db_room


@router.get("/rooms/{room_id}", response_model=RoomResponse)
async def get_room(room_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Room).where(Room.id == room_id))
    room = result.scalar_one_or_none()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room


@router.put("/rooms/{room_id}", response_model=RoomResponse)
async def update_room(room_id: str, language: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Room).where(Room.id == room_id))
    room = result.scalar_one_or_none()
    if not room:
        # Create room if doesn't exist
        room = Room(id=room_id, language=language)
        db.add(room)
    else:
        room.language = language
    await db.commit()
    await db.refresh(room)
    return room


# ============== LEADERBOARD ==============

@router.post("/rooms/{room_id}/leaderboard", response_model=LeaderboardEntryResponse)
async def add_leaderboard_entry(
    room_id: str,
    entry: LeaderboardEntryCreate,
    db: AsyncSession = Depends(get_db)
):
    # Check if user already has a time for this problem
    result = await db.execute(
        select(LeaderboardEntry)
        .where(LeaderboardEntry.room_id == room_id)
        .where(LeaderboardEntry.user_name == entry.user_name)
        .where(LeaderboardEntry.problem_id == entry.problem_id)
    )
    existing = result.scalar_one_or_none()

    if existing:
        # Update if new time is better
        if entry.time_seconds < existing.time_seconds:
            existing.time_seconds = entry.time_seconds
            await db.commit()
            await db.refresh(existing)
            return existing
        return existing

    # Create new entry
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


@router.get("/rooms/{room_id}/leaderboard", response_model=List[LeaderboardEntryResponse])
async def get_leaderboard(
    room_id: str,
    problem_id: Optional[str] = None,
    limit: int = 10,
    db: AsyncSession = Depends(get_db)
):
    query = select(LeaderboardEntry).where(LeaderboardEntry.room_id == room_id)

    if problem_id:
        query = query.where(LeaderboardEntry.problem_id == problem_id)

    query = query.order_by(LeaderboardEntry.time_seconds.asc()).limit(limit)

    result = await db.execute(query)
    entries = result.scalars().all()
    return entries


# ============== CODE VERSIONS ==============

@router.post("/rooms/{room_id}/code", response_model=CodeVersionResponse)
async def save_code_version(
    room_id: str,
    version: CodeVersionCreate,
    db: AsyncSession = Depends(get_db)
):
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
    return db_version


@router.get("/rooms/{room_id}/code", response_model=List[CodeVersionResponse])
async def get_code_versions(
    room_id: str,
    limit: int = 20,
    db: AsyncSession = Depends(get_db)
):
    query = (
        select(CodeVersion)
        .where(CodeVersion.room_id == room_id)
        .order_by(CodeVersion.created_at.desc())
        .limit(limit)
    )
    result = await db.execute(query)
    versions = result.scalars().all()
    return versions


# ============== PROBLEM STATES ==============

@router.post("/rooms/{room_id}/problem-state", response_model=ProblemStateResponse)
async def update_problem_state(
    room_id: str,
    state: ProblemStateUpdate,
    db: AsyncSession = Depends(get_db)
):
    # Check if state exists
    result = await db.execute(
        select(RoomProblemState)
        .where(RoomProblemState.room_id == room_id)
        .where(RoomProblemState.user_name == state.user_name)
        .where(RoomProblemState.problem_id == state.problem_id)
    )
    existing = result.scalar_one_or_none()

    if existing:
        existing.is_solved = state.is_solved
        existing.time_seconds = state.time_seconds
        existing.output = state.output
        existing.expected_output = state.expected_output
        await db.commit()
        await db.refresh(existing)
        return existing

    # Create new state
    db_state = RoomProblemState(
        room_id=room_id,
        problem_id=state.problem_id,
        user_name=state.user_name,
        is_solved=state.is_solved,
        time_seconds=state.time_seconds,
        output=state.output,
        expected_output=state.expected_output,
    )
    db.add(db_state)
    await db.commit()
    await db.refresh(db_state)
    return db_state


@router.get("/rooms/{room_id}/problem-states", response_model=List[ProblemStateResponse])
async def get_problem_states(
    room_id: str,
    user_name: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(RoomProblemState).where(RoomProblemState.room_id == room_id)

    if user_name:
        query = query.where(RoomProblemState.user_name == user_name)

    result = await db.execute(query)
    states = result.scalars().all()
    return states
