from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum

class PrescriptionStatus(str, Enum):
    DRAFT = "DRAFT"
    CONFIRMED_BY_DOCTOR = "CONFIRMED_BY_DOCTOR"
    DISPENSED = "DISPENSED"
    CANCELLED = "CANCELLED"

class TimingRelation(str, Enum):
    BEFORE_FOOD = "BEFORE_FOOD"
    AFTER_FOOD = "AFTER_FOOD"
    WITH_FOOD = "WITH_FOOD"
    EMPTY_STOMACH = "EMPTY_STOMACH"
    BEDTIME = "BEDTIME"

class DosageForm(str, Enum):
    TABLET = "Tablet"
    CAPSULE = "Capsule"
    SYRUP = "Syrup"
    DROPS = "Drops"
    INJECTION = "Injection"
    OINTMENT = "Ointment"
    INHALER = "Inhaler"

class Medicine(BaseModel):
    id: str
    brand_name: str
    generic_name: str
    category: str
    form: DosageForm
    strength: str
    composition: str
    standard_unit: str = "tablet"
    common_indications: List[str] = []
    hindi_name: Optional[str] = None
    default_timing: TimingRelation = TimingRelation.AFTER_FOOD
    contraindications: List[str] = []

class PrescriptionItem(BaseModel):
    id: str
    medicine_id: str
    medicine_name: str
    generic_name: str
    form: str
    strength: str
    dosage: str  # e.g., "1 tablet", "5 ml"
    # Timing flags: Morning, Afternoon, Evening, Night
    morning: bool = False
    afternoon: bool = False
    evening: bool = False
    night: bool = False
    timing_relation: TimingRelation = TimingRelation.AFTER_FOOD
    duration_days: int = 5
    instructions_en: str = ""
    instructions_hi: str = ""
    total_quantity: int = 10
    
    # Safety and OCR verification fields
    is_ocr_extracted: bool = False
    ocr_confidence: Optional[float] = None
    needs_doctor_confirmation: bool = False
    confirmed_by_doctor: bool = True
    safety_notes: Optional[str] = None

class PatientInfo(BaseModel):
    name: str
    age: int
    gender: str
    phone: str
    email: Optional[str] = None
    address: Optional[str] = None
    known_allergies: List[str] = []
    diagnosis: str
    vitals: Optional[Dict[str, str]] = None  # BP, Pulse, Weight, SpO2

class DoctorInfo(BaseModel):
    name: str
    qualification: str
    reg_number: str
    clinic_hospital: str
    phone: str
    email: str
    signature_token: Optional[str] = None

class ConfirmedScheduleEntry(BaseModel):
    time_slot: str  # "Morning", "Afternoon", "Evening", "Night"
    time_label_hi: str  # "सुबह", "दोपहर", "शाम", "रात"
    approx_time: str  # "08:00 AM", "01:00 PM", "06:00 PM", "09:00 PM"
    relation: str  # "After Food", "Before Food"
    relation_hi: str
    medicines: List[Dict[str, Any]]

class Prescription(BaseModel):
    id: str  # e.g., RX-2026-89412
    created_at: datetime = Field(default_factory=datetime.now)
    doctor: DoctorInfo
    patient: PatientInfo
    status: PrescriptionStatus = PrescriptionStatus.CONFIRMED_BY_DOCTOR
    items: List[PrescriptionItem]
    notes: Optional[str] = None
    follow_up_days: Optional[int] = 7
    schedule: List[ConfirmedScheduleEntry] = []
    safety_warnings: List[str] = []
    digital_receipt_url: Optional[str] = None
    qr_code_data: Optional[str] = None

class OCRScanRequest(BaseModel):
    image_base64: Optional[str] = None
    sample_type: Optional[str] = "handwritten_clinic_slip"

class OCRScanResult(BaseModel):
    raw_extracted_text: str
    overall_confidence: float
    detected_medicines: List[Dict[str, Any]]
    flagged_for_confirmation: bool
    safety_disclaimer: str
    unclear_lines: List[str] = []

class DeliveryRequest(BaseModel):
    prescription_id: str
    channel: str  # "whatsapp", "email", "sms", "download"
    recipient: str  # phone number or email address
    language: str = "hi"  # "en" or "hi"
