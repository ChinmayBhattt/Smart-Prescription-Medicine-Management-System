-- =========================================================================
-- SMART PRESCRIPTION & MEDICINE MANAGEMENT SYSTEM - SUPABASE SCHEMA (सुपाबेस)
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Doctors table
CREATE TABLE IF NOT EXISTS doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    qualification TEXT NOT NULL,
    registration_number TEXT UNIQUE NOT NULL,
    clinic_hospital TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Patients table
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    age INTEGER NOT NULL,
    gender TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    known_allergies TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Medicines catalog table
CREATE TABLE IF NOT EXISTS medicines (
    id TEXT PRIMARY KEY,
    brand_name TEXT NOT NULL,
    generic_name TEXT NOT NULL,
    category TEXT NOT NULL,
    form TEXT NOT NULL,
    strength TEXT NOT NULL,
    composition TEXT NOT NULL,
    hindi_name TEXT,
    default_timing TEXT DEFAULT 'AFTER_FOOD',
    contraindications TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Prescriptions table with Unique Verification Code
CREATE TABLE IF NOT EXISTS prescriptions (
    id TEXT PRIMARY KEY, -- e.g., 'RX-2026-89412'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    doctor_id UUID REFERENCES doctors(id),
    patient_id UUID REFERENCES patients(id),
    doctor_info JSONB NOT NULL,
    patient_info JSONB NOT NULL,
    diagnosis TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'CONFIRMED_BY_DOCTOR', -- 'DRAFT', 'CONFIRMED_BY_DOCTOR', 'DISPENSED'
    notes TEXT,
    follow_up_days INTEGER DEFAULT 7,
    confirmed_schedule JSONB NOT NULL DEFAULT '[]'::JSONB,
    safety_warnings TEXT[] DEFAULT ARRAY[]::TEXT[],
    digital_receipt_url TEXT,
    qr_code_data TEXT
);

-- 5. Prescription items (individual medicines)
CREATE TABLE IF NOT EXISTS prescription_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id TEXT REFERENCES prescriptions(id) ON DELETE CASCADE,
    medicine_id TEXT NOT NULL,
    medicine_name TEXT NOT NULL,
    generic_name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    morning BOOLEAN DEFAULT FALSE,
    afternoon BOOLEAN DEFAULT FALSE,
    evening BOOLEAN DEFAULT FALSE,
    night BOOLEAN DEFAULT FALSE,
    timing_relation TEXT DEFAULT 'AFTER_FOOD',
    duration_days INTEGER DEFAULT 5,
    instructions_en TEXT,
    instructions_hi TEXT,
    is_ocr_extracted BOOLEAN DEFAULT FALSE,
    ocr_confidence NUMERIC(4, 2),
    needs_doctor_confirmation BOOLEAN DEFAULT FALSE,
    confirmed_by_doctor BOOLEAN DEFAULT TRUE,
    safety_notes TEXT
);

-- 6. Audit Log for Safety & Zero-Hallucination Compliance
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id TEXT REFERENCES prescriptions(id),
    action TEXT NOT NULL, -- 'OCR_PROCESSED', 'DOCTOR_CONFIRMED', 'PHARMACY_DISPENSED', 'DELIVERED_WHATSAPP'
    performed_by TEXT NOT NULL,
    details JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read access to verify prescriptions by unique ID
CREATE POLICY "Public read prescription by unique ID"
    ON prescriptions FOR SELECT
    USING (true);

-- Allow authenticated doctors to insert/update prescriptions
CREATE POLICY "Doctors manage prescriptions"
    ON prescriptions FOR ALL
    USING (auth.role() = 'authenticated');
