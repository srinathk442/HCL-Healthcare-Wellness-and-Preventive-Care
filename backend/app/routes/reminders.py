from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.auth import require_role
from app.db import get_database
from app.models import ReminderResponse, ReminderStatusUpdate, RoleEnum
from app.utils import parse_object_id, serialize_document, utc_now, write_audit_log

router = APIRouter(prefix="/api/reminders", tags=["reminders"])


@router.get("", response_model=list[ReminderResponse])
async def list_reminders(
    request: Request,
    current_user: dict = Depends(require_role(RoleEnum.patient)),
) -> list[ReminderResponse]:
    db = get_database()
    cursor = db["reminders"].find(
        {"patient_id": current_user["_id"]}
    ).sort("due_date", 1)
    reminders = [serialize_document(doc) async for doc in cursor]

    await write_audit_log(
        user_id=str(current_user["_id"]),
        user_role=current_user["role"],
        action="LIST_REMINDERS",
        resource="reminders",
        ip_address=request.client.host if request.client else None,
    )
    return [ReminderResponse.model_validate(r) for r in reminders]


@router.put("/{reminder_id}/status", response_model=ReminderResponse)
async def update_reminder_status(
    reminder_id: str,
    payload: ReminderStatusUpdate,
    request: Request,
    current_user: dict = Depends(require_role(RoleEnum.patient)),
) -> ReminderResponse:
    db = get_database()
    oid = parse_object_id(reminder_id)
    result = await db["reminders"].find_one_and_update(
        {"_id": oid, "patient_id": current_user["_id"]},
        {"$set": {"status": payload.status.value}},
        return_document=True,
    )
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reminder not found.",
        )

    await write_audit_log(
        user_id=str(current_user["_id"]),
        user_role=current_user["role"],
        action="UPDATE_REMINDER_STATUS",
        resource="reminders",
        ip_address=request.client.host if request.client else None,
    )
    return ReminderResponse.model_validate(serialize_document(result))
