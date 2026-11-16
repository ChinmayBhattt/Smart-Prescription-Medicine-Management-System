from typing import Dict, Any
from app.models import Prescription, TimingRelation

def generate_voice_instruction_script(rx: Prescription) -> Dict[str, Any]:
    """
    Generates clear, compassionate, and precise voice spoken scripts in both
    Hindi and English for elderly patients, visually impaired patients,
    or those who prefer listening to dosage instructions.
    """
    pt_name = rx.patient.name
    doc_name = rx.doctor.name
    
    # 1. Hindi Voice Script
    script_hi_parts = [
        f"नमस्ते {pt_name} जी। डॉक्टर {doc_name} द्वारा आपकी दवाओं के निर्देश इस प्रकार हैं।",
    ]
    
    # Group by morning, afternoon, night
    morning_meds = [m for m in rx.items if m.morning]
    afternoon_meds = [m for m in rx.items if m.afternoon]
    night_meds = [m for m in rx.items if m.night]
    
    if morning_meds:
        m_names = []
        for m in morning_meds:
            rel = "खाने के बाद" if m.timing_relation == TimingRelation.AFTER_FOOD else "खाली पेट"
            m_names.append(f"{m.medicine_name} की {m.dosage} {rel}")
        script_hi_parts.append(f"सुबह के समय: {', '.join(m_names)} लें।")
        
    if afternoon_meds:
        a_names = []
        for m in afternoon_meds:
            rel = "खाने के बाद" if m.timing_relation == TimingRelation.AFTER_FOOD else "खाने से पहले"
            a_names.append(f"{m.medicine_name} की {m.dosage} {rel}")
        script_hi_parts.append(f"दोपहर के समय: {', '.join(a_names)} लें।")
        
    if night_meds:
        n_names = []
        for m in night_meds:
            rel = "सोने से पहले" if m.timing_relation == TimingRelation.BEDTIME else "रात के भोजन के बाद"
            n_names.append(f"{m.medicine_name} की {m.dosage} {rel}")
        script_hi_parts.append(f"रात के समय: {', '.join(n_names)} लें।")
        
    script_hi_parts.append(f"कृपया दवाएं पूरे {rx.items[0].duration_days if rx.items else 5} दिनों तक नियमित लें। यदि कोई परेशानी हो तो तुरंत डॉक्टर से संपर्क करें। स्वस्थ रहें।")
    
    full_hi = " ".join(script_hi_parts)
    
    # 2. English Voice Script
    script_en_parts = [
        f"Hello {pt_name}. Here are your medicine instructions from Dr. {doc_name}.",
    ]
    
    if morning_meds:
        m_en = [f"{m.medicine_name} {m.dosage} ({m.timing_relation.value.replace('_', ' ').lower()})" for m in morning_meds]
        script_en_parts.append(f"In the morning: Take {', and '.join(m_en)}.")
        
    if afternoon_meds:
        a_en = [f"{m.medicine_name} {m.dosage} ({m.timing_relation.value.replace('_', ' ').lower()})" for m in afternoon_meds]
        script_en_parts.append(f"In the afternoon: Take {', and '.join(a_en)}.")
        
    if night_meds:
        n_en = [f"{m.medicine_name} {m.dosage} ({m.timing_relation.value.replace('_', ' ').lower()})" for m in night_meds]
        script_en_parts.append(f"At night: Take {', and '.join(n_en)}.")
        
    script_en_parts.append("Please complete your full course. Take care and get well soon.")
    full_en = " ".join(script_en_parts)
    
    return {
        "prescription_id": rx.id,
        "patient_name": pt_name,
        "voice_script_hindi": full_hi,
        "voice_script_english": full_en,
        "language_supported": ["hi-IN", "en-IN", "en-US"]
    }
