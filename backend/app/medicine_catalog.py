from typing import List, Optional
from app.models import Medicine, DosageForm, TimingRelation

MEDICINE_CATALOG: List[Medicine] = [
    Medicine(
        id="med-001",
        brand_name="Dolo 650",
        generic_name="Paracetamol (Acetaminophen)",
        category="Antipyretic & Analgesic",
        form=DosageForm.TABLET,
        strength="650 mg",
        composition="Paracetamol IP 650mg",
        standard_unit="tablet",
        common_indications=["Fever", "Headache", "Body Ache", "Post-vaccination discomfort"],
        hindi_name="डोलो ६५० (पैरासिटामोल)",
        default_timing=TimingRelation.AFTER_FOOD,
        contraindications=["Severe Hepatic Impairment", "Active liver disease"]
    ),
    Medicine(
        id="med-002",
        brand_name="Augmentin 625 Duo",
        generic_name="Amoxicillin + Clavulanic Acid",
        category="Antibacterial / Broad Spectrum Antibiotic",
        form=DosageForm.TABLET,
        strength="625 mg",
        composition="Amoxicillin 500mg + Clavulanic Acid 125mg",
        standard_unit="tablet",
        common_indications=["Bacterial RTI", "Sinusitis", "Skin & Soft Tissue Infections", "Dental Abscess"],
        hindi_name="ऑगमेंटिन ६२५ (एमोक्सीसिलिन)",
        default_timing=TimingRelation.WITH_FOOD,
        contraindications=["Penicillin Allergy", "History of penicillin-associated jaundice"]
    ),
    Medicine(
        id="med-003",
        brand_name="Pan-D",
        generic_name="Pantoprazole + Domperidone",
        category="Gastroprokinetic & Antacid",
        form=DosageForm.CAPSULE,
        strength="40 mg / 30 mg SR",
        composition="Pantoprazole Sodium 40mg + Domperidone 30mg SR",
        standard_unit="capsule",
        common_indications=["GERD", "Acid Reflux", "Nausea associated with Hyperacidity", "Gastritis"],
        hindi_name="पैन-डी (पैन्टोप्राजोल)",
        default_timing=TimingRelation.EMPTY_STOMACH,
        contraindications=["Gastrointestinal Hemorrhage", "Mechanical bowel obstruction"]
    ),
    Medicine(
        id="med-004",
        brand_name="Azithral 500",
        generic_name="Azithromycin",
        category="Macrolide Antibiotic",
        form=DosageForm.TABLET,
        strength="500 mg",
        composition="Azithromycin Dihydrate 500mg",
        standard_unit="tablet",
        common_indications=["Throat Infection", "Tonsillitis", "Pneumonia", "Typhoid", "Bronchitis"],
        hindi_name="एजिथ्रल ५०० (एजिथ्रोमाइसिन)",
        default_timing=TimingRelation.AFTER_FOOD,
        contraindications=["Cholestatic jaundice history", "Known hypersensitivity to macrolides"]
    ),
    Medicine(
        id="med-005",
        brand_name="Glycomet 500 SR",
        generic_name="Metformin Hydrochloride",
        category="Anti-Diabetic (Biguanide)",
        form=DosageForm.TABLET,
        strength="500 mg",
        composition="Metformin Hydrochloride 500mg (Sustained Release)",
        standard_unit="tablet",
        common_indications=["Type 2 Diabetes Mellitus", "PCOS Insulin Resistance"],
        hindi_name="ग्लाइकोमेट ५०० (मेटफॉर्मिन)",
        default_timing=TimingRelation.WITH_FOOD,
        contraindications=["Severe Renal Impairment (eGFR < 30)", "Acute Metabolic Acidosis"]
    ),
    Medicine(
        id="med-006",
        brand_name="Telma 40",
        generic_name="Telmisartan",
        category="Antihypertensive (ARB)",
        form=DosageForm.TABLET,
        strength="40 mg",
        composition="Telmisartan IP 40mg",
        standard_unit="tablet",
        common_indications=["Essential Hypertension", "Cardiovascular Risk Reduction"],
        hindi_name="टेल्मा ४० (टेल्मीसार्टन)",
        default_timing=TimingRelation.AFTER_FOOD,
        contraindications=["Pregnancy 2nd/3rd trimester", "Bilateral renal artery stenosis"]
    ),
    Medicine(
        id="med-007",
        brand_name="Montair-LC",
        generic_name="Montelukast + Levocetirizine",
        category="Antiallergic & Anti-asthmatic",
        form=DosageForm.TABLET,
        strength="10 mg / 5 mg",
        composition="Montelukast Sodium 10mg + Levocetirizine HCl 5mg",
        standard_unit="tablet",
        common_indications=["Allergic Rhinitis", "Sneezing & Runny Nose", "Chronic Urticaria", "Asthma prophylaxis"],
        hindi_name="मोन्टायर-एलसी (मोंटेलुकास्ट + लेवोसेटिरिज़िन)",
        default_timing=TimingRelation.BEDTIME,
        contraindications=["End-stage renal disease", "Severe hepatic failure"]
    ),
    Medicine(
        id="med-008",
        brand_name="Shelcal 500",
        generic_name="Calcium Carbonate + Vitamin D3",
        category="Nutritional Supplement / Mineral",
        form=DosageForm.TABLET,
        strength="500 mg / 250 IU",
        composition="Elemental Calcium 500mg + Cholecalciferol 250 IU",
        standard_unit="tablet",
        common_indications=["Calcium Deficiency", "Osteoporosis", "Pregnancy/Lactation Supplement", "Joint Pain"],
        hindi_name="शेलकल ५०० (कैल्शियम + विटामिन डी३)",
        default_timing=TimingRelation.AFTER_FOOD,
        contraindications=["Hypercalcemia", "Severe hypercalciuria", "Kidney Stones"]
    ),
    Medicine(
        id="med-009",
        brand_name="Ascoril-LS Syrup",
        generic_name="Levosalbutamol + Ambroxol + Guaiphenesin",
        category="Bronchodilator & Expectorant Cough Syrup",
        form=DosageForm.SYRUP,
        strength="100 ml bottle",
        composition="Levosalbutamol 1mg + Ambroxol 30mg + Guaiphenesin 50mg per 5ml",
        standard_unit="5 ml (1 teaspoon)",
        common_indications=["Productive Wet Cough", "Bronchial Asthma with Mucus", "COPD with phlegm"],
        hindi_name="एस्कोरिल-एलएस सिरप (खांसी की दवा)",
        default_timing=TimingRelation.AFTER_FOOD,
        contraindications=["Severe Arrhythmia", "Gastric Ulcer"]
    ),
    Medicine(
        id="med-010",
        brand_name="Ciplox 500",
        generic_name="Ciprofloxacin",
        category="Fluoroquinolone Antibiotic",
        form=DosageForm.TABLET,
        strength="500 mg",
        composition="Ciprofloxacin Hydrochloride 500mg",
        standard_unit="tablet",
        common_indications=["Urinary Tract Infection (UTI)", "Bacterial Gastroenteritis", "Bone & Joint Infection"],
        hindi_name="सिप्लॉक्स ५०० (सिप्रोफ्लोक्सासिन)",
        default_timing=TimingRelation.AFTER_FOOD,
        contraindications=["History of Tendon rupture", "Concurrent Tizanidine use", "Myasthenia Gravis"]
    ),
    Medicine(
        id="med-011",
        brand_name="Atorva 20",
        generic_name="Atorvastatin",
        category="Lipid Lowering Agent (Statin)",
        form=DosageForm.TABLET,
        strength="20 mg",
        composition="Atorvastatin Calcium 20mg",
        standard_unit="tablet",
        common_indications=["Hypercholesterolemia", "Prevention of Atherosclerotic Cardiovascular Disease"],
        hindi_name="एटोरवा २० (एटोरवास्टेटिन)",
        default_timing=TimingRelation.BEDTIME,
        contraindications=["Active liver disease", "Unexplained persistent transaminase elevations", "Pregnancy"]
    ),
    Medicine(
        id="med-012",
        brand_name="Thyronorm 50",
        generic_name="Levothyroxine Sodium",
        category="Thyroid Hormone",
        form=DosageForm.TABLET,
        strength="50 mcg",
        composition="Levothyroxine Sodium IP 50mcg",
        standard_unit="tablet",
        common_indications=["Hypothyroidism", "Goiter Prophylaxis"],
        hindi_name="थायरोनॉर्म ५० (लेवोथायरोक्सिन)",
        default_timing=TimingRelation.EMPTY_STOMACH,
        contraindications=["Untreated subclinical or overt thyrotoxicosis", "Uncorrected adrenal insufficiency"]
    ),
    Medicine(
        id="med-013",
        brand_name="Asthalin Inhaler",
        generic_name="Salbutamol (Albuterol)",
        category="Rapid Short-Acting Beta-2 Agonist (Inhaler)",
        form=DosageForm.INHALER,
        strength="100 mcg / puff",
        composition="Salbutamol Sulphate 100mcg per metered actuation (200 doses)",
        standard_unit="puff",
        common_indications=["Acute Bronchospasm", "Asthma Attack Relief", "Exercise-induced Wheezing"],
        hindi_name="अस्थालिन इनहेलर (साल्बुटामोल)",
        default_timing=TimingRelation.AFTER_FOOD,
        contraindications=["Hypersensitivity to salbutamol"]
    ),
    Medicine(
        id="med-014",
        brand_name="Ciplox Eye Drops",
        generic_name="Ciprofloxacin 0.3% w/v",
        category="Ophthalmic / Otic Antibiotic",
        form=DosageForm.DROPS,
        strength="10 ml vial (0.3% w/v)",
        composition="Ciprofloxacin 3mg/ml Sterile Solution",
        standard_unit="drops",
        common_indications=["Bacterial Conjunctivitis", "Corneal Ulcer", "Otitis Externa"],
        hindi_name="सिप्लॉक्स ऑय ड्रॉप्स (आंख की दवा)",
        default_timing=TimingRelation.AFTER_FOOD,
        contraindications=["Viral or fungal keratitis", "Mycobacterial eye infection"]
    ),
    Medicine(
        id="med-015",
        brand_name="Betadine 10% Ointment",
        generic_name="Povidone Iodine 10%",
        category="Antiseptic & Topical Microbicidal",
        form=DosageForm.OINTMENT,
        strength="20g tube",
        composition="Povidone Iodine IP 10% w/w",
        standard_unit="application",
        common_indications=["Cuts", "Wound dressing", "Minor Burns", "Skin Infection Prevention"],
        hindi_name="बीटाडीन १०% मरहम (एंटीसेप्टिक)",
        default_timing=TimingRelation.AFTER_FOOD,
        contraindications=["Iodine allergy", "Thyroid disorder over large wound areas"]
    ),
    Medicine(
        id="med-016",
        brand_name="Combiflam",
        generic_name="Ibuprofen + Paracetamol",
        category="NSAID + Analgesic Combination",
        form=DosageForm.TABLET,
        strength="400 mg / 325 mg",
        composition="Ibuprofen 400mg + Paracetamol 325mg",
        standard_unit="tablet",
        common_indications=["Dental Pain", "Dysmenorrhea", "Post-trauma swelling", "Musculoskeletal pain"],
        hindi_name="कॉम्बीफ्लाम (आइबुप्रोफेन + पैरासिटामोल)",
        default_timing=TimingRelation.AFTER_FOOD,
        contraindications=["Active Peptic Ulcer", "Severe Heart Failure", "Third Trimester Pregnancy"]
    )
]

def search_medicines(query: str, category: Optional[str] = None, form: Optional[str] = None) -> List[Medicine]:
    """Search medicine catalog with fuzzy/substring matching on brand, generic, and composition."""
    q = query.lower().strip()
    results = []
    
    for med in MEDICINE_CATALOG:
        if category and category.lower() != "all" and med.category.lower() != category.lower():
            continue
        if form and form.lower() != "all" and med.form.value.lower() != form.lower():
            continue
            
        if not q:
            results.append(med)
            continue
            
        match = (
            q in med.brand_name.lower() or
            q in med.generic_name.lower() or
            q in med.composition.lower() or
            (med.hindi_name and q in med.hindi_name.lower()) or
            any(q in ind.lower() for ind in med.common_indications)
        )
        if match:
            results.append(med)
            
    return results

def get_medicine_by_id(med_id: str) -> Optional[Medicine]:
    for med in MEDICINE_CATALOG:
        if med.id == med_id:
            return med
    return None
