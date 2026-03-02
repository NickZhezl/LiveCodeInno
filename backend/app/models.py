from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Boolean, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Room(Base):
    __tablename__ = "rooms"

    id = Column(String, primary_key=True, index=True)
    language = Column(String, default="python")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    leaderboard_entries = relationship("LeaderboardEntry", back_populates="room", cascade="all, delete-orphan")
    code_versions = relationship("CodeVersion", back_populates="room", cascade="all, delete-orphan")
    problem_states = relationship("RoomProblemState", back_populates="room", cascade="all, delete-orphan")


class LeaderboardEntry(Base):
    __tablename__ = "leaderboard"

    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(String, ForeignKey("rooms.id"), nullable=False)
    user_name = Column(String, nullable=False)
    problem_id = Column(String, nullable=False)
    problem_title = Column(String, nullable=False)
    time_seconds = Column(Float, nullable=False)
    language = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    room = relationship("Room", back_populates="leaderboard_entries")

    __table_args__ = (
        Index("idx_leaderboard_room_problem", "room_id", "problem_id"),
        Index("idx_leaderboard_time", "time_seconds"),
    )


class CodeVersion(Base):
    __tablename__ = "code_versions"

    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(String, ForeignKey("rooms.id"), nullable=False)
    file_name = Column(String, default="main.py")
    code = Column(Text, nullable=False)
    language = Column(String, default="python")
    saved_by = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    room = relationship("Room", back_populates="code_versions")


class RoomProblemState(Base):
    __tablename__ = "room_problem_states"

    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(String, ForeignKey("rooms.id"), nullable=False)
    problem_id = Column(String, nullable=False)
    user_name = Column(String, nullable=False)
    is_solved = Column(Boolean, default=False)
    time_seconds = Column(Float, nullable=True)
    output = Column(Text, nullable=True)
    expected_output = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    room = relationship("Room", back_populates="problem_states")

    __table_args__ = (
        Index("idx_problem_state_room_user", "room_id", "user_name", "problem_id", unique=True),
    )
