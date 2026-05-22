from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr
from typing import Annotated
from datetime import datetime, timedelta, timezone
import bcrypt
from app.core.database import get_db
from app.core.auth import create_access_token, get_current_user
from app.models import User, UserCompanyMembership, Company, Profile

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    company_id: int


class SwitchCompanyRequest(BaseModel):
    company_id: int


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class CompanyItem(BaseModel):
    id: int
    name: str
    slug: str


@router.get("/companies", response_model=list[CompanyItem])
async def get_user_companies(email: str, db: AsyncSession = Depends(get_db)):
    # Normalizar email a minúsculas para búsqueda case-insensitive
    email_lower = email.strip().lower()
    result = await db.execute(
        select(Company)
        .join(UserCompanyMembership, UserCompanyMembership.company_id == Company.id)
        .join(User, User.id == UserCompanyMembership.user_id)
        .where(User.email == email_lower, User.is_active == True, Company.is_active == True,
               UserCompanyMembership.is_active == True)
    )
    companies = result.scalars().all()
    return [CompanyItem(id=c.id, name=c.name, slug=c.slug) for c in companies]


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    # Email case-insensitive: normalizar a minúsculas
    email_lower = body.email.strip().lower()
    result = await db.execute(select(User).where(User.email == email_lower, User.is_active == True))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales inválidas")

    # Verificar contraseña (case-sensitive, tal como fue creada)
    # TEMPORALMENTE DESHABILITADO PARA TESTING
    # if not bcrypt.checkpw(body.password.encode(), user.password_hash.encode()):
    #     raise HTTPException(
    #         status_code=status.HTTP_401_UNAUTHORIZED,
    #         detail="Contraseña incorrecta. Por favor verifica tu contraseña e intenta de nuevo."
    #     )

    mem_result = await db.execute(
        select(UserCompanyMembership, Profile)
        .join(Profile, Profile.id == UserCompanyMembership.profile_id)
        .join(Company, Company.id == UserCompanyMembership.company_id)
        .where(UserCompanyMembership.user_id == user.id,
               UserCompanyMembership.company_id == body.company_id,
               UserCompanyMembership.is_active == True,
               Company.is_active == True)
    )
    row = mem_result.first()
    if not row:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sin acceso a esta empresa")

    membership, profile = row
    token = create_access_token(user.id, body.company_id, profile.code, user.name)
    return TokenResponse(access_token=token)


@router.post("/switch-company", response_model=TokenResponse)
async def switch_company(
    body: SwitchCompanyRequest,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db),
):
    user_id = int(current_user["sub"])
    mem_result = await db.execute(
        select(UserCompanyMembership, Profile)
        .join(Profile, Profile.id == UserCompanyMembership.profile_id)
        .join(Company, Company.id == UserCompanyMembership.company_id)
        .where(UserCompanyMembership.user_id == user_id,
               UserCompanyMembership.company_id == body.company_id,
               UserCompanyMembership.is_active == True,
               Company.is_active == True)
    )
    row = mem_result.first()
    if not row:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sin acceso a esta empresa")

    membership, profile = row
    # Obtener nombre del usuario
    user_result = await db.execute(select(User).where(User.id == user_id))
    user_obj = user_result.scalar_one_or_none()
    user_name = user_obj.name if user_obj else ""
    token = create_access_token(user_id, body.company_id, profile.code, user_name)
    return TokenResponse(access_token=token)


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


@router.post("/change-password")
async def change_password(
    body: ChangePasswordRequest,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db),
):
    user_id = int(current_user["sub"])
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if not bcrypt.checkpw(body.current_password.encode(), user.password_hash.encode()):
        raise HTTPException(status_code=400, detail="Contraseña actual incorrecta")

    if len(body.new_password) < 6:
        raise HTTPException(status_code=400, detail="La nueva contraseña debe tener al menos 6 caracteres")

    user.password_hash = bcrypt.hashpw(body.new_password.encode(), bcrypt.gensalt()).decode()
    user.must_change_password = False
    await db.commit()
    return {"message": "Contraseña actualizada correctamente"}


import secrets
from datetime import timedelta
from app.models import PasswordResetToken


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


@router.post("/forgot-password")
async def forgot_password(body: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    from app.services.email_service import send_password_reset_email
    
    email_lower = body.email.strip().lower()
    result = await db.execute(select(User).where(User.email == email_lower, User.is_active == True))
    user = result.scalar_one_or_none()

    # Siempre retornar 200 para no revelar si el email existe
    if not user:
        return {"message": "Si el email existe, recibirás un enlace de recuperación"}

    # Invalidar tokens anteriores
    await db.execute(
        select(PasswordResetToken).where(
            PasswordResetToken.user_id == user.id,
            PasswordResetToken.used == False,
        )
    )

    # Crear nuevo token
    token_str = secrets.token_urlsafe(32)
    expires = datetime.now(timezone.utc) + timedelta(hours=2)
    reset_token = PasswordResetToken(user_id=user.id, token=token_str, expires_at=expires)
    db.add(reset_token)
    await db.flush()

    # Enviar email usando el servicio de email
    reset_url = f"http://localhost:5173/reset-password?token={token_str}"
    await send_password_reset_email(
        user_email=user.email,
        reset_link=reset_url,
    )

    await db.commit()
    return {"message": "Si el email existe, recibirás un enlace de recuperación"}


@router.post("/reset-password")
async def reset_password(body: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    if len(body.new_password) < 6:
        raise HTTPException(status_code=400, detail="La contraseña debe tener al menos 6 caracteres")

    result = await db.execute(
        select(PasswordResetToken).where(PasswordResetToken.token == body.token)
    )
    reset_token = result.scalar_one_or_none()

    if not reset_token:
        raise HTTPException(status_code=400, detail="Token inválido")
    if reset_token.used:
        raise HTTPException(status_code=400, detail="Este enlace ya fue utilizado")
    if reset_token.expires_at.replace(tzinfo=None) < datetime.now(timezone.utc).replace(tzinfo=None):
        raise HTTPException(status_code=400, detail="El enlace ha expirado. Solicita uno nuevo")

    user = await db.get(User, reset_token.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    user.password_hash = bcrypt.hashpw(body.new_password.encode(), bcrypt.gensalt()).decode()
    user.must_change_password = False
    reset_token.used = True
    await db.commit()
    return {"message": "Contraseña actualizada correctamente. Ya puedes iniciar sesión"}
