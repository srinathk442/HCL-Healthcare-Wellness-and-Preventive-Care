from fastapi import APIRouter, Depends, HTTPException, Request, status
from pymongo import ReturnDocument

from app.auth import require_role
from app.db import get_database
from app.models import ProviderProfileResponse, ProviderProfileUpdate, RoleEnum
from app.utils import serialize_document, utc_now, write_audit_log

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
