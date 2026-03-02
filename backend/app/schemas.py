from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class RoomCreate(BaseModel):
    id: str
    language: str = "python"


class RoomResponse(BaseModel):
    id: str
    language: str
    created_at: datetime

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


class CodeVersionResponse(BaseModel):
    id: int
    room_id: str
    file_name: str
    code: str
    language: str
    saved_by: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class ProblemStateUpdate(BaseModel):
    problem_id: str
    user_name: str
    is_solved: bool
    time_seconds: Optional[float] = None
    output: Optional[str] = None
    expected_output: Optional[str] = None


class ProblemStateResponse(BaseModel):
    id: int
    room_id: str
    problem_id: str
    user_name: str
    is_solved: bool
    time_seconds: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True


class CursorPosition(BaseModel):
    user_name: str
    line_number: int
    column: int
    color: str


class RunCodeRequest(BaseModel):
    code: str
    language: str = "python"
