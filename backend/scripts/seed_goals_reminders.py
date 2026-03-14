"""
Seed only wellness_goals, goal_logs, and reminders for existing patients.
Run from backend folder: python -m scripts.seed_goals_reminders

Use this when you already have patients and only need goals/reminders data.
"""
from pathlib import Path

from dotenv import load_dotenv
from pymongo import MongoClient

from scripts.seed_data import (
    DATABASE_NAME,
    MONGODB_URL,
    seed_wellness_goals_and_reminders,
    utc_now,
)

load_dotenv(Path(__file__).resolve().parent.parent / ".env")


def main():
    client = MongoClient(MONGODB_URL, serverSelectionTimeoutMS=60_000, connectTimeoutMS=60_000)
    db = client[DATABASE_NAME]

    patient_user_ids = [doc["user_id"] for doc in db["patient_profiles"].find({}, {"user_id": 1})]
    if not patient_user_ids:
        print("No patient profiles found. Run seed_data.py first to create patients.")
        return

    print(f"Seeding goals and reminders for {len(patient_user_ids)} patients...")
    seed_wellness_goals_and_reminders(db, patient_user_ids, utc_now())
    print("Done.")


if __name__ == "__main__":
    main()
