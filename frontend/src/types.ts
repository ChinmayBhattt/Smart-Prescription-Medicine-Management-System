export type TimingRelation = 
  | 'AFTER_FOOD'
  | 'BEFORE_FOOD'
  | 'WITH_FOOD'
  | 'EMPTY_STOMACH'
  | 'BEDTIME';

export type DosageForm = 
  | 'Tablet'
  | 'Capsule'
  | 'Syrup'
  | 'Drops'
  | 'Injection'
  | 'Ointment'
  | 'Inhaler';

export type PrescriptionStatus = 
  | 'DRAFT'
  | 'CONFIRMED_BY_DOCTOR'
  | 'DISPENSED'
  | 'CANCELLED';

export interface Medicine {
  id: string;
  brand_name: string;
  generic_name: string;
  category: string;
  form: DosageForm;
  strength: string;
  composition: string;
  standard_unit: string;
  common_indications: string[];
  hindi_name?: string;
  default_timing: TimingRelation;
  contraindications: string[];
  source?: 'rxnorm' | 'openfda' | 'drugsetu' | 'clinic';
}

export interface PrescriptionItem {
  id: string;
  medicine_id: string;
  medicine_name: string;
  generic_name: string;
  form: string;
  strength: string;
  dosage: string;
  morning: boolean;
  afternoon: boolean;
  evening: boolean;
  night: boolean;
  timing_relation: TimingRelation;
  duration_days: number;
  instructions_en: string;
  instructions_hi: string;
  total_quantity: number;
  
  // OCR & Safety fields
  is_ocr_extracted?: boolean;
  ocr_confidence?: number;
  needs_doctor_confirmation: boolean;
  confirmed_by_doctor: boolean;
  safety_notes?: string;
}

export interface PatientInfo {
  name: string;
  age: number;
  gender: string;
  phone: string;
  email?: string;
  address?: string;
  known_allergies: string[];
  diagnosis: string;
}

export interface DoctorInfo {
  name: string;
  qualification: string;
  reg_number: string;
  clinic_hospital: string;
  phone: string;
  email: string;
}

export interface ConfirmedScheduleEntry {
  time_slot: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  time_label_hi: string;
  approx_time: string;
  relation: string;
  relation_hi: string;
  medicines: {
    medicine_name: string;
    generic_name: string;
    form: string;
    strength: string;
    dosage: string;
    relation_en: string;
    relation_hi: string;
    instruction_en: string;
    instruction_hi: string;
    duration_days: number;
    is_unconfirmed?: boolean;
  }[];
}

export interface Prescription {
  id: string;
  created_at: string;
  doctor: DoctorInfo;
  patient: PatientInfo;
  status: PrescriptionStatus;
  items: PrescriptionItem[];
  notes?: string;
  follow_up_days?: number;
  schedule: ConfirmedScheduleEntry[];
  safety_warnings: string[];
  digital_receipt_url?: string;
  qr_code_data?: string;
}

export interface OCRScanResult {
  raw_extracted_text: string;
  overall_confidence: number;
  detected_medicines: Partial<PrescriptionItem>[];
  flagged_for_confirmation: boolean;
  safety_disclaimer: string;
  unclear_lines: string[];
}
