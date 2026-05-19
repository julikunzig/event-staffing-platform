from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base


class News(Base):
    __tablename__ = 'news'

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey('companies.id', ondelete='CASCADE'), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    author_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    publication_date = Column(DateTime(timezone=True), nullable=True)  # Fecha de publicación personalizada
    expiration_date = Column(DateTime(timezone=True), nullable=True)  # Fecha de expiración
    published_at = Column(DateTime(timezone=True), server_default=func.now(), default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    is_active = Column(Boolean, server_default='true', default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), default=lambda: datetime.now(timezone.utc), onupdate=func.now(), nullable=False)

    # Relationships
    company = relationship('Company', back_populates='news')
    author = relationship('User')
