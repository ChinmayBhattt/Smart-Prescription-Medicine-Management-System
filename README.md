# Smart Prescription & Medicine Management System (SmartRx)
### Desktop-First Medical Workstation for Doctors & Pharmacists

[![Go Backend](https://img.shields.io/badge/Backend-Go_(Golang_1.26)-00ADD8.svg?logo=go)](https://golang.org)
[![React](https://img.shields.io/badge/Frontend-React_19_TS-61DAFB.svg?logo=react)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com)
[![Zero AI Hallucination](https://img.shields.io/badge/Safety-Zero_AI_Hallucination-emerald.svg)](https://smartrx.hospital)
[![Bilingual](https://img.shields.io/badge/Bilingual-English_%26_हिन्दी-orange.svg)](#multilingual-output)

A production-grade, desktop-first clinical application built for healthcare practitioners (physicians and pharmacists) with a sleek medical interface, searchable pharmaceutical catalog, drag-and-drop prescription building, cryptographic unique prescription codes, deterministic zero-hallucination OCR text extraction, 24-hour chronological medicine intake schedules, natural voice audio instructions, and multi-channel patient delivery (PDF receipt, WhatsApp, and Resend email).

**Backend Architecture:** Completely written in **Go (Golang)** for sub-millisecond execution, high concurrency, and native single-binary deployment (FastAPI has been completely replaced).

---

## 🌟 Key Architecture & Capabilities

### 1. ⚡ High-Performance Go Backend
* **Native Go Speed & Concurrency**: Written with Go's standard library `net/http` router, thread-safe memory/persistence store, and zero external dependencies.
* **Microsecond Latency**: Instant prescription generation, drug safety checks, and OCR text processing.
* **REST Endpoints**:
  * `GET /api/health` — Service health & engine info.
  * `GET /api/medicines` — Search catalog by brand, generic, or symptoms.
  * `GET /api/prescriptions/generate-id` — Generates unique alphanumeric ID (`RX-2026-XXXXX`).
  * `POST /api/prescriptions/validate-safety` — Clinical interaction & allergy conflict engine.
  * `POST /api/prescriptions/create` — Creates and signs verified prescription.
  * `GET /api/prescriptions/{id}` — Lookup prescription by code.
  * `POST /api/prescriptions/{id}/dispense` — Pharmacist verification & dispensing audit.
  * `POST /api/ocr/scan` — Safe character extraction with zero hallucination guarantee.
  * `POST /api/delivery/send` — WhatsApp Cloud API & Resend email payload dispatch.
  * `GET /api/prescriptions/{id}/voice` — Hindi and English voice readout scripts.

### 2. 🛡️ Strict Zero-AI-Hallucination Safety Protocol
* **Strict Policy Guarantee**: Medical systems must **never** use generative LLMs to guess or invent missing or scribbled dosage instructions.
* **Deterministic Character OCR**: Evaluates confidence per line. If a handwriting slip has ambiguous, scribbled, or unconfirmed dosages, the system issues an explicit safety hold:
  `⚠️ LOW OCR CONFIDENCE: AI Hallucination Prohibited. Dosage must be confirmed by Doctor/Pharmacist.`
* **Safety & Interaction Engine**:
  * Real-time **Duplicate Paracetamol / Analgesic** hepatotoxicity warnings (>3000mg/day).
  * Real-time **Patient Allergy Conflicts** (e.g., Penicillin allergy vs Amoxicillin / Augmentin).
  * **Antibiotic-Antacid Chelation Alerts** (e.g., Fluoroquinolones taken with Pantoprazole or Calcium).

### 3. 💊 Searchable Medicine Catalog & Draggable Cards
* Pre-loaded with Indian and international pharmaceutical formulations (Dolo 650, Augmentin 625, Pan-D, Azithral 500, Glycomet 500, Telma 40, Montair-LC, Shelcal 500, Ascoril-LS, Ciplox 500, Atorva 20, Thyronorm 50, Asthalin Inhaler, Combiflam, etc.).
* Search across Brand names, Generic composition, Hindi names, and Clinical indications.
* Filter by therapeutic categories and dosage forms (Tablet, Capsule, Syrup, Inhaler, Drops).
* HTML5 drag-and-drop support: Drag any card directly into the prescription pad canvas or tap `(+)` to add.

### 4. 📝 Interactive Prescription Builder & Unique Prescription ID
* **Cryptographic Unique Prescription ID**: Formatted as `RX-YYYY-XXXXX` with alphanumeric check-digits (e.g. `RX-2026-7849K`).
* Direct **QR Code generation** for patient scanning and online verification.
* Quick dosage, duration, and food-relation controls (`AFTER_FOOD`, `BEFORE_FOOD`, `EMPTY_STOMACH`, `WITH_FOOD`, `BEDTIME`).
* Visual **M-A-E-N (Morning, Afternoon, Evening, Night)** slot buttons with automatic total quantity calculation.

### 5. 📅 Confirmed 24-Hour Medicine Schedule Section
* Renders a chronological visual matrix based *strictly* on confirmed prescription items:
  * 🌅 **Morning (सुबह ~ 08:00 AM)**
  * ☀️ **Afternoon (दोपहर ~ 01:00 PM)**
  * 🌇 **Evening (शाम ~ 06:00 PM)**
  * 🌙 **Night (रात ~ 09:30 PM)**

### 6. 🌐 Multilingual Output (English & हिन्दी)
* Default language: **English (`'en'`)** with 1-click toggle to **हिन्दी (`'hi'`)** in the header.
* Medication instructions and schedule entries are generated simultaneously in both languages.

### 7. 🔊 Voice Instructions for Patients (Accessibility)
* Browser Web Speech API narration in native **Hindi (`hi-IN`)** and **Indian English (`en-IN`)**.
* Visual animated audio waveform visualizer for elderly, illiterate, or visually impaired patients.

### 8. 📲 Multi-Channel Patient Delivery
* **Official PDF Generation**: Hospital letterhead, doctor credentials, prescription items table, confirmed schedule, QR code, and doctor digital signature block.
* **WhatsApp Cloud API & Direct Chat**: Instant click-to-chat `wa.me` links pre-filled with bilingual schedule text and digital prescription portal link.
* **Resend Email Service**: Clean, responsive HTML email receipt with complete prescription breakdown.

---

## 🚀 Quick Start Guide

### 1. Run the Go (Golang) Backend
```bash
cd backend

# Option A: Run directly with Go
go run .

# Option B: Run compiled binary
./server
```
Backend API will be live at `http://127.0.0.1:8000`.

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
│   ├── go.mod               # Go module definition
│   ├── main.go              # Go HTTP server, REST endpoints & CORS
│   ├── models.go            # Go data structs (Prescription, Patient, Doctor)
│   ├── catalog.go           # Medicine formulations catalog & search
│   ├── safety.go            # Safety engine & 24h schedule generator
│   ├── ocr.go               # Zero-hallucination deterministic OCR parser
│   ├── delivery.go          # WhatsApp & Resend email payload generators
│   ├── speech.go            # Bilingual voice instruction scripts
│   ├── store.go             # Thread-safe in-memory store with demo seeding
│   ├── server               # Compiled native binary executable
│   └── supabase_schema.sql  # Supabase PostgreSQL schema with RLS
├── frontend/
│   ├── src/
│   │   ├── components/      # React UI components (White theme, decongested navbar)
│   │   ├── services/        # REST API, PDF generator & speech service
│   │   ├── types.ts         # TypeScript interfaces
│   │   └── App.tsx          # Master layout orchestrator with natural scrolling
│   └── package.json
└── README.md
```
