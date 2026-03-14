from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.config import settings
from app.db import get_database
from app.models import RoleEnum, UserTokenData
from app.utils import parse_object_id

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(user_id: str, email: str, role: RoleEnum | str) -> str:
    expire_minutes = settings.jwt_access_token_expire_minutes
    role_value = role.value if isinstance(role, RoleEnum) else role
    payload = {
        "sub": user_id,
        "email": email,
        "role": role_value,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=expire_minutes),
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
    )

    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        token_data = UserTokenData(
            user_id=payload.get("sub"),
            email=payload.get("email"),
            role=payload.get("role"),
        )
    except Exception:
        raise credentials_error

    db = get_database()
    user = await db["users"].find_one({"_id": parse_object_id(token_data.user_id)})
    if not user:
        raise credentials_error
    return user


def require_role(required_role: RoleEnum):
    async def role_dependency(current_user: dict = Depends(get_current_user)) -> dict:
        if current_user["role"] != required_role.value:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not allowed to access this resource.",
            )
        return current_user

    return role_dependency
