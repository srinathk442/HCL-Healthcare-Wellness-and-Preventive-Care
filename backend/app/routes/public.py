from fastapi import APIRouter

router = APIRouter(prefix="/api/public", tags=["public"])


@router.get("/health-info")
async def get_public_health_info() -> dict:
    return {
        "tips": [
            "Drink enough water during the day.",
            "Try to maintain a regular sleep schedule.",
            "Walk daily and keep up with preventive checkups.",
        ]
    }
