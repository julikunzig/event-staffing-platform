"""
Script para crear el super admin inicial.
Uso: docker compose exec backend python scripts/seed_superadmin.py
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import bcrypt
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select
from app.core.config import settings
from app.models import User, Profile, Company, UserCompanyMembership

engine = create_async_engine(settings.DATABASE_URL)
SessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def seed():
    async with SessionLocal() as db:
        # Verificar si ya existe
        result = await db.execute(select(User).where(User.email == "superadmin@platform.com"))
        if result.scalar_one_or_none():
            print("Super admin ya existe.")
            return

        # Crear usuario
        password_hash = bcrypt.hashpw(b"Admin1234!", bcrypt.gensalt()).decode()
        user = User(
            name="Super Administrador",
            email="superadmin@platform.com",
            password_hash=password_hash,
            phone=None,
            preferred_lang="es",
            is_active=True,
        )
        db.add(user)
        await db.flush()

        # Crear empresa de plataforma
        result = await db.execute(select(Company).where(Company.slug == "platform"))
        company = result.scalar_one_or_none()
        if not company:
            company = Company(
                name="Platform Admin",
                slug="platform",
                contact_email="superadmin@platform.com",
                is_active=True,
            )
            db.add(company)
            await db.flush()

        # Obtener perfil super_admin
        result = await db.execute(select(Profile).where(Profile.code == "super_admin"))
        profile = result.scalar_one_or_none()
        if not profile:
            print("ERROR: Perfil super_admin no encontrado. Corre las migraciones primero.")
            return

        # Crear membresía
        membership = UserCompanyMembership(
            user_id=user.id,
            company_id=company.id,
            profile_id=profile.id,
            is_active=True,
        )
        db.add(membership)
        await db.commit()

        print("✅ Super admin creado exitosamente:")
        print("   Email:    superadmin@platform.com")
        print("   Password: Admin1234!")
        print("   Empresa:  platform")


if __name__ == "__main__":
    asyncio.run(seed())
