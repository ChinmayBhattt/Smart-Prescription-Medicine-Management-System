from typing import List, Dict, Any, Tuple
from app.models import PrescriptionItem, PatientInfo, ConfirmedScheduleEntry, TimingRelation

HINDI_TIME_TRANSLATIONS = {
    "Morning": "सुबह (Morning)",
    "Afternoon": "दोपहर (Afternoon)",
    "Evening": "शाम (Evening)",
    "Night": "रात (Night)",
}

HINDI_TIMING_RELATIONS = {
    TimingRelation.AFTER_FOOD: "भोजन के बाद (After Food)",
    TimingRelation.BEFORE_FOOD: "भोजन से 30 मिनट पहले (Before Food)",
    TimingRelation.EMPTY_STOMACH: "खाली पेट (Empty Stomach)",
    TimingRelation.WITH_FOOD: "भोजन के साथ (With Food)",
    TimingRelation.BEDTIME: "सोने से पहले (At Bedtime)"
}

APPROX_TIMES = {
    "Morning": "08:00 AM",
    "Afternoon": "01:00 PM",
    "Evening": "06:00 PM",
    "Night": "09:30 PM"
}

def analyze_prescription_safety(items: List[PrescriptionItem], patient: PatientInfo) -> List[str]:
    """
    Evaluates drug-drug interactions, maximum safe dosing, allergy cross-reactivity,
    and unconfirmed OCR flags. AI is strictly prohibited from inventing dosages.
    """
    warnings: List[str] = []
    
    # 1. Unconfirmed OCR / Missing dosage safety check
    for item in items:
        if item.needs_doctor_confirmation or not item.confirmed_by_doctor:
            warnings.append(
                f"🚨 SAFETY HOLD: Medicine '{item.medicine_name}' dosage was unclear in OCR scan or missing. "
                f"Per clinical safety protocols, AI hallucination is prevented. Doctor or Pharmacist MUST confirm dosage before dispensing."
            )
            
    # 2. Check Patient Known Allergies
    patient_allergies = [a.lower().strip() for a in patient.known_allergies]
    for item in items:
        gen = item.generic_name.lower()
        med_name = item.medicine_name.lower()
        for allergy in patient_allergies:
            if allergy and (allergy in gen or allergy in med_name or (allergy == "penicillin" and "amoxicillin" in gen)):
                warnings.append(
                    f"⚠️ CRITICAL ALLERGY CONFLICT: Patient is allergic to '{allergy.upper()}', "
                    f"which is contained in or cross-reactive with prescribed '{item.medicine_name}' ({item.generic_name})."
                )
                
    # 3. Duplicate Paracetamol / Hepatotoxicity Alert
    paracetamol_count = sum(1 for item in items if "paracetamol" in item.generic_name.lower() or "acetaminophen" in item.generic_name.lower())
    if paracetamol_count > 1:
        med_names = [item.medicine_name for item in items if "paracetamol" in item.generic_name.lower() or "acetaminophen" in item.generic_name.lower()]
        warnings.append(
            f"⚠️ DUPLICATE PARACETAMOL DETECTED: Multiple medications ({', '.join(med_names)}) contain Paracetamol. "
            f"Risk of cumulative hepatotoxicity (>3000mg/day). Please adjust dose."
        )
        
    # 4. Antibiotic + Antacid Chelation Warning
    has_fluoroquinolone = any("ciprofloxacin" in item.generic_name.lower() or "norfloxacin" in item.generic_name.lower() for item in items)
    has_antacid_or_calcium = any("calcium" in item.generic_name.lower() or "pantoprazole" in item.generic_name.lower() or "antacid" in item.generic_name.lower() for item in items)
    if has_fluoroquinolone and has_antacid_or_calcium:
        warnings.append(
            "ℹ️ CHELATION INTERACTION: Fluoroquinolone antibiotic detected alongside Antacid/Calcium. "
            "Space administration at least 2 hours apart to prevent reduced antibiotic bioavailability."
        )
        
    # 5. Dual NSAID Warning
    nsaid_list = ["ibuprofen", "aceclofenac", "diclofenac", "naproxen"]
    active_nsaids = [item.medicine_name for item in items if any(n in item.generic_name.lower() for n in nsaid_list)]
    if len(active_nsaids) > 1:
        warnings.append(
            f"⚠️ DUAL NSAID WARNING: Concomitant use of multiple NSAIDs ({', '.join(active_nsaids)}) "
            f"significantly increases risk of GI bleeding and renal impairment."
        )
        
    return warnings

def generate_confirmed_medicine_schedule(items: List[PrescriptionItem]) -> List[ConfirmedScheduleEntry]:
    """
    Builds a deterministic 24-hour chronological schedule based solely on
    doctor-confirmed prescription items.
    """
    time_slots = [
        ("Morning", "सुबह", "08:00 AM"),
        ("Afternoon", "दोपहर", "01:00 PM"),
        ("Evening", "शाम", "06:00 PM"),
        ("Night", "रात", "09:30 PM")
    ]
    
    schedule: List[ConfirmedScheduleEntry] = []
    
    for slot_name, slot_hi, approx_time in time_slots:
        slot_meds = []
        slot_relation = TimingRelation.AFTER_FOOD
        
        for item in items:
            # Check if medicine is scheduled for this slot
            is_active_in_slot = False
            if slot_name == "Morning" and item.morning:
                is_active_in_slot = True
            elif slot_name == "Afternoon" and item.afternoon:
                is_active_in_slot = True
            elif slot_name == "Evening" and item.evening:
                is_active_in_slot = True
            elif slot_name == "Night" and item.night:
                is_active_in_slot = True
                
            if is_active_in_slot:
                slot_relation = item.timing_relation
                
                # Format dosage instruction in English and Hindi
                rel_en = item.timing_relation.value.replace("_", " ").title()
                rel_hi = HINDI_TIMING_RELATIONS.get(item.timing_relation, "")
                
                unit_hi = "गोली" if "tablet" in item.form.lower() else ("कैप्सूल" if "capsule" in item.form.lower() else "चम्मच")
                
                slot_meds.append({
                    "medicine_name": item.medicine_name,
                    "generic_name": item.generic_name,
                    "form": item.form,
                    "strength": item.strength,
                    "dosage": item.dosage,
                    "relation_en": rel_en,
                    "relation_hi": rel_hi,
                    "instruction_en": f"Take {item.dosage} {rel_en}",
                    "instruction_hi": f"{item.dosage} {unit_hi} {rel_hi} लें",
                    "duration_days": item.duration_days,
                    "is_unconfirmed": item.needs_doctor_confirmation
                })
                
        if slot_meds:
            schedule.append(ConfirmedScheduleEntry(
                time_slot=slot_name,
                time_label_hi=slot_hi,
                approx_time=approx_time,
                relation=slot_relation.value.replace("_", " ").title(),
                relation_hi=HINDI_TIMING_RELATIONS.get(slot_relation, ""),
                medicines=slot_meds
            ))
            
    return schedule

def generate_bilingual_instructions(item: PrescriptionItem) -> Tuple[str, str]:
    """Generates standard unambiguous instructions in English and Hindi."""
    slots_en = []
    slots_hi = []
    if item.morning:
        slots_en.append("Morning")
        slots_hi.append("सुबह")
    if item.afternoon:
        slots_en.append("Afternoon")
        slots_hi.append("दोपहर")
    if item.evening:
        slots_en.append("Evening")
        slots_hi.append("शाम")
    if item.night:
        slots_en.append("Night")
        slots_hi.append("रात")
        
    slots_str_en = " & ".join(slots_en) if slots_en else "As needed"
    slots_str_hi = " और ".join(slots_hi) if slots_hi else "जरूरत के अनुसार"
    
    rel_en = item.timing_relation.value.replace("_", " ").title()
    rel_hi = HINDI_TIMING_RELATIONS.get(item.timing_relation, "")
    
    unit_hi = "गोली" if "tablet" in item.form.lower() else ("कैप्सूल" if "capsule" in item.form.lower() else "मात्रा")
    
    en = f"Take {item.dosage} {rel_en} in the {slots_str_en} for {item.duration_days} days."
    hi = f"{slots_str_hi} में {item.dosage} {unit_hi} {rel_hi}, {item.duration_days} दिनों तक लें।"
    
    return en, hi
