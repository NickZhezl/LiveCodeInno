from __future__ import annotations

import asyncio
from pathlib import Path

from fastapi import WebSocket

from ypy_websocket import WebsocketServer
from ypy_websocket.ystore import SQLiteYStore


def create_yjs_server() -> WebsocketServer:
    """
    Yjs server (Y-Py) with persistence on SQLite.
    Docs are stored per room_id. This allows reconnect + history.
    """
    data_dir = Path(__file__).resolve().parent.parent / "data"
    data_dir.mkdir(parents=True, exist_ok=True)

    store_path = data_dir / "yjs.sqlite3"
    ystore = SQLiteYStore(str(store_path))
    return WebsocketServer(ystore=ystore)


# Один сервер на процесс
YJS_SERVER = create_yjs_server()


async def handle_yjs_ws(ws: WebSocket, room_id: str) -> None:
    """
    Bridge FastAPI WebSocket -> ypy-websocket server.
    room_id is used as a Yjs "document name".
    """
    await ws.accept()

    # ypy-websocket expects an object with .send_bytes / .receive_bytes,
    # FastAPI WebSocket provides these methods already.
    # We wrap minimal adapter to match expectations.
    class _Adapter:
        def __init__(self, websocket: WebSocket):
            self.ws = websocket

        async def send(self, data: bytes) -> None:
            await self.ws.send_bytes(data)

        async def recv(self) -> bytes:
            return await self.ws.receive_bytes()

        async def close(self) -> None:
            await self.ws.close()

    adapter = _Adapter(ws)

    # Serve one connection
    # Internally it will manage sync messages for that doc name
    await YJS_SERVER.serve(adapter, room_id)