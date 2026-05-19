from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import desc, select
from typing import List, Annotated
from datetime import datetime
from pydantic import BaseModel, Field, field_validator
from app.core.database import get_db
from app.core.auth import get_current_user, require_role
from app.models.news import News
from app.models.user import User


router = APIRouter(prefix='/news', tags=['news'])


def parse_datetime(value: str | datetime) -> datetime:
    """Parsear datetime en múltiples formatos"""
    if isinstance(value, datetime):
        return value
    if not isinstance(value, str):
        raise ValueError(f"Fecha inválida: {value}")
    
    value = value.strip()
    
    # Intentar formato ISO con T (yyyy-mm-ddThh:mm:ss)
    try:
        return datetime.fromisoformat(value)
    except ValueError:
        pass
    
    # Intentar formato ISO con espacio (yyyy-mm-dd hh:mm:ss)
    try:
        return datetime.strptime(value, "%Y-%m-%d %H:%M:%S")
    except ValueError:
        pass
    
    # Intentar solo fecha ISO (yyyy-mm-dd)
    try:
        return datetime.strptime(value, "%Y-%m-%d")
    except ValueError:
        pass
    
    raise ValueError(f"Formato de fecha no válido: {value}")


# ── Schemas ──────────────────────────────────────────────────────────────────
class NewsCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1)
    publication_date: datetime | None = None
    expiration_date: datetime | None = None
    
    @field_validator('publication_date', 'expiration_date', mode='before')
    @classmethod
    def validate_dates(cls, v):
        if v is None:
            return v
        return parse_datetime(v)


class NewsUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=200)
    content: str | None = Field(None, min_length=1)
    publication_date: datetime | None = None
    expiration_date: datetime | None = None
    is_active: bool | None = None
    
    @field_validator('publication_date', 'expiration_date', mode='before')
    @classmethod
    def validate_dates(cls, v):
        if v is None:
            return v
        return parse_datetime(v)


class NewsResponse(BaseModel):
    id: int
    company_id: int
    title: str
    content: str
    author_id: int
    author_name: str
    publication_date: datetime | None
    expiration_date: datetime | None
    published_at: datetime
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.post('', response_model=NewsResponse, status_code=status.HTTP_201_CREATED)
async def create_news(
    data: NewsCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Annotated[dict, Depends(require_role("admin", "super_admin"))] = None
):
    """Crear una noticia (solo admin)"""
    # Convertir título y contenido a mayúsculas
    title_upper = data.title.upper().strip()
    content_upper = data.content.upper().strip()
    news = News(
        company_id=current_user["company_id"],
        title=title_upper,
        content=content_upper,
        publication_date=data.publication_date,
        expiration_date=data.expiration_date,
        author_id=int(current_user["sub"]),
        is_active=True
    )
    db.add(news)
    await db.commit()
    await db.refresh(news)
    
    # Construir respuesta manualmente para evitar problemas de validación
    author_name = current_user.get("name", "Desconocido")
    return NewsResponse(
        id=news.id,
        company_id=news.company_id,
        title=news.title,
        content=news.content,
        author_id=news.author_id,
        author_name=author_name,
        publication_date=news.publication_date,
        expiration_date=news.expiration_date,
        published_at=news.published_at,
        is_active=news.is_active,
        created_at=news.created_at,
        updated_at=news.updated_at
    )


@router.get('', response_model=List[NewsResponse])
async def list_news(
    skip: int = 0,
    limit: int = 50,
    active_only: bool = True,
    db: AsyncSession = Depends(get_db),
    current_user: Annotated[dict, Depends(get_current_user)] = None
):
    """Listar noticias de la empresa actual"""
    query = select(News).where(News.company_id == current_user["company_id"])
    
    if active_only:
        query = query.where(News.is_active == True)
    
    query = query.order_by(desc(News.published_at)).offset(skip).limit(limit)
    result = await db.execute(query)
    news_list = result.scalars().all()
    
    # Construir respuestas manualmente
    results = []
    for news in news_list:
        author_result = await db.execute(select(User).where(User.id == news.author_id))
        author = author_result.scalar_one_or_none()
        result_item = NewsResponse(
            id=news.id,
            company_id=news.company_id,
            title=news.title,
            content=news.content,
            author_id=news.author_id,
            author_name=author.name if author else 'Desconocido',
            publication_date=news.publication_date,
            expiration_date=news.expiration_date,
            published_at=news.published_at,
            is_active=news.is_active,
            created_at=news.created_at,
            updated_at=news.updated_at
        )
        results.append(result_item)
    
    return results


@router.get('/{news_id}', response_model=NewsResponse)
async def get_news(
    news_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Annotated[dict, Depends(get_current_user)] = None
):
    """Obtener una noticia por ID"""
    result = await db.execute(
        select(News).where(
            News.id == news_id,
            News.company_id == current_user["company_id"]
        )
    )
    news = result.scalar_one_or_none()
    
    if not news:
        raise HTTPException(status_code=404, detail='Noticia no encontrada')
    
    author_result = await db.execute(select(User).where(User.id == news.author_id))
    author = author_result.scalar_one_or_none()
    return NewsResponse(
        id=news.id,
        company_id=news.company_id,
        title=news.title,
        content=news.content,
        author_id=news.author_id,
        author_name=author.name if author else 'Desconocido',
        publication_date=news.publication_date,
        expiration_date=news.expiration_date,
        published_at=news.published_at,
        is_active=news.is_active,
        created_at=news.created_at,
        updated_at=news.updated_at
    )


@router.patch('/{news_id}', response_model=NewsResponse)
async def update_news(
    news_id: int,
    data: NewsUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Annotated[dict, Depends(require_role("admin", "super_admin"))] = None
):
    """Actualizar una noticia (solo admin)"""
    result = await db.execute(
        select(News).where(
            News.id == news_id,
            News.company_id == current_user["company_id"]
        )
    )
    news = result.scalar_one_or_none()
    
    if not news:
        raise HTTPException(status_code=404, detail='Noticia no encontrada')
    
    if data.title is not None:
        # Convertir título a mayúsculas
        news.title = data.title.upper().strip()
    if data.content is not None:
        # Convertir contenido a mayúsculas
        news.content = data.content.upper().strip()
    if data.publication_date is not None:
        news.publication_date = data.publication_date
    if data.expiration_date is not None:
        news.expiration_date = data.expiration_date
    if data.is_active is not None:
        news.is_active = data.is_active
    
    news.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(news)
    
    author_result = await db.execute(select(User).where(User.id == news.author_id))
    author = author_result.scalar_one_or_none()
    return NewsResponse(
        id=news.id,
        company_id=news.company_id,
        title=news.title,
        content=news.content,
        author_id=news.author_id,
        author_name=author.name if author else 'Desconocido',
        publication_date=news.publication_date,
        expiration_date=news.expiration_date,
        published_at=news.published_at,
        is_active=news.is_active,
        created_at=news.created_at,
        updated_at=news.updated_at
    )


@router.delete('/{news_id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_news(
    news_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Annotated[dict, Depends(require_role("admin", "super_admin"))] = None
):
    """Eliminar una noticia (solo admin)"""
    result = await db.execute(
        select(News).where(
            News.id == news_id,
            News.company_id == current_user["company_id"]
        )
    )
    news = result.scalar_one_or_none()
    
    if not news:
        raise HTTPException(status_code=404, detail='Noticia no encontrada')
    
    await db.delete(news)
    await db.commit()
    return None
