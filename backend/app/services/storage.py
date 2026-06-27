"""Storage abstraction for uploaded files.

Single integration point for where uploaded files (user documents, event
documents, etc.) actually live. Today everything goes to local disk; to move
to S3/Cloudinary/Drive later, add a new StorageBackend subclass and switch
`STORAGE_BACKEND` in settings — no caller code needs to change.
"""

import re
import uuid
from abc import ABC, abstractmethod
from pathlib import Path

from app.core.config import settings


def _safe_filename(filename: str) -> str:
    name = Path(filename or "file").name
    name = re.sub(r"[^A-Za-z0-9._-]", "_", name)
    return name[-150:] or "file"


class StorageBackend(ABC):
    """Saves/serves/deletes uploaded files. `key` identifies a stored file
    and is what gets persisted in the database (e.g. UserDocument.url)."""

    @abstractmethod
    async def save(self, content: bytes, filename: str, folder: str) -> str:
        """Persist `content` and return the key to store in the DB."""

    @abstractmethod
    def url_for(self, key: str) -> str:
        """Return a URL the frontend can use to fetch the stored file."""

    @abstractmethod
    def delete(self, key: str) -> None:
        """Remove the stored file, if present. Safe to call on missing keys."""


class LocalDiskStorage(StorageBackend):
    def __init__(self, base_dir: str, public_prefix: str):
        self.base_dir = Path(base_dir)
        self.public_prefix = public_prefix.rstrip("/")

    async def save(self, content: bytes, filename: str, folder: str) -> str:
        safe_name = _safe_filename(filename)
        unique_name = f"{uuid.uuid4().hex}_{safe_name}"
        target_dir = self.base_dir / folder
        target_dir.mkdir(parents=True, exist_ok=True)
        (target_dir / unique_name).write_bytes(content)
        return f"{folder}/{unique_name}"

    def url_for(self, key: str) -> str:
        return f"{self.public_prefix}/{key}"

    def delete(self, key: str) -> None:
        path = self.base_dir / key
        try:
            path.unlink(missing_ok=True)
        except OSError:
            pass


_backend: StorageBackend | None = None


def get_storage() -> StorageBackend:
    """Returns the configured storage backend (singleton)."""
    global _backend
    if _backend is None:
        if settings.STORAGE_BACKEND == "local":
            _backend = LocalDiskStorage(settings.UPLOAD_DIR, settings.UPLOAD_PUBLIC_PREFIX)
        else:
            raise ValueError(f"Unknown STORAGE_BACKEND: {settings.STORAGE_BACKEND}")
    return _backend


def is_local_key(url: str) -> bool:
    """True if `url` is a key managed by our storage backend rather than an
    external link (e.g. a Google Drive URL pasted by the user)."""
    return bool(url) and not re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*://", url)


def resolve_document_url(stored_value: str) -> str:
    """Turn a DB-stored value into something the frontend can fetch.
    Pasted external links pass through unchanged; local storage keys are
    expanded to a servable URL through the configured backend."""
    if is_local_key(stored_value):
        return get_storage().url_for(stored_value)
    return stored_value
