from __future__ import annotations

import asyncio
import os
from typing import AsyncIterator, Dict, Tuple

import aiodocker
from aiodocker.exceptions import DockerError

RUN_TIMEOUT_SEC = int(os.getenv("RUN_TIMEOUT_SEC", "10"))
PY_IMAGE = os.getenv("PY_IMAGE", "python:3.11-slim")


def _decode(x) -> str:
    if x is None:
        return ""
    if isinstance(x, (bytes, bytearray)):
        return x.decode("utf-8", errors="replace")
    if isinstance(x, str):
        return x
    return str(x)


async def _ensure_image(docker: aiodocker.Docker, image: str) -> None:
    try:
        await docker.images.inspect(image)
    except DockerError as e:
        if getattr(e, "status", None) == 404:
            await docker.images.pull(image)
        else:
            raise


async def run_python_stream(code: str) -> Tuple[AsyncIterator[Dict], asyncio.Task]:
    """
    Стримит stdout/stderr через container.log(follow=True).
    Возвращает:
      - async iterator событий {"stream":"stdout|stderr","chunk":str}
      - task ожидания завершения (await -> exit_code:int)

    Подходит для версий aiodocker, где attach(stream=...) недоступен.
    """
    docker = aiodocker.Docker()
    await _ensure_image(docker, PY_IMAGE)

    cmd = ["python", "-u", "-c", code]

    container = await docker.containers.create(
        config={
            "Image": PY_IMAGE,
            "Cmd": cmd,
            "Tty": False,
            "HostConfig": {
                "NetworkMode": "none",
                "AutoRemove": False,
                "Memory": 256 * 1024 * 1024,
                "PidsLimit": 64,
            },
        }
    )

    await container.start()

    async def waiter() -> int:
        try:
            res = await asyncio.wait_for(container.wait(), timeout=RUN_TIMEOUT_SEC)
            return int(res.get("StatusCode", 0))
        except asyncio.TimeoutError:
            try:
                await container.kill()
            except Exception:
                pass
            return 124
        finally:
            try:
                await container.delete(force=True)
            except Exception:
                pass
            await docker.close()

    wait_task = asyncio.create_task(waiter())

    async def events() -> AsyncIterator[Dict]:
        """
        Два параллельных "follow" лога: stdout и stderr.
        Некоторые версии aiodocker возвращают строки/байты по чанкам.
        """
        async def _follow(stdout: bool, stderr: bool, name: str):
            # follow=True -> поток
            async for chunk in container.log(stdout=stdout, stderr=stderr, follow=True):
                text = _decode(chunk)
                if text:
                    yield {"stream": name, "chunk": text}

        # запускаем два генератора
        gen_out = _follow(stdout=True, stderr=False, name="stdout")
        gen_err = _follow(stdout=False, stderr=True, name="stderr")

        # Мерджим два async-генератора в один поток событий
        q: asyncio.Queue[Dict] = asyncio.Queue()

        async def pump(gen):
            try:
                async for item in gen:
                    await q.put(item)
            except Exception:
                pass

        t1 = asyncio.create_task(pump(gen_out))
        t2 = asyncio.create_task(pump(gen_err))

        try:
            # Пока контейнер не завершился — отдаём события
            while True:
                if wait_task.done() and q.empty():
                    break
                try:
                    item = await asyncio.wait_for(q.get(), timeout=0.1)
                    yield item
                except asyncio.TimeoutError:
                    continue
        finally:
            t1.cancel()
            t2.cancel()

    return events(), wait_task
