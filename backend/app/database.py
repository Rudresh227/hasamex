from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.config import settings

# Debug: Print the database URL (remove in production)
print(f"Database URL: {settings.ASYNC_DATABASE_URL}")

if not settings.ASYNC_DATABASE_URL:
    raise ValueError("DATABASE_URL is not set")

engine = create_async_engine(
    settings.ASYNC_DATABASE_URL,
    echo=True, # Set to False in production
)

async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with async_session() as session:
        yield session
