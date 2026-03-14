from datetime import date, datetime
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


# ── Wellness Goals ────────────────────────────────────────────────────────────

class GoalTypeEnum(str, Enum):
    steps = "steps"
    water = "water"
    sleep = "sleep"


class UnitEnum(str, Enum):
    steps = "steps"
    glasses = "glasses"
    hours = "hours"


class GoalCreate(BaseModel):
    goal_type: GoalTypeEnum
    target_value: float = Field(gt=0)
    unit: UnitEnum


class GoalResponse(BaseModel):
    id: str = Field(alias="_id")
    patient_id: str
    goal_type: GoalTypeEnum
    target_value: float
    unit: UnitEnum
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(populate_by_name=True)


class GoalLogCreate(BaseModel):
    logged_value: float = Field(gt=0)
    log_date: date


class GoalLogResponse(BaseModel):
    id: str = Field(alias="_id")
    goal_id: str
    patient_id: str
    logged_value: float
    log_date: date
    created_at: datetime

    model_config = ConfigDict(populate_by_name=True)


# ── Reminders ─────────────────────────────────────────────────────────────────

class ReminderStatusEnum(str, Enum):
    pending = "pending"
    completed = "completed"
    missed = "missed"


class ReminderCategoryEnum(str, Enum):
    checkup = "checkup"
    vaccination = "vaccination"
    lab = "lab"


class ReminderResponse(BaseModel):
    id: str = Field(alias="_id")
    patient_id: str
    title: str
    description: str | None = None
    due_date: date
    status: ReminderStatusEnum
    category: ReminderCategoryEnum
    created_at: datetime

    model_config = ConfigDict(populate_by_name=True)


class ReminderCreate(BaseModel):
    title: str
    description: str | None = None
    due_date: date
    category: ReminderCategoryEnum


class ReminderStatusUpdate(BaseModel):
    status: ReminderStatusEnum


# ── Provider patient view ─────────────────────────────────────────────────────

class PatientSummary(BaseModel):
    patient_id: str
    email: str
    full_name: str | None = None
    assigned_at: datetime


class PatientComplianceResponse(BaseModel):
    patient_id: str
    email: str
    full_name: str | None = None
    total_goals: int
    goals_with_recent_log: int
    pending_reminders: int
    missed_reminders: int
