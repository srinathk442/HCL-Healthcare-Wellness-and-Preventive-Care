from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.auth import require_role
from app.db import get_database
from app.models import GoalCreate, GoalLogCreate, GoalLogResponse, GoalResponse, RoleEnum
from app.utils import parse_object_id, serialize_document, utc_now, write_audit_log

router = APIRouter(prefix="/api/goals", tags=["goals"])


@router.get("", response_model=list[GoalResponse])
async def list_goals(
    request: Request,
    current_user: dict = Depends(require_role(RoleEnum.patient)),
) -> list[GoalResponse]:
    db = get_database()
    cursor = db["wellness_goals"].find(
        {"patient_id": current_user["_id"], "is_active": True}
    )
    goals = [serialize_document(doc) async for doc in cursor]

    await write_audit_log(
        user_id=str(current_user["_id"]),
        user_role=current_user["role"],
        action="LIST_GOALS",
        resource="wellness_goals",
        ip_address=request.client.host if request.client else None,
    )
    return [GoalResponse.model_validate(g) for g in goals]


@router.post("", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
async def create_goal(
    payload: GoalCreate,
    request: Request,
    current_user: dict = Depends(require_role(RoleEnum.patient)),
) -> GoalResponse:
    db = get_database()
    now = utc_now()
    doc = {
        "patient_id": current_user["_id"],
        "goal_type": payload.goal_type.value,
        "target_value": payload.target_value,
        "unit": payload.unit.value,
        "is_active": True,
        "created_at": now,
    }
    result = await db["wellness_goals"].insert_one(doc)
    created = await db["wellness_goals"].find_one({"_id": result.inserted_id})

    await write_audit_log(
        user_id=str(current_user["_id"]),
        user_role=current_user["role"],
        action="CREATE_GOAL",
        resource="wellness_goals",
        ip_address=request.client.host if request.client else None,
    )
    return GoalResponse.model_validate(serialize_document(created))


@router.post("/{goal_id}/log", response_model=GoalLogResponse, status_code=status.HTTP_201_CREATED)
async def log_goal_entry(
    goal_id: str,
    payload: GoalLogCreate,
    request: Request,
    current_user: dict = Depends(require_role(RoleEnum.patient)),
) -> GoalLogResponse:
    db = get_database()
    oid = parse_object_id(goal_id)
    goal = await db["wellness_goals"].find_one(
        {"_id": oid, "patient_id": current_user["_id"], "is_active": True}
    )
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found.",
        )

    now = utc_now()
    doc = {
        "goal_id": oid,
        "patient_id": current_user["_id"],
        "logged_value": payload.logged_value,
        "log_date": payload.log_date.isoformat(),
        "created_at": now,
    }
    result = await db["goal_logs"].insert_one(doc)
    created = await db["goal_logs"].find_one({"_id": result.inserted_id})

    await write_audit_log(
        user_id=str(current_user["_id"]),
        user_role=current_user["role"],
        action="LOG_GOAL",
        resource="goal_logs",
        ip_address=request.client.host if request.client else None,
    )
    return GoalLogResponse.model_validate(serialize_document(created))


@router.get("/{goal_id}/logs", response_model=list[GoalLogResponse])
async def get_goal_logs(
    goal_id: str,
    request: Request,
    current_user: dict = Depends(require_role(RoleEnum.patient)),
) -> list[GoalLogResponse]:
    db = get_database()
    oid = parse_object_id(goal_id)
    goal = await db["wellness_goals"].find_one(
        {"_id": oid, "patient_id": current_user["_id"]}
    )
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found.",
        )

    cursor = db["goal_logs"].find({"goal_id": oid}).sort("log_date", -1)
    logs = [serialize_document(doc) async for doc in cursor]

    await write_audit_log(
        user_id=str(current_user["_id"]),
        user_role=current_user["role"],
        action="VIEW_GOAL_LOGS",
        resource="goal_logs",
        ip_address=request.client.host if request.client else None,
    )
    return [GoalLogResponse.model_validate(l) for l in logs]
