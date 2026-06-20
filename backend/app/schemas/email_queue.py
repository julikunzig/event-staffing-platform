from datetime import datetime
from pydantic import BaseModel, EmailStr


class EmailQueueCreate(BaseModel):
    company_id: int
    template_code: str
    recipient_email: EmailStr
    variables_json: dict | None = None
    scheduled_at: datetime | None = None


class EmailQueueOut(BaseModel):
    id: int
    company_id: int
    template_code: str
    recipient_email: str
    variables_json: dict | None = None
    status: str
    attempts: int
    max_attempts: int
    error_message: str | None = None
    scheduled_at: datetime
    processed_at: datetime | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
