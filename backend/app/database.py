import os
import sqlite3
import json
from typing import Optional, List, Dict, Any
from app.models import Prescription, PrescriptionStatus

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "smart_prescription.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS prescriptions (
        id TEXT PRIMARY KEY,
        created_at TEXT NOT NULL,
        doctor_name TEXT NOT NULL,
        patient_name TEXT NOT NULL,
        patient_phone TEXT,
        status TEXT NOT NULL,
        raw_json TEXT NOT NULL
    )
    """)
    conn.commit()
    conn.close()

def save_prescription_to_db(rx: Prescription):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
    INSERT OR REPLACE INTO prescriptions (id, created_at, doctor_name, patient_name, patient_phone, status, raw_json)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        rx.id,
        rx.created_at.isoformat(),
        rx.doctor.name,
        rx.patient.name,
        rx.patient.phone,
        rx.status.value,
        rx.model_dump_json()
    ))
    conn.commit()
    conn.close()

def get_prescription_by_id(rx_id: str) -> Optional[Dict[str, Any]]:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT raw_json FROM prescriptions WHERE id = ?", (rx_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return json.loads(row[0])
    return None

def list_all_prescriptions() -> List[Dict[str, Any]]:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT raw_json FROM prescriptions ORDER BY created_at DESC LIMIT 50")
    rows = cursor.fetchall()
    conn.close()
    return [json.loads(r[0]) for r in rows]

# Initialize local DB on module import
init_db()
