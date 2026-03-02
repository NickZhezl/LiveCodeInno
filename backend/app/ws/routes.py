from __future__ import annotations

import time
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.exec.docker_runner import run_python_stream
from app.ws.manager import RoomManager
from app.database import async_session_maker
from app.models import LeaderboardEntry, RoomProblemState

router = APIRouter()
rooms = RoomManager()


@router.websocket("/ws/rooms/{room_id}")
async def room_ws(ws: WebSocket, room_id: str):
    await rooms.connect(room_id, ws)
    
    async with async_session_maker() as db:
        await rooms.broadcast_json(room_id, {
            "type": "room.joined",
            "room_id": room_id,
        })

    try:
        while True:
            msg = await ws.receive_json()
            msg_type = msg.get("type")

            # Cursor position update
            if msg_type == "cursor.update":
                await rooms.broadcast_json(room_id, {
                    "type": "cursor.update",
                    "room_id": room_id,
                    "user_name": msg.get("user_name"),
                    "line_number": msg.get("line_number"),
                    "column": msg.get("column"),
                    "color": msg.get("color"),
                })
                continue

            # Code run request
            if msg_type == "run.request":
                lang = msg.get("lang", "python")
                code = msg.get("code", "")
                user_name = msg.get("user_name", "anonymous")
                problem_id = msg.get("problem_id", "")
                run_id = f"run-{int(time.time() * 1000)}"

                run_lock = rooms.get_run_lock(room_id)
                if run_lock.locked():
                    await ws.send_json({
                        "type": "run.busy",
                        "room_id": room_id,
                        "message": "В комнате уже выполняется код. Подожди завершения.",
                    })
                    continue

                async with run_lock:
                    await rooms.broadcast_json(room_id, {
                        "type": "run.start",
                        "room_id": room_id,
                        "run_id": run_id,
                        "lang": lang,
                        "user_name": user_name,
                    })

                    if lang != "python":
                        await rooms.broadcast_json(room_id, {
                            "type": "run.stderr",
                            "room_id": room_id,
                            "run_id": run_id,
                            "chunk": "Пока поддерживается только python\n",
                        })
                        await rooms.broadcast_json(room_id, {
                            "type": "run.end",
                            "room_id": room_id,
                            "run_id": run_id,
                            "exit_code": 1,
                        })
                        continue

                    try:
                        event_iter, wait_task = await run_python_stream(code)

                        async for ev in event_iter:
                            stream = ev.get("stream")
                            chunk = ev.get("chunk", "")
                            if not chunk:
                                continue

                            if stream == "stderr":
                                await rooms.broadcast_json(room_id, {
                                    "type": "run.stderr",
                                    "room_id": room_id,
                                    "run_id": run_id,
                                    "chunk": chunk,
                                })
                            else:
                                await rooms.broadcast_json(room_id, {
                                    "type": "run.stdout",
                                    "room_id": room_id,
                                    "run_id": run_id,
                                    "chunk": chunk,
                                })

                        exit_code = await wait_task

                        await rooms.broadcast_json(room_id, {
                            "type": "run.end",
                            "room_id": room_id,
                            "run_id": run_id,
                            "exit_code": exit_code,
                        })

                    except Exception as e:
                        await rooms.broadcast_json(room_id, {
                            "type": "run.stderr",
                            "room_id": room_id,
                            "run_id": run_id,
                            "chunk": f"Server error: {str(e)}\n",
                        })
                        await rooms.broadcast_json(room_id, {
                            "type": "run.end",
                            "room_id": room_id,
                            "run_id": run_id,
                            "exit_code": 1,
                        })
                continue

            # Leaderboard submission
            if msg_type == "leaderboard.submit":
                async with async_session_maker() as db:
                    entry = LeaderboardEntry(
                        room_id=room_id,
                        user_name=msg.get("user_name"),
                        problem_id=msg.get("problem_id"),
                        problem_title=msg.get("problem_title"),
                        time_seconds=msg.get("time_seconds"),
                        language=msg.get("language"),
                    )
                    db.add(entry)
                    await db.commit()
                    
                    await rooms.broadcast_json(room_id, {
                        "type": "leaderboard.updated",
                        "room_id": room_id,
                    })
                continue

            # Broadcast other messages
            await rooms.broadcast_json(room_id, {
                "type": "room.message",
                "room_id": room_id,
                "data": msg,
            })

    except WebSocketDisconnect:
        await rooms.disconnect(room_id, ws)
        
        # Notify others that user left
        await rooms.broadcast_json(room_id, {
            "type": "room.left",
            "room_id": room_id,
        })
