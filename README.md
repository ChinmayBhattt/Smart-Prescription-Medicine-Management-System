# Smart Prescription & Medicine Management System (SmartRx)
### Desktop-First Medical Workstation for Doctors & Pharmacists

[![FastAPI](https://img.shields.io/badge/FastAPI-0.163.1-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19_TS-61DAFB.svg?logo=react)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com)
[![Zero AI Hallucination](https://img.shields.io/badge/Safety-Zero_AI_Hallucination-emerald.svg)](https://smartrx.hospital)
[![Bilingual](https://img.shields.io/badge/Bilingual-English_%26_हिन्दी-orange.svg)](#multilingual-output)

A production-grade, desktop-first clinical application built for healthcare practitioners (physicians and pharmacists) with a sleek glassmorphic medical interface, searchable pharmaceutical catalog, drag-and-drop prescription building, cryptographic unique prescription codes, deterministic zero-hallucination OCR text extraction, 24-hour chronological medicine intake schedules, natural voice audio instructions, and multi-channel patient delivery (PDF receipt, WhatsApp, and Resend email).

---

## 🌟 Key Architecture & Capabilities

### 1. 🛡️ Strict Zero-AI-Hallucination Safety Protocol
* **Strict Policy Guarantee**: Medical systems must **never** use generative LLMs to guess or invent missing or scribbled dosage instructions.
* **Deterministic Character OCR**: Evaluates confidence per line. If a handwriting slip has ambiguous, scribbled, or unconfirmed dosages, the system issues an explicit safety hold:
  `⚠️ LOW OCR CONFIDENCE: AI Hallucination Prohibited. Dosage must be confirmed by Doctor/Pharmacist.`
* **Safety & Interaction Engine**:
  * Real-time **Duplicate Paracetamol / Analgesic** hepatotoxicity warnings (>3000mg/day).
  * Real-time **Patient Allergy Conflicts** (e.g., Penicillin allergy vs Amoxicillin / Augmentin).
  * **Antibiotic-Antacid Chelation Alerts** (e.g., Fluoroquinolones taken with Pantoprazole or Calcium).

### 2. 💊 Searchable Medicine Catalog & Draggable Cards
* Pre-loaded with Indian and international pharmaceutical formulations (Dolo 650, Augmentin 625, Pan-D, Azithral 500, Glycomet 500, Telma 40, Montair-LC, Shelcal 500, Ascoril-LS, Ciplox 500, Atorva 20, Thyronorm 50, Asthalin Inhaler, Combiflam, etc.).
* Search across Brand names, Generic composition, Hindi names, and Clinical indications.
* Filter by therapeutic categories and dosage forms (Tablet, Capsule, Syrup, Inhaler, Drops).
* HTML5 drag-and-drop support: Drag any card directly into the prescription pad canvas or tap `(+)` to add.

### 3. 📝 Interactive Prescription Builder & Unique Prescription ID
* **Cryptographic Unique Prescription ID**: Formatted as `RX-YYYY-XXXXX` with alphanumeric check-digits (e.g. `RX-2026-7849K`).
* Direct **QR Code generation** for patient scanning and online verification.
* Quick dosage, duration, and food-relation controls (`AFTER_FOOD`, `BEFORE_FOOD`, `EMPTY_STOMACH`, `WITH_FOOD`, `BEDTIME`).
* Visual **M-A-E-N (Morning, Afternoon, Evening, Night)** slot buttons with automatic total quantity calculation.

### 4. 📅 Confirmed 24-Hour Medicine Schedule Section
* Renders a chronological visual matrix based *strictly* on confirmed prescription items:
  * 🌅 **Morning (सुबह ~ 08:00 AM)**
  * ☀️ **Afternoon (दोपहर ~ 01:00 PM)**
  * 🌇 **Evening (शाम ~ 06:00 PM)**
  * 🌙 **Night (रात ~ 09:30 PM)**
* Formatted in high-contrast card blocks with pill badges, food relations, and bilingual instructions.

### 5. 🌐 Multilingual Output (English & हिन्दी)
* Instant UI language toggle between **English** and **हिन्दी**.
* Every medication instruction is dynamically formulated in both languages:
  * *English:* "Take 1 tablet after food in the Morning & Night for 5 days."
  * *हिन्दी:* "सुबह और रात में 1 गोली भोजन के बाद, 5 दिनों तक लें।"

### 6. 🔊 Voice Instructions for Patients (Accessibility)
* Browser Web Speech API narration in native **Hindi (`hi-IN`)** and **Indian English (`en-IN`)**.
* Visual animated audio waveform inspired by modern voice AI workstations.
* Full spoken transcript box for elderly, illiterate, or visually impaired patients.

### 7. 📲 Multi-Channel Patient Delivery
* **Official PDF Generation**: Hospital letterhead, doctor credentials, prescription items table, confirmed schedule, QR code, and doctor digital signature block.
* **WhatsApp Cloud API & Direct Chat**: Instant click-to-chat `wa.me` links pre-filled with bilingual schedule text and digital prescription portal link.
* **Resend Email Service**: Clean, responsive HTML email receipt with complete prescription breakdown.
* **Live On-Screen QR Code**: Patients can point their smartphone camera at the doctor's screen to open their interactive schedule immediately.

### 8. 🏪 Pharmacist Dispensing Portal
* Search by unique prescription code.
* Verify doctor signature, check inventory quantities, and mark prescription as `DISPENSED`.
* Audit logging of dispensing pharmacist and timestamps.

### 9. 🗄️ Supabase Database Ready (सुपाबेस)
* Includes complete `backend/supabase_schema.sql` with tables for `doctors`, `patients`, `medicines`, `prescriptions`, `prescription_items`, and `audit_logs` with Row Level Security (RLS) policies.
* Integrated local SQLite fallback (`backend/smart_prescription.db`) for immediate zero-config execution.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+) & npm
- Python (v3.10+)

### 1. Run the Python FastAPI Backend
```bash
# Activate virtual environment
source backend/venv/bin/activate

# Start server
PYTHONPATH=backend uvicorn app.main:app --host 127.0.0.1 --port 8000
```
Backend API will be live at `http://127.0.0.1:8000` (Docs at `/docs`).

### 2. Run the React Desktop Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend workstation will be live at `http://127.0.0.1:5173`.

---

## 📁 Repository Structure
```
smart prescription system/
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI application & REST endpoints
│   │   ├── models.py             # Pydantic data schemas
│   │   ├── medicine_catalog.py   # Curated medicine formulations catalog
│   │   ├── safety_engine.py      # Drug interactions, allergy & schedule generator
│   │   ├── ocr_service.py        # Zero-hallucination deterministic OCR parser
│   │   ├── delivery_service.py   # WhatsApp & Resend email payload generators
│   │   ├── speech_service.py     # Bilingual voice instruction scripts
│   │   └── database.py           # Database connector (Supabase + SQLite fallback)
│   ├── supabase_schema.sql       # Production Supabase PostgreSQL schema with RLS
│   └── smart_prescription.db     # Local SQLite database
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx                 # Workstation top bar & language toggle
│   │   │   ├── MedicineCatalog.tsx        # Searchable catalog & category filters
│   │   │   ├── MedicineCard.tsx           # Draggable medicine card
│   │   │   ├── PrescriptionBuilder.tsx    # Drag-and-drop canvas & item editor
│   │   │   ├── MedicineSchedule.tsx       # 24-hr chronological intake schedule
│   │   │   ├── OCRScannerModal.tsx        # Safe zero-hallucination OCR modal
│   │   │   ├── DeliveryModal.tsx          # WhatsApp, Resend, PDF & QR delivery
│   │   │   ├── VoiceInstructionPlayer.tsx # Speech synthesis player with animated waves
│   │   │   ├── PharmacistPortal.tsx       # Pharmacist verification & dispensing
│   │   │   ├── PatientPortal.tsx          # Patient-facing portal with adherence checklist
│   │   │   └── SafetyAuditDrawer.tsx      # Clinical safety & compliance audit
│   │   ├── services/
│   │   │   ├── api.ts                     # Backend REST API integration
│   │   │   ├── pdfGenerator.ts            # jsPDF letterhead & QR receipt builder
│   │   │   └── speechService.ts           # Web Speech API Hindi/English narrator
│   │   ├── constants/mockData.ts          # Default doctors, patients & medicines
│   │   ├── types.ts                       # TypeScript interfaces
│   │   └── App.tsx                        # Main workstation orchestrator
│   └── package.json
└── README.md
```
# Smart-Prescription-Medicine-Management-System
# Smart-Prescription-Medicine-Management-System
