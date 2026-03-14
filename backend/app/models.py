from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class RoleEnum(str, Enum):
    patient = "patient"
    provider = "provider"


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    role: RoleEnum
    consent_given: bool


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: RoleEnum


class MessageResponse(BaseModel):
    message: str


class PatientProfileBase(BaseModel):
    full_name: str | None = None
    age: int | None = Field(default=None, ge=0)
    gender: str | None = None
    phone: str | None = None
    allergies: list[str] = Field(default_factory=list)
    current_medications: list[str] = Field(default_factory=list)
    blood_type: str | None = None
    emergency_contact: str | None = None


class PatientProfileUpdate(PatientProfileBase):
    pass


class PatientProfileResponse(PatientProfileBase):
    id: str = Field(alias="_id")
    user_id: str
    updated_at: datetime | None = None

    model_config = ConfigDict(populate_by_name=True)


class ProviderProfileBase(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    specialization: str | None = None
    license_number: str | None = None
    hospital_or_clinic: str | None = None
    years_of_experience: int | None = Field(default=None, ge=0)


class ProviderProfileUpdate(ProviderProfileBase):
    pass


class ProviderProfileResponse(ProviderProfileBase):
    id: str = Field(alias="_id")
    user_id: str
    updated_at: datetime | None = None

    model_config = ConfigDict(populate_by_name=True)


class UserTokenData(BaseModel):
    user_id: str
    email: EmailStr
    role: RoleEnum
