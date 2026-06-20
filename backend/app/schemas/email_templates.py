from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class EmailTemplateBase(BaseModel):
    code: str = Field(..., min_length=2, max_length=100)
    name: str = Field(..., min_length=2, max_length=150)
    subject: str = Field(..., min_length=1, max_length=255)
    html_body: str = Field(..., min_length=1)
    text_body: str | None = None
    variables: list[str] | None = None
    is_active: bool = True


class EmailTemplateCreate(EmailTemplateBase):
    pass


class EmailTemplateUpdate(BaseModel):
    code: str | None = Field(default=None, min_length=2, max_length=100)
    name: str | None = Field(default=None, min_length=2, max_length=150)
    subject: str | None = Field(default=None, min_length=1, max_length=255)
    html_body: str | None = Field(default=None, min_length=1)
    text_body: str | None = None
    variables: list[str] | None = None
    is_active: bool | None = None


class EmailTemplateOut(BaseModel):
    id: int
    company_id: int
    code: str
    name: str
    subject: str
    html_body: str
    text_body: str | None
    variables: list[str] | None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class EmailTemplateTestRequest(BaseModel):
    to_email: EmailStr
    variables: dict[str, str] = {}