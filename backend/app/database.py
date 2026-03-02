from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.config import settings
import os


# Use SQLite for quick testing if PostgreSQL is not available
DATABASE_URL = os.getenv("DATABASE_URL", settings.DATABASE_URL)

# Fallback to SQLite for quick testing
if not DATABASE_URL or "postgresql" not in DATABASE_URL:
    DATABASE_URL = "sqlite+aiosqlite:///./livecodeinno.db"
    print(f"[INFO] Using SQLite for quick testing: {DATABASE_URL}")
    print(f"[INFO] For PostgreSQL, set DATABASE_URL environment variable")
else:
    print(f"[INFO] Using PostgreSQL: {DATABASE_URL}")

engine = create_async_engine(DATABASE_URL, echo=False)

async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
