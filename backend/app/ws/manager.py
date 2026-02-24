from __future__ import annotations

import asyncio
from collections import defaultdict
from typing import Dict, Set

from fastapi import WebSocket


class RoomManager:
    def __init__(self) -> None:
        self._rooms: Dict[str, Set[WebSocket]] = defaultdict(set)
        self._lock = asyncio.Lock()

        # Один run за раз на комнату
        self._run_locks: Dict[str, asyncio.Lock] = defaultdict(asyncio.Lock)

    async def connect(self, room_id: str, ws: WebSocket) -> None:
        await ws.accept()
        async with self._lock:
            self._rooms[room_id].add(ws)

    async def disconnect(self, room_id: str, ws: WebSocket) -> None:
        async with self._lock:
            if room_id in self._rooms:
                self._rooms[room_id].discard(ws)
                if not self._rooms[room_id]:
                    del self._rooms[room_id]

    def get_run_lock(self, room_id: str) -> asyncio.Lock:

        return self._run_locks[room_id]

    async def broadcast_json(self, room_id: str, payload: dict) -> None:
        async with self._lock:
            conns = list(self._rooms.get(room_id, set()))

        dead: list[WebSocket] = []
        for ws in conns:
            try:
                await ws.send_json(payload)
            except Exception:
                dead.append(ws)

        if dead:
            async with self._lock:
                for ws in dead:
                    self._rooms.get(room_id, set()).discard(ws)
                if room_id in self._rooms and not self._rooms[room_id]:
                    del self._rooms[room_id]
