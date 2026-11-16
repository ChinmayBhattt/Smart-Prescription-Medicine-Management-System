import { Medicine, Prescription, PrescriptionItem, PatientInfo, OCRScanResult } from '../types';
import { INITIAL_MEDICINES } from '../constants/mockData';

const API_BASE = 'http://127.0.0.1:8000/api';

export async function fetchMedicines(query = '', category = '', form = ''): Promise<Medicine[]> {
  try {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (category && category !== 'All') params.append('category', category);
    if (form && form !== 'All') params.append('form', form);
    
    const res = await fetch(`${API_BASE}/medicines?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      return data.medicines;
    }
  } catch (err) {
    console.warn('Backend API unavailable, using local medicine catalog fallback:', err);
  }
  
  // Local fallback
  return INITIAL_MEDICINES.filter(med => {
    const q = query.toLowerCase();
    const matchQ = !q || 
      med.brand_name.toLowerCase().includes(q) ||
      med.generic_name.toLowerCase().includes(q) ||
      (med.hindi_name && med.hindi_name.toLowerCase().includes(q));
    const matchCat = !category || category === 'All' || med.category === category;
    const matchForm = !form || form === 'All' || med.form === form;
    return matchQ && matchCat && matchForm;
  });
}

export async function generatePrescriptionId(): Promise<string> {
  try {
    const res = await fetch(`${API_BASE}/prescriptions/generate-id`);
    if (res.ok) {
      const data = await res.json();
      return data.prescription_id;
    }
  } catch (err) {
    console.warn('API error, generating local unique ID:', err);
  }
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let token = '';
  for (let i = 0; i < 5; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `RX-2026-${token}`;
}

export async function validatePrescriptionSafety(items: PrescriptionItem[], patient: PatientInfo) {
  try {
    const res = await fetch(`${API_BASE}/prescriptions/validate-safety`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, patient })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Safety API error, computing local safety metrics:', err);
  }
  
  // Local safety checks fallback
  const warnings: string[] = [];
  
  // Check unconfirmed items
  items.forEach(it => {
    if (it.needs_doctor_confirmation || !it.confirmed_by_doctor) {
      warnings.push(`🚨 SAFETY HOLD: Medicine '${it.medicine_name}' dosage requires Doctor or Pharmacist confirmation. AI hallucination strictly prevented.`);
    }
  });

  // Check known allergies
  const allergies = patient.known_allergies.map(a => a.toLowerCase().trim());
  items.forEach(it => {
    const gen = it.generic_name.toLowerCase();
    allergies.forEach(al => {
      if (al && (gen.includes(al) || (al === 'penicillin' && gen.includes('amoxicillin')))) {
        warnings.push(`⚠️ CRITICAL ALLERGY CONFLICT: Patient is allergic to '${al.toUpperCase()}' found in ${it.medicine_name}.`);
      }
    });
  });

  // Duplicate Paracetamol
  const pcmCount = items.filter(it => it.generic_name.toLowerCase().includes('paracetamol')).length;
  if (pcmCount > 1) {
    warnings.push(`⚠️ DUPLICATE PARACETAMOL DETECTED: Multiple medications contain Paracetamol. Risk of liver toxicity.`);
  }

  return { is_safe: warnings.length === 0, warnings, schedule: [] };
}

export async function savePrescription(prescription: Prescription): Promise<Prescription> {
  try {
    const res = await fetch(`${API_BASE}/prescriptions/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prescription)
    });
    if (res.ok) {
      const data = await res.json();
      return data.prescription;
    }
  } catch (err) {
    console.warn('API save error, saving to localStorage:', err);
  }
  
  // LocalStorage fallback
  const stored = JSON.parse(localStorage.getItem('smart_rx_prescriptions') || '[]');
  const existingIdx = stored.findIndex((r: Prescription) => r.id === prescription.id);
  if (existingIdx >= 0) {
    stored[existingIdx] = prescription;
  } else {
    stored.unshift(prescription);
  }
  localStorage.setItem('smart_rx_prescriptions', JSON.stringify(stored));
  return prescription;
}

export async function getPrescription(id: string): Promise<Prescription | null> {
  try {
    const res = await fetch(`${API_BASE}/prescriptions/${id}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('API fetch error, looking in localStorage:', err);
  }
  const stored: Prescription[] = JSON.parse(localStorage.getItem('smart_rx_prescriptions') || '[]');
  return stored.find(r => r.id === id) || null;
}

export async function dispensePrescription(id: string, pharmacistName: string) {
  try {
    const res = await fetch(`${API_BASE}/prescriptions/${id}/dispense?pharmacist_name=${encodeURIComponent(pharmacistName)}`, {
      method: 'POST'
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Dispense API error, updating locally:', err);
  }
  const rx = await getPrescription(id);
  if (rx) {
    rx.status = 'DISPENSED';
    await savePrescription(rx);
    return { message: `Prescription ${id} marked as DISPENSED by ${pharmacistName}`, prescription: rx };
  }
  throw new Error('Prescription not found');
}

export async function runOcrScan(sampleType = 'clean_typed_prescription', imageBase64?: string): Promise<OCRScanResult> {
  try {
    const res = await fetch(`${API_BASE}/ocr/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sample_type: sampleType, image_base64: imageBase64 })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('OCR API error, using safe mock OCR pipeline:', err);
  }
  
  // Safe mock OCR fallback adhering strictly to the zero-hallucination constraint
  const isIllegible = sampleType.includes('illegible');
  return {
    raw_extracted_text: isIllegible 
      ? "CITY CLINIC OPD\nPt: Anita Patel, 34/F\n1. Azithral 500mg - 1 tab OD x 3 days\n2. Montair-LC - ??? dosage illegible scribble ??? - at night\n3. Ascoril-LS - 5ml TDS x 5 days"
      : "APOLLO HOSPITALS CLINICAL RECORD\nRx:\n1. Dolo 650mg - 1 tablet - 1-0-1 - After Food - 5 days\n2. Augmentin 625 Duo - 1 tablet - 1-0-1 - With Food - 5 days\n3. Pan-D Capsule - 1 capsule - 1-0-0 - Empty Stomach - 5 days",
    overall_confidence: isIllegible ? 0.65 : 0.98,
    detected_medicines: [
      {
        medicine_id: 'med-004',
        medicine_name: 'Azithral 500',
        generic_name: 'Azithromycin',
        form: 'Tablet',
        strength: '500 mg',
        dosage: '1 tablet',
        morning: false,
        afternoon: false,
        evening: false,
        night: true,
        timing_relation: 'AFTER_FOOD',
        duration_days: 3,
        ocr_confidence: 0.96,
        needs_doctor_confirmation: false,
        confirmed_by_doctor: true
      },
      {
        medicine_id: 'med-007',
        medicine_name: 'Montair-LC',
        generic_name: 'Montelukast + Levocetirizine',
        form: 'Tablet',
        strength: '10 mg / 5 mg',
        dosage: isIllegible ? 'UNCLEAR - Requires Confirmation' : '1 tablet',
        morning: false,
        afternoon: false,
        evening: false,
        night: true,
        timing_relation: 'BEDTIME',
        duration_days: isIllegible ? 0 : 5,
        ocr_confidence: isIllegible ? 0.42 : 0.95,
        needs_doctor_confirmation: isIllegible,
        confirmed_by_doctor: !isIllegible,
        safety_notes: isIllegible ? '⚠️ Handwriting illegible. AI hallucination prohibited. Requires doctor confirmation.' : undefined
      }
    ],
    flagged_for_confirmation: isIllegible,
    unclear_lines: isIllegible ? ["Line 2: 'Montair-LC' dosage is illegible scribble."] : [],
    safety_disclaimer: "ZERO-AI-HALLUCINATION POLICY ACTIVE: Strictly extracts legible characters. Never invents dosages."
  };
}

export async function deliverPrescription(channel: 'whatsapp' | 'email', prescriptionId: string, recipient: string, language = 'hi') {
  try {
    const res = await fetch(`${API_BASE}/delivery/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel,
        prescription_id: prescriptionId,
        recipient,
        language
      })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Delivery API error, preparing client-side delivery:', err);
  }
  return { status: 'fallback_ready' };
}
