from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.db import close_mongo_connection, connect_to_mongo
from app.routes.auth import router as auth_router
from app.routes.patient import router as patient_router
from app.routes.provider import router as provider_router
from app.routes.public import router as public_router


@asynccontextmanager
async def lifespan(_: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()


app = FastAPI(title="HealthGuard API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(patient_router)
app.include_router(provider_router)
app.include_router(public_router)


@app.get("/")
async def root() -> dict:
    return {"message": "HealthGuard backend is running."}


@app.get("/health")
async def health_check() -> dict:
    return {"status": "ok"}
