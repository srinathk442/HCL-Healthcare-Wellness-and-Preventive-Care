from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo import ASCENDING

from app.config import settings

client: AsyncIOMotorClient | None = None
database: AsyncIOMotorDatabase | None = None


def get_database() -> AsyncIOMotorDatabase:
    if database is None:
        raise RuntimeError("Database has not been initialized.")
    return database


async def connect_to_mongo() -> None:
    global client, database

    client = AsyncIOMotorClient(settings.mongodb_url)
    database = client[settings.database_name]
    await create_indexes()


async def close_mongo_connection() -> None:
    global client, database

    if client is not None:
        client.close()
    client = None
    database = None


async def create_indexes() -> None:
    db = get_database()

    await db["users"].create_index("email", unique=True)
    await db["users"].create_index("role")
    await db["patient_profiles"].create_index("user_id", unique=True)
    await db["provider_profiles"].create_index("user_id", unique=True)
    await db["provider_profiles"].create_index("license_number", unique=True, sparse=True)
    await db["goal_logs"].create_index(
        [("patient_id", ASCENDING), ("log_date", ASCENDING)]
    )
    await db["reminders"].create_index(
        [("patient_id", ASCENDING), ("due_date", ASCENDING)]
    )
    await db["audit_logs"].create_index(
        [("user_id", ASCENDING), ("timestamp", ASCENDING)]
    )
    await db["provider_patient"].create_index(
        [("provider_id", ASCENDING), ("patient_id", ASCENDING)],
        unique=True,
    )
