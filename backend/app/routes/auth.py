from fastapi import APIRouter, HTTPException, Request, status

from app.auth import create_access_token, hash_password, verify_password
from app.db import get_database
from app.models import LoginRequest, MessageResponse, RegisterRequest, TokenResponse
from app.utils import serialize_document, utc_now, write_audit_log

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def register_user(payload: RegisterRequest, request: Request) -> MessageResponse:
    if not payload.consent_given:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Consent is required to register.",
        )

    db = get_database()
    existing_user = await db["users"].find_one({"email": payload.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already registered.",
        )

    now = utc_now()
    user_document = {
        "email": payload.email,
        "password_hash": hash_password(payload.password),
        "role": payload.role.value,
        "is_active": True,
        "consent_given": payload.consent_given,
        "created_at": now,
        "updated_at": now,
    }
    user_result = await db["users"].insert_one(user_document)

    if payload.role.value == "patient":
        await db["patient_profiles"].insert_one(
            {
                "user_id": user_result.inserted_id,
                "full_name": None,
                "age": None,
                "gender": None,
                "phone": None,
                "allergies": [],
                "current_medications": [],
                "blood_type": None,
                "emergency_contact": None,
                "updated_at": now,
            }
        )
    else:
        await db["provider_profiles"].insert_one(
            {
                "user_id": user_result.inserted_id,
                "full_name": None,
                "phone": None,
                "specialization": None,
                "license_number": None,
                "hospital_or_clinic": None,
                "years_of_experience": None,
                "updated_at": now,
            }
        )

    await write_audit_log(
        user_id=str(user_result.inserted_id),
        user_role=payload.role.value,
        action="REGISTER",
        resource="users",
        ip_address=request.client.host if request.client else None,
    )
    return MessageResponse(message="User registered successfully.")


@router.post("/login", response_model=TokenResponse)
async def login_user(payload: LoginRequest, request: Request) -> TokenResponse:
    db = get_database()
    user = await db["users"].find_one({"email": payload.email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive.",
        )

    token = create_access_token(
        user_id=str(user["_id"]),
        email=user["email"],
        role=user["role"],
    )

    await write_audit_log(
        user_id=str(user["_id"]),
        user_role=user["role"],
        action="LOGIN",
        resource="users",
        ip_address=request.client.host if request.client else None,
    )
    return TokenResponse(access_token=token, role=user["role"])


@router.post("/logout", response_model=MessageResponse)
async def logout_user() -> MessageResponse:
    return MessageResponse(message="Logout successful on client side.")
