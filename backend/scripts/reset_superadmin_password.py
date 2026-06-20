import asyncio
import bcrypt
from sqlalchemy import update
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

from app.core.config import settings
from app.models import User


async def main():
    engine = create_async_engine(settings.DATABASE_URL)
    SessionLocal = async_sessionmaker(engine, expire_on_commit=False)

    async with SessionLocal() as db:
        password_hash = bcrypt.hashpw(
            b"Admin1234!",
            bcrypt.gensalt()
        ).decode()

        await db.execute(
            update(User)
            .where(User.email == "jennifer.walsh@eliteevents.com")
            .values(password_hash=password_hash)
        )

        await db.commit()

    print("✅ Password actualizada")
    print("Email: jennifer.walsh@eliteevents.com")
    print("Password: Admin1234!")


if __name__ == "__main__":
    asyncio.run(main())