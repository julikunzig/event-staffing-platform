import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
import bcrypt, os

DATABASE_URL = os.getenv('DATABASE_URL')

async def create_superadmin():
    engine = create_async_engine(DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    password = 'Admin1234!'
    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt(12)).decode()
    async with async_session() as session:
        await session.execute(text("""INSERT INTO companies (name,slug,contact_email,is_active) VALUES ('Platform','platform','superadmin@platform.com',true) ON CONFLICT (slug) DO NOTHING"""))
        await session.execute(text(f"""INSERT INTO users (name,email,password_hash,is_active) VALUES ('Super Admin','superadmin@platform.com','{hashed}',true) ON CONFLICT (email) DO NOTHING"""))
        await session.execute(text("""INSERT INTO user_company_memberships (user_id,company_id,profile_id,is_active) SELECT u.id,c.id,p.id,true FROM users u,companies c,profiles p WHERE u.email='superadmin@platform.com' AND c.slug='platform' AND p.code='super_admin' ON CONFLICT (user_id,company_id) DO NOTHING"""))
        await session.commit()
        print('Creado: superadmin@platform.com / Admin1234!')

asyncio.run(create_superadmin())
