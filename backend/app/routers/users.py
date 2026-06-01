from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr
from typing import Annotated
import bcrypt
from app.core.database import get_db
from app.core.auth import require_role, get_current_user
from app.models import User, UserCompanyMembership, Profile

router = APIRouter(prefix="/users", tags=["users"])
AdminDep = Annotated[dict, Depends(require_role("super_admin", "admin"))]
AnyAuthDep = Annotated[dict, Depends(get_current_user)]
AnyAuthDep = Annotated[dict, Depends(get_current_user)]


class UserSearchResult(BaseModel):
    id: int
    name: str
    email: str
    phone: str | None
    is_active: bool

    model_config = {"from_attributes": True}


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: str | None = None
    preferred_lang: str = "es"


class MemberCreate(BaseModel):
    user_id: int
    profile_code: str


class MemberRoleUpdate(BaseModel):
    profile_code: str


class MemberOut(BaseModel):
    id: int
    user_id: int
    company_id: int
    profile_code: str
    is_active: bool

    model_config = {"from_attributes": True}


@router.get("/search", response_model=UserSearchResult | None)
async def search_user(
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
    email: str | None = None,
    q: str | None = None,
):
    """Search user by email, name or phone number."""
    from sqlalchemy import or_, func
    
    search_term = (email or q or "").strip()
    if not search_term:
        return None

    # Try exact email match first
    result = await db.execute(select(User).where(User.email == search_term.lower()))
    user = result.scalar_one_or_none()
    if user:
        return user

    # Fuzzy search by name, email or phone
    like_term = f"%{search_term.lower()}%"
    result = await db.execute(
        select(User).where(
            or_(
                func.lower(User.name).like(like_term),
                func.lower(User.email).like(like_term),
                User.phone.like(f"%{search_term}%"),
            )
        ).limit(1)
    )
    return result.scalar_one_or_none()


@router.post("", response_model=UserSearchResult, status_code=status.HTTP_201_CREATED)
async def create_user(
    body: UserCreate,
    _: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    # Email siempre en minúsculas
    email_lower = body.email.strip().lower()
    existing = await db.execute(select(User).where(User.email == email_lower))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email ya registrado")

    password_hash = bcrypt.hashpw(body.password.encode(), bcrypt.gensalt()).decode()
    user = User(
        name=body.name.strip().upper() if body.name else body.name,
        email=email_lower,
        password_hash=password_hash,
        phone=body.phone.strip().upper() if body.phone else body.phone,
        preferred_lang=body.preferred_lang,
        is_active=True,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user


@router.post("/companies/{company_id}/members", response_model=MemberOut, status_code=status.HTTP_201_CREATED)
async def add_member(
    company_id: int,
    body: MemberCreate,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    # Validar que el admin pertenece a esa empresa
    token_company = current_user.get("company_id")
    if current_user.get("role") != "super_admin" and token_company != company_id:
        raise HTTPException(status_code=403, detail="Sin acceso a esta empresa")

    # Verificar que el usuario existe
    user = await db.get(User, body.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Verificar que no está ya asociado
    existing = await db.execute(
        select(UserCompanyMembership).where(
            UserCompanyMembership.user_id == body.user_id,
            UserCompanyMembership.company_id == company_id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Usuario ya asociado a esta empresa")

    # Obtener perfil
    profile_result = await db.execute(select(Profile).where(Profile.code == body.profile_code))
    profile = profile_result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=400, detail="Perfil no válido")

    membership = UserCompanyMembership(
        user_id=body.user_id,
        company_id=company_id,
        profile_id=profile.id,
        is_active=True,
    )
    db.add(membership)
    await db.flush()
    await db.refresh(membership)
    return MemberOut(
        id=membership.id,
        user_id=membership.user_id,
        company_id=membership.company_id,
        profile_code=body.profile_code,
        is_active=membership.is_active,
    )


@router.patch("/companies/{company_id}/members/{user_id}/role", response_model=MemberOut)
async def update_member_role(
    company_id: int,
    user_id: int,
    body: MemberRoleUpdate,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    token_company = current_user.get("company_id")
    if current_user.get("role") != "super_admin" and token_company != company_id:
        raise HTTPException(status_code=403, detail="Sin acceso a esta empresa")

    result = await db.execute(
        select(UserCompanyMembership).where(
            UserCompanyMembership.user_id == user_id,
            UserCompanyMembership.company_id == company_id,
        )
    )
    membership = result.scalar_one_or_none()
    if not membership:
        raise HTTPException(status_code=404, detail="Membresía no encontrada")

    profile_result = await db.execute(select(Profile).where(Profile.code == body.profile_code))
    profile = profile_result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=400, detail="Perfil no válido")

    membership.profile_id = profile.id
    await db.flush()
    return MemberOut(
        id=membership.id,
        user_id=membership.user_id,
        company_id=membership.company_id,
        profile_code=body.profile_code,
        is_active=membership.is_active,
    )


@router.delete("/companies/{company_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_member(
    company_id: int,
    user_id: int,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    token_company = current_user.get("company_id")
    if current_user.get("role") != "super_admin" and token_company != company_id:
        raise HTTPException(status_code=403, detail="Sin acceso a esta empresa")

    result = await db.execute(
        select(UserCompanyMembership).where(
            UserCompanyMembership.user_id == user_id,
            UserCompanyMembership.company_id == company_id,
        )
    )
    membership = result.scalar_one_or_none()
    if not membership:
        raise HTTPException(status_code=404, detail="Membresía no encontrada")

    await db.delete(membership)


@router.get("/companies/{company_id}/members", tags=["users"])
async def list_company_members(
    company_id: int,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
    q: str | None = None,
):
    token_company = current_user.get("company_id")
    if current_user.get("role") != "super_admin" and token_company != company_id:
        raise HTTPException(status_code=403, detail="Sin acceso a esta empresa")

    query = (
        select(User, UserCompanyMembership, Profile)
        .join(UserCompanyMembership, UserCompanyMembership.user_id == User.id)
        .join(Profile, Profile.id == UserCompanyMembership.profile_id)
        .where(
            UserCompanyMembership.company_id == company_id,
            UserCompanyMembership.is_active == True,
            User.is_active == True,
        )
    )

    if q:
        from sqlalchemy import or_, func
        search = f"%{q.lower()}%"
        query = query.where(
            or_(
                func.lower(User.name).like(search),
                func.lower(User.email).like(search),
                User.phone.like(f"%{q}%"),
            )
        )

    query = query.order_by(User.name)
    result = await db.execute(query)
    rows = result.all()
    return [
        {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "profile": profile.code,
            "is_active": user.is_active,
        }
        for user, membership, profile in rows
    ]


class UserUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    preferred_lang: str | None = None


@router.patch("/{user_id}", response_model=UserSearchResult)
async def update_user(
    user_id: int,
    body: UserUpdate,
    _: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if body.name is not None:
        user.name = body.name.strip().upper()
    if body.phone is not None:
        user.phone = body.phone.strip().upper() if body.phone else body.phone
    if body.preferred_lang is not None:
        user.preferred_lang = body.preferred_lang
    await db.flush()
    await db.refresh(user)
    return user


# ── Perfil extendido del usuario autenticado ──────────────────────────────

class UserProfileUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    address: str | None = None
    city: str | None = None
    state: str | None = None
    zip_code: str | None = None
    preferred_lang: str | None = None


class UserProfileOut(BaseModel):
    id: int
    name: str
    email: str
    phone: str | None
    address: str | None
    city: str | None
    state: str | None
    zip_code: str | None
    photo_url: str | None
    preferred_lang: str

    model_config = {"from_attributes": True}


@router.get("/me/profile", response_model=UserProfileOut)
async def get_my_profile(
    current_user: AnyAuthDep,
    db: AsyncSession = Depends(get_db),
):
    user_id = int(current_user["sub"])
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user


@router.patch("/me/profile", response_model=UserProfileOut)
async def update_my_profile(
    body: UserProfileUpdate,
    current_user: AnyAuthDep,
    db: AsyncSession = Depends(get_db),
):
    user_id = int(current_user["sub"])
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Campos de texto → mayúsculas; email → minúsculas; preferred_lang → sin cambio
    text_upper_fields = {"name", "phone", "address", "city", "state", "zip_code"}
    for field, value in body.model_dump(exclude_none=True).items():
        if field in text_upper_fields and isinstance(value, str):
            setattr(user, field, value.strip().upper())
        else:
            setattr(user, field, value)

    await db.flush()
    await db.refresh(user)
    return user


# ── Documentos del usuario ────────────────────────────────────────────────

class DocumentOut(BaseModel):
    id: int
    doc_type: str
    name: str
    url: str
    created_at: str

    model_config = {"from_attributes": True}


@router.get("/me/documents", response_model=list[DocumentOut])
async def get_my_documents(current_user: AnyAuthDep, db: AsyncSession = Depends(get_db)):
    from app.models import UserDocument
    user_id = int(current_user["sub"])
    result = await db.execute(
        select(UserDocument).where(UserDocument.user_id == user_id).order_by(UserDocument.created_at.desc())
    )
    docs = result.scalars().all()
    return [DocumentOut(id=d.id, doc_type=d.doc_type, name=d.name, url=d.url,
                        created_at=d.created_at.isoformat()) for d in docs]


@router.post("/me/documents", status_code=201)
async def upload_document(
    current_user: AnyAuthDep,
    db: AsyncSession = Depends(get_db),
    doc_type: str = "other",
    name: str = "Documento",
    file: bytes = b"",
):
    """Endpoint placeholder — en producción usar S3/Cloudinary. Por ahora acepta URL directa."""
    raise HTTPException(status_code=501, detail="Use POST /me/documents/url para subir por URL")


@router.post("/me/documents/url", status_code=201)
async def add_document_url(
    body: dict,
    current_user: AnyAuthDep,
    db: AsyncSession = Depends(get_db),
):
    from app.models import UserDocument
    user_id = int(current_user["sub"])
    doc = UserDocument(
        user_id=user_id,
        doc_type=body.get("doc_type", "other"),
        name=body.get("name", "Documento"),
        url=body.get("url", ""),
    )
    db.add(doc)
    await db.flush()
    return {"id": doc.id, "doc_type": doc.doc_type, "name": doc.name, "url": doc.url}


@router.delete("/me/documents/{doc_id}", status_code=204)
async def delete_document(doc_id: int, current_user: AnyAuthDep, db: AsyncSession = Depends(get_db)):
    from app.models import UserDocument
    user_id = int(current_user["sub"])
    result = await db.execute(
        select(UserDocument).where(UserDocument.id == doc_id, UserDocument.user_id == user_id)
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Documento no encontrado")
    await db.delete(doc)


# ── Tarifas por empleado (employee_job_roles con override) ────────────────

@router.get("/{user_id}/rates")
async def get_user_rates(
    user_id: int,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    """Get all job roles assigned to a user with their rate overrides."""
    from app.models import EmployeeJobRole, JobRole
    company_id = current_user["company_id"]

    result = await db.execute(
        select(EmployeeJobRole, JobRole)
        .join(JobRole, JobRole.id == EmployeeJobRole.job_role_id)
        .where(
            EmployeeJobRole.user_id == user_id,
            EmployeeJobRole.company_id == company_id,
        )
        .order_by(JobRole.name)
    )
    rows = result.all()
    return [
        {
            "id": ejr.id,
            "job_role_id": ejr.job_role_id,
            "role_name": role.name,
            "base_rate": float(role.hourly_rate),
            "hourly_rate_override": float(ejr.hourly_rate_override) if ejr.hourly_rate_override else None,
            "effective_rate": float(ejr.hourly_rate_override) if ejr.hourly_rate_override else float(role.hourly_rate),
        }
        for ejr, role in rows
    ]


class UpdateUserRatesBody(BaseModel):
    rates: list[dict]  # [{"employee_job_role_id": 1, "hourly_rate_override": 25.00 | null}, ...]


@router.patch("/{user_id}/rates")
async def update_user_rates(
    user_id: int,
    body: UpdateUserRatesBody,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    """Update hourly rate overrides for a user's job roles."""
    from app.models import EmployeeJobRole
    from decimal import Decimal
    company_id = current_user["company_id"]

    updated = []
    for rate_item in body.rates:
        ejr_id = rate_item.get("employee_job_role_id") or rate_item.get("id")
        override = rate_item.get("hourly_rate_override")

        ejr = await db.get(EmployeeJobRole, ejr_id)
        if not ejr or ejr.company_id != company_id or ejr.user_id != user_id:
            continue

        ejr.hourly_rate_override = Decimal(str(override)) if override is not None else None
        updated.append(ejr_id)

    await db.flush()
    return {"updated": updated, "count": len(updated)}
