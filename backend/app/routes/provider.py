from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pymongo import ReturnDocument

from app.auth import require_role
from app.db import get_database
from app.models import (
    PatientComplianceResponse,
    PatientProfileResponse,
    PatientSummary,
    ProviderProfileResponse,
    ProviderProfileUpdate,
    RoleEnum,
)
from app.utils import parse_object_id, serialize_document, utc_now, write_audit_log

router = APIRouter(prefix="/api/provider", tags=["provider"])


@router.get("/profile/me", response_model=ProviderProfileResponse)
async def get_my_provider_profile(
    request: Request,
    current_user: dict = Depends(require_role(RoleEnum.provider)),
) -> ProviderProfileResponse:
    db = get_database()
    profile = await db["provider_profiles"].find_one({"user_id": current_user["_id"]})
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Provider profile not found.",
        )

    await write_audit_log(
        user_id=str(current_user["_id"]),
        user_role=current_user["role"],
        action="VIEW_PROFILE",
        resource="provider_profiles",
        ip_address=request.client.host if request.client else None,
    )
    return ProviderProfileResponse.model_validate(serialize_document(profile))


@router.put("/profile/me", response_model=ProviderProfileResponse)
async def update_my_provider_profile(
    payload: ProviderProfileUpdate,
    request: Request,
    current_user: dict = Depends(require_role(RoleEnum.provider)),
) -> ProviderProfileResponse:
    db = get_database()
    updates = payload.model_dump(exclude_unset=True)
    updates["updated_at"] = utc_now()

    result = await db["provider_profiles"].find_one_and_update(
        {"user_id": current_user["_id"]},
        {"$set": updates},
        return_document=ReturnDocument.AFTER,
    )
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Provider profile not found.",
        )

    await db["users"].update_one(
        {"_id": current_user["_id"]},
        {"$set": {"updated_at": utc_now()}},
    )
    await write_audit_log(
        user_id=str(current_user["_id"]),
        user_role=current_user["role"],
        action="UPDATE_PROFILE",
        resource="provider_profiles",
        ip_address=request.client.host if request.client else None,
    )
    return ProviderProfileResponse.model_validate(serialize_document(result))


@router.get("/patients", response_model=list[PatientSummary])
async def list_assigned_patients(
    request: Request,
    current_user: dict = Depends(require_role(RoleEnum.provider)),
) -> list[PatientSummary]:
    db = get_database()
    cursor = db["provider_patient"].find(
        {"provider_id": current_user["_id"], "is_active": True}
    )
    assignments = [doc async for doc in cursor]

    summaries = []
    for a in assignments:
        user = await db["users"].find_one({"_id": a["patient_id"]})
        if not user:
            continue
        profile = await db["patient_profiles"].find_one({"user_id": a["patient_id"]})
        summaries.append(
            PatientSummary(
                patient_id=str(a["patient_id"]),
                email=user["email"],
                full_name=profile.get("full_name") if profile else None,
                assigned_at=a["assigned_at"],
            )
        )

    await write_audit_log(
        user_id=str(current_user["_id"]),
        user_role=current_user["role"],
        action="LIST_PATIENTS",
        resource="provider_patient",
        ip_address=request.client.host if request.client else None,
    )
    return summaries


@router.get("/patients/{patient_id}", response_model=PatientProfileResponse)
async def get_patient_detail(
    patient_id: str,
    request: Request,
    current_user: dict = Depends(require_role(RoleEnum.provider)),
) -> PatientProfileResponse:
    db = get_database()
    pid = parse_object_id(patient_id)

    assignment = await db["provider_patient"].find_one(
        {"provider_id": current_user["_id"], "patient_id": pid, "is_active": True}
    )
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Patient is not assigned to you.",
        )

    profile = await db["patient_profiles"].find_one({"user_id": pid})
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient profile not found.",
        )

    await write_audit_log(
        user_id=str(current_user["_id"]),
        user_role=current_user["role"],
        action="VIEW_PATIENT",
        resource="patient_profiles",
        ip_address=request.client.host if request.client else None,
    )
    return PatientProfileResponse.model_validate(serialize_document(profile))


@router.get("/patients/{patient_id}/compliance", response_model=PatientComplianceResponse)
async def get_patient_compliance(
    patient_id: str,
    request: Request,
    current_user: dict = Depends(require_role(RoleEnum.provider)),
) -> PatientComplianceResponse:
    db = get_database()
    pid = parse_object_id(patient_id)

    assignment = await db["provider_patient"].find_one(
        {"provider_id": current_user["_id"], "patient_id": pid, "is_active": True}
    )
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Patient is not assigned to you.",
        )

    user = await db["users"].find_one({"_id": pid})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found.")

    profile = await db["patient_profiles"].find_one({"user_id": pid})

    # Goals with at least one log in the last 7 days
    total_goals = await db["wellness_goals"].count_documents(
        {"patient_id": pid, "is_active": True}
    )
    seven_days_ago = datetime.now(timezone.utc).replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    from datetime import timedelta
    seven_days_ago = seven_days_ago - timedelta(days=7)
    recent_goal_ids = await db["goal_logs"].distinct(
        "goal_id",
        {"patient_id": pid, "created_at": {"$gte": seven_days_ago}},
    )
    goals_with_recent_log = len(recent_goal_ids)

    pending_reminders = await db["reminders"].count_documents(
        {"patient_id": pid, "status": "pending"}
    )
    missed_reminders = await db["reminders"].count_documents(
        {"patient_id": pid, "status": "missed"}
    )

    await write_audit_log(
        user_id=str(current_user["_id"]),
        user_role=current_user["role"],
        action="VIEW_COMPLIANCE",
        resource="reminders",
        ip_address=request.client.host if request.client else None,
    )
    return PatientComplianceResponse(
        patient_id=patient_id,
        email=user["email"],
        full_name=profile.get("full_name") if profile else None,
        total_goals=total_goals,
        goals_with_recent_log=goals_with_recent_log,
        pending_reminders=pending_reminders,
        missed_reminders=missed_reminders,
    )
