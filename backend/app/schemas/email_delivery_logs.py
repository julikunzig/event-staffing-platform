from datetime import datetime
from pydantic import BaseModel


class EmailDeliveryLogOut(BaseModel):
    id: int
    company_id: int
    template_id: int | None = None
    recipient_email: str
    subject: str
    status: str
    provider: str
    error_message: str | None = None
    html_body: str | None = None
    text_body: str | None = None
    variables_json: dict | None = None
    sent_at: datetime | None = None
    created_at: datetime

    model_config = {"from_attributes": True}