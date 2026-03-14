from datetime import datetime, timezone

from bson import ObjectId
from fastapi import HTTPException, status

from app.db import get_database


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def parse_object_id(value: str) -> ObjectId:
    if not ObjectId.is_valid(value):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid resource id.",
        )
    return ObjectId(value)


def serialize_document(document: dict | None) -> dict | None:
    if not document:
        return document

    serialized = {}
    for key, value in document.items():
        if isinstance(value, ObjectId):
            serialized[key] = str(value)
        else:
            serialized[key] = value
    return serialized


async def write_audit_log(
    *,
    user_id: str,
    user_role: str,
    action: str,
    resource: str,
    ip_address: str | None,
) -> None:
    db = get_database()
    await db["audit_logs"].insert_one(
        {
            "user_id": parse_object_id(user_id),
            "user_role": user_role,
            "action": action,
            "resource": resource,
            "ip_address": ip_address or "unknown",
            "timestamp": utc_now(),
        }
    )
