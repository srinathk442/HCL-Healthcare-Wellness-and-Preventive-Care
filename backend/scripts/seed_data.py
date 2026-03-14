"""
Seed MongoDB with 10 providers and 100 patients.
Run from backend folder: python -m scripts.seed_data

Default password for all seeded users: HealthGuard1
"""
import os
import random
from datetime import date, datetime, timedelta, time, timezone
from pathlib import Path

from dotenv import load_dotenv
from pymongo import MongoClient
import bcrypt

# Load .env from backend folder
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "healthguard")
SEED_PASSWORD = "HealthGuard1"

# Sample data for variety
FIRST_NAMES = [
    "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda",
    "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
    "Thomas", "Sarah", "Charles", "Karen", "Daniel", "Nancy", "Matthew", "Betty",
    "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley", "Steven", "Kimberly",
    "Paul", "Emily", "Andrew", "Donna", "Joshua", "Michelle", "Kenneth", "Carol",
    "Kevin", "Amanda", "Brian", "Dorothy", "George", "Melissa", "Timothy", "Deborah",
]
LAST_NAMES = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
    "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
    "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Thompson", "White",
    "Harris", "Clark", "Lewis", "Robinson", "Walker", "Young", "Allen", "King",
]
SPECIALIZATIONS = [
    "General Practice", "Cardiology", "Internal Medicine", "Pediatrics", "Family Medicine",
    "Pulmonology", "Endocrinology", "Neurology", "Dermatology", "Orthopedics",
]
HOSPITALS = [
    "City General Hospital", "Metro Health Clinic", "Riverside Medical Center",
    "Sunrise Family Health", "Valley View Hospital", "Central Care Clinic",
    "Parkland Medical", "Unity Health Network", "Community First Clinic", "CarePlus Medical",
]
BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
GENDERS = ["Male", "Female", "Other"]
SAMPLE_ALLERGIES = ["Penicillin", "Peanuts", "Shellfish", "Latex", "Pollen", "None"]
SAMPLE_MEDS = ["Metformin", "Lisinopril", "Amlodipine", "Omeprazole", "Atorvastatin", "None"]

GOAL_TYPES = ["steps", "water", "sleep"]
GOAL_UNITS = {"steps": "steps", "water": "glasses", "sleep": "hours"}
GOAL_TARGETS = {"steps": (5000, 12000), "water": (6, 12), "sleep": (6.0, 9.0)}

REMINDER_TITLES = [
    "Annual physical exam", "Flu vaccination", "Blood pressure check",
    "Cholesterol screening", "Dental checkup", "Eye exam", "Colonoscopy screening",
    "Mammogram", "Diabetes A1C test", "Thyroid function test", "Vitamin D level",
    "COVID-19 booster", "Tetanus booster", "Pneumonia vaccine",
]
REMINDER_CATEGORIES = ["checkup", "vaccination", "lab"]
REMINDER_STATUSES = ["pending", "completed", "missed"]


def utc_now():
    return datetime.now(timezone.utc)


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def _date_to_datetime(d: date) -> datetime:
    """Convert date to datetime at midnight UTC for BSON encoding."""
    return datetime.combine(d, time.min, tzinfo=timezone.utc)


def seed_wellness_goals_and_reminders(db, patient_user_ids, now):
    """Add wellness_goals, goal_logs, and reminders for each patient."""
    today = date.today()

    for patient_id in patient_user_ids:
        # ---- Wellness goals (1-3 per patient: steps, water, sleep) ----
        for goal_type in random.sample(GOAL_TYPES, random.randint(1, 3)):
            low, high = GOAL_TARGETS[goal_type]
            if isinstance(low, float):
                target = round(random.uniform(low, high), 1)
            else:
                target = float(random.randint(low, high))
            goal_doc = {
                "patient_id": patient_id,
                "goal_type": goal_type,
                "target_value": target,
                "unit": GOAL_UNITS[goal_type],
                "is_active": True,
                "created_at": now,
            }
            gr = db["wellness_goals"].insert_one(goal_doc)
            goal_id = gr.inserted_id

            # Goal logs: last 7-14 days of random progress (store as datetime for BSON)
            num_days = random.randint(7, 14)
            for d in range(num_days):
                log_date = today - timedelta(days=d)
                if goal_type == "steps":
                    logged = random.randint(int(target * 0.4), int(target * 1.2))
                elif goal_type == "water":
                    logged = random.randint(max(0, int(target) - 2), int(target) + 2)
                else:
                    logged = round(random.uniform(target - 1.5, target + 1.0), 1)
                db["goal_logs"].insert_one({
                    "goal_id": goal_id,
                    "patient_id": patient_id,
                    "logged_value": logged,
                    "log_date": _date_to_datetime(log_date),
                    "created_at": now,
                })

        # ---- Reminders (2-5 per patient, mix of pending/completed/missed) ----
        num_reminders = random.randint(2, 5)
        for _ in range(num_reminders):
            title = random.choice(REMINDER_TITLES)
            due_date = today + timedelta(days=random.randint(-30, 60))
            status = random.choice(REMINDER_STATUSES)
            category = random.choice(REMINDER_CATEGORIES)
            db["reminders"].insert_one({
                "patient_id": patient_id,
                "title": title,
                "description": f"Schedule or complete: {title}",
                "due_date": _date_to_datetime(due_date),
                "status": status,
                "category": category,
                "created_at": now,
            })


def main():
    client = MongoClient(MONGODB_URL, serverSelectionTimeoutMS=60_000, connectTimeoutMS=60_000)
    db = client[DATABASE_NAME]

    # Check if already seeded (optional: skip if you want to re-run and duplicate)
    existing_users = db["users"].count_documents({})
    if existing_users > 0:
        print(f"Found {existing_users} existing users. Run anyway? (y/n): ", end="")
        if input().strip().lower() != "y":
            print("Aborted.")
            return
    else:
        print("Seeding 10 providers and 100 patients...")

    now = utc_now()
    password_hash = hash_password(SEED_PASSWORD)

    # ---- PROVIDERS (10) ----
    provider_user_ids = []
    used_emails = set()
    used_licenses = set()

    for i in range(10):
        first = random.choice(FIRST_NAMES)
        last = random.choice(LAST_NAMES)
        email = f"provider{i + 1}@healthguard.demo"
        used_emails.add(email)

        license_num = f"MD{10000 + i}{random.randint(10, 99)}"
        while license_num in used_licenses:
            license_num = f"MD{10000 + i}{random.randint(10, 99)}"
        used_licenses.add(license_num)

        user_doc = {
            "email": email,
            "password_hash": password_hash,
            "role": "provider",
            "is_active": True,
            "consent_given": True,
            "created_at": now,
            "updated_at": now,
        }
        r = db["users"].insert_one(user_doc)
        provider_user_ids.append(r.inserted_id)

        db["provider_profiles"].insert_one({
            "user_id": r.inserted_id,
            "full_name": f"{first} {last}",
            "phone": f"+1-555-{100 + i}{random.randint(10, 99)}-{random.randint(1000, 9999)}",
            "specialization": SPECIALIZATIONS[i % len(SPECIALIZATIONS)],
            "license_number": license_num,
            "hospital_or_clinic": HOSPITALS[i % len(HOSPITALS)],
            "years_of_experience": random.randint(5, 30),
            "updated_at": now,
        })

    print("  Created 10 providers.")

    # ---- PATIENTS (100) ----
    patient_user_ids = []
    for i in range(100):
        first = random.choice(FIRST_NAMES)
        last = random.choice(LAST_NAMES)
        email = f"patient{i + 1}@healthguard.demo"
        used_emails.add(email)

        user_doc = {
            "email": email,
            "password_hash": password_hash,
            "role": "patient",
            "is_active": True,
            "consent_given": True,
            "created_at": now,
            "updated_at": now,
        }
        r = db["users"].insert_one(user_doc)
        patient_user_ids.append(r.inserted_id)

        allergies = random.sample(SAMPLE_ALLERGIES, random.randint(0, 2))
        if "None" in allergies:
            allergies = []
        meds = random.sample(SAMPLE_MEDS, random.randint(0, 2))
        if "None" in meds:
            meds = []

        db["patient_profiles"].insert_one({
            "user_id": r.inserted_id,
            "full_name": f"{first} {last}",
            "age": random.randint(18, 85),
            "gender": random.choice(GENDERS),
            "phone": f"+1-555-{200 + (i % 100)}{random.randint(10, 99)}-{random.randint(1000, 9999)}",
            "allergies": allergies,
            "current_medications": meds,
            "blood_type": random.choice(BLOOD_TYPES),
            "emergency_contact": f"+1-555-{300 + (i % 100)}-{random.randint(1000, 9999)}",
            "updated_at": now,
        })

    print("  Created 100 patients.")

    # ---- PROVIDER-PATIENT ASSIGNMENTS (each patient assigned to one provider, ~10 per provider) ----
    for idx, patient_id in enumerate(patient_user_ids):
        provider_id = provider_user_ids[idx % 10]
        db["provider_patient"].insert_one({
            "provider_id": provider_id,
            "patient_id": patient_id,
            "assigned_at": now,
            "is_active": True,
        })
    print("  Assigned patients to providers.")

    # ---- Wellness goals, goal_logs, and reminders for each patient ----
    seed_wellness_goals_and_reminders(db, patient_user_ids, now)
    print("  Created wellness goals, goal logs, and reminders for all patients.")

    print("Done. All seeded users have password:", SEED_PASSWORD)
    print("Provider logins: provider1@healthguard.demo ... provider10@healthguard.demo")
    print("Patient logins: patient1@healthguard.demo ... patient100@healthguard.demo")


if __name__ == "__main__":
    main()
