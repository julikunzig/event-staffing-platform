import enum


class EventStatus(str, enum.Enum):
    draft = "draft"
    published = "published"
    cancelled = "cancelled"
    completed = "completed"


class AssignmentStatus(str, enum.Enum):
    pending = "pending"
    invited = "invited"
    approved = "approved"
    rejected = "rejected"
    removed = "removed"


class NotificationChannel(str, enum.Enum):
    email = "email"
    sms = "sms"


class NotificationStatus(str, enum.Enum):
    pending = "pending"
    sent = "sent"
    failed = "failed"


class WeekDay(str, enum.Enum):
    monday = "monday"
    tuesday = "tuesday"
    wednesday = "wednesday"
    thursday = "thursday"
    friday = "friday"
    saturday = "saturday"
    sunday = "sunday"


class PreferredLang(str, enum.Enum):
    es = "es"
    en = "en"
