package main

import "strings"

var MedicineCatalog = []Medicine{
	{
		ID:                "med-001",
		BrandName:         "Dolo 650",
		GenericName:       "Paracetamol (Acetaminophen)",
		Category:          "Antipyretic & Analgesic",
		Form:              FormTablet,
		Strength:          "650 mg",
		Composition:       "Paracetamol IP 650mg",
		StandardUnit:      "tablet",
		CommonIndications: []string{"Fever", "Headache", "Body Ache", "Post-vaccination fever"},
		HindiName:         "डोलो ६५० (पैरासिटामोल)",
		DefaultTiming:     TimingAfterFood,
		Contraindications: []string{"Severe Hepatic Impairment", "Active liver disease"},
	},
	{
		ID:                "med-002",
		BrandName:         "Augmentin 625 Duo",
		GenericName:       "Amoxicillin + Clavulanic Acid",
		Category:          "Antibacterial / Antibiotic",
		Form:              FormTablet,
		Strength:          "625 mg",
		Composition:       "Amoxicillin 500mg + Clavulanic Acid 125mg",
		StandardUnit:      "tablet",
		CommonIndications: []string{"Bacterial RTI", "Sinusitis", "Skin Infections", "Dental Abscess"},
		HindiName:         "ऑगमेंटिन ६२५ (एमोक्सीसिलिन)",
		DefaultTiming:     TimingWithFood,
		Contraindications: []string{"Penicillin Allergy", "History of penicillin jaundice"},
	},
	{
		ID:                "med-003",
		BrandName:         "Pan-D",
		GenericName:       "Pantoprazole + Domperidone",
		Category:          "Gastroprokinetic & Antacid",
		Form:              FormCapsule,
		Strength:          "40 mg / 30 mg SR",
		Composition:       "Pantoprazole Sodium 40mg + Domperidone 30mg SR",
		StandardUnit:      "capsule",
		CommonIndications: []string{"GERD", "Acid Reflux", "Nausea with Hyperacidity", "Gastritis"},
		HindiName:         "पैन-डी (पैन्टोप्राजोल)",
		DefaultTiming:     TimingEmptyStomach,
		Contraindications: []string{"Gastrointestinal Hemorrhage", "Mechanical bowel obstruction"},
	},
	{
		ID:                "med-004",
		BrandName:         "Azithral 500",
		GenericName:       "Azithromycin",
		Category:          "Macrolide Antibiotic",
		Form:              FormTablet,
		Strength:          "500 mg",
		Composition:       "Azithromycin Dihydrate 500mg",
		StandardUnit:      "tablet",
		CommonIndications: []string{"Throat Infection", "Tonsillitis", "Pneumonia", "Typhoid", "Bronchitis"},
		HindiName:         "एजिथ्रल ५०० (एजिथ्रोमाइसिन)",
		DefaultTiming:     TimingAfterFood,
		Contraindications: []string{"Cholestatic jaundice", "Hypersensitivity to macrolides"},
	},
	{
		ID:                "med-005",
		BrandName:         "Glycomet 500 SR",
		GenericName:       "Metformin Hydrochloride",
		Category:          "Anti-Diabetic",
		Form:              FormTablet,
		Strength:          "500 mg",
		Composition:       "Metformin Hydrochloride 500mg (SR)",
		StandardUnit:      "tablet",
		CommonIndications: []string{"Type 2 Diabetes Mellitus", "PCOS Insulin Resistance"},
		HindiName:         "ग्लाइकोमेट ५०० (मेटफॉर्मिन)",
		DefaultTiming:     TimingWithFood,
		Contraindications: []string{"Severe Renal Impairment", "Acute Metabolic Acidosis"},
	},
	{
		ID:                "med-006",
		BrandName:         "Telma 40",
		GenericName:       "Telmisartan",
		Category:          "Antihypertensive",
		Form:              FormTablet,
		Strength:          "40 mg",
		Composition:       "Telmisartan IP 40mg",
		StandardUnit:      "tablet",
		CommonIndications: []string{"Essential Hypertension", "Cardiovascular Risk Reduction"},
		HindiName:         "टेल्मा ४० (टेल्मीसार्टन)",
		DefaultTiming:     TimingAfterFood,
		Contraindications: []string{"Pregnancy 2nd/3rd trimester", "Bilateral renal artery stenosis"},
	},
	{
		ID:                "med-007",
		BrandName:         "Montair-LC",
		GenericName:       "Montelukast + Levocetirizine",
		Category:          "Antiallergic & Anti-asthmatic",
		Form:              FormTablet,
		Strength:          "10 mg / 5 mg",
		Composition:       "Montelukast Sodium 10mg + Levocetirizine HCl 5mg",
		StandardUnit:      "tablet",
		CommonIndications: []string{"Allergic Rhinitis", "Sneezing & Runny Nose", "Chronic Urticaria"},
		HindiName:         "मोन्टायर-एलसी (मोंटेलुकास्ट)",
		DefaultTiming:     TimingBedtime,
		Contraindications: []string{"End-stage renal disease", "Severe hepatic failure"},
	},
	{
		ID:                "med-008",
		BrandName:         "Shelcal 500",
		GenericName:       "Calcium Carbonate + Vitamin D3",
		Category:          "Nutritional Supplement",
		Form:              FormTablet,
		Strength:          "500 mg / 250 IU",
		Composition:       "Elemental Calcium 500mg + Cholecalciferol 250 IU",
		StandardUnit:      "tablet",
		CommonIndications: []string{"Calcium Deficiency", "Osteoporosis", "Pregnancy Supplement"},
		HindiName:         "शेलकल ५०० (कैल्शियम)",
		DefaultTiming:     TimingAfterFood,
		Contraindications: []string{"Hypercalcemia", "Kidney Stones"},
	},
	{
		ID:                "med-009",
		BrandName:         "Ascoril-LS Syrup",
		GenericName:       "Levosalbutamol + Ambroxol + Guaiphenesin",
		Category:          "Cough & Respiratory",
		Form:              FormSyrup,
		Strength:          "100 ml bottle",
		Composition:       "Levosalbutamol 1mg + Ambroxol 30mg + Guaiphenesin 50mg per 5ml",
		StandardUnit:      "5 ml (1 tsp)",
		CommonIndications: []string{"Productive Wet Cough", "Bronchial Asthma with Phlegm", "COPD"},
		HindiName:         "एस्कोरिल-एलएस सिरप (खांसी की दवा)",
		DefaultTiming:     TimingAfterFood,
		Contraindications: []string{"Severe Arrhythmia", "Gastric Ulcer"},
	},
	{
		ID:                "med-010",
		BrandName:         "Ciplox 500",
		GenericName:       "Ciprofloxacin",
		Category:          "Antibacterial / Antibiotic",
		Form:              FormTablet,
		Strength:          "500 mg",
		Composition:       "Ciprofloxacin Hydrochloride 500mg",
		StandardUnit:      "tablet",
		CommonIndications: []string{"Urinary Tract Infection (UTI)", "Bacterial Gastroenteritis"},
		HindiName:         "सिप्लॉक्स ५०० (सिप्रोफ्लोक्सासिन)",
		DefaultTiming:     TimingAfterFood,
		Contraindications: []string{"Tendon rupture history", "Tizanidine use", "Myasthenia Gravis"},
	},
	{
		ID:                "med-011",
		BrandName:         "Atorva 20",
		GenericName:       "Atorvastatin",
		Category:          "Lipid Lowering",
		Form:              FormTablet,
		Strength:          "20 mg",
		Composition:       "Atorvastatin Calcium 20mg",
		StandardUnit:      "tablet",
		CommonIndications: []string{"High Cholesterol", "Cardiovascular Prevention"},
		HindiName:         "एटोरवा २० (एटोरवास्टेटिन)",
		DefaultTiming:     TimingBedtime,
		Contraindications: []string{"Active liver disease", "Pregnancy"},
	},
	{
		ID:                "med-012",
		BrandName:         "Thyronorm 50",
		GenericName:       "Levothyroxine Sodium",
		Category:          "Thyroid Hormone",
		Form:              FormTablet,
		Strength:          "50 mcg",
		Composition:       "Levothyroxine Sodium IP 50mcg",
		StandardUnit:      "tablet",
		CommonIndications: []string{"Hypothyroidism", "Goiter Prophylaxis"},
		HindiName:         "थायरोनॉर्म ५० (थायरॉयड की दवा)",
		DefaultTiming:     TimingEmptyStomach,
		Contraindications: []string{"Untreated thyrotoxicosis", "Uncorrected adrenal insufficiency"},
	},
	{
		ID:                "med-013",
		BrandName:         "Asthalin Inhaler",
		GenericName:       "Salbutamol (Albuterol)",
		Category:          "Cough & Respiratory",
		Form:              FormInhaler,
		Strength:          "100 mcg / puff",
		Composition:       "Salbutamol Sulphate 100mcg per puff",
		StandardUnit:      "puff",
		CommonIndications: []string{"Acute Wheezing", "Asthma Attack", "Bronchospasm Relief"},
		HindiName:         "अस्थालिन इनहेलर (दमा की दवा)",
		DefaultTiming:     TimingAfterFood,
		Contraindications: []string{"Hypersensitivity to salbutamol"},
	},
	{
		ID:                "med-014",
		BrandName:         "Combiflam",
		GenericName:       "Ibuprofen + Paracetamol",
		Category:          "Antipyretic & Analgesic",
		Form:              FormTablet,
		Strength:          "400 mg / 325 mg",
		Composition:       "Ibuprofen 400mg + Paracetamol 325mg",
		StandardUnit:      "tablet",
		CommonIndications: []string{"Dental Pain", "Severe Muscle Pain", "Post-injury swelling"},
		HindiName:         "कॉम्बीफ्लाम (दर्द निवारक)",
		DefaultTiming:     TimingAfterFood,
		Contraindications: []string{"Active Peptic Ulcer", "Severe Heart Failure"},
	},
	{
		ID:                "med-015",
		BrandName:         "Meftal-Spas",
		GenericName:       "Mefenamic Acid + Dicyclomine",
		Category:          "Antipyretic & Analgesic",
		Form:              FormTablet,
		Strength:          "250 mg / 10 mg",
		Composition:       "Mefenamic Acid 250mg + Dicyclomine Hydrochloride 10mg",
		StandardUnit:      "tablet",
		CommonIndications: []string{"Abdominal Cramps", "Spasmodic Dysmenorrhea", "Colic Pain"},
		HindiName:         "मेफ्टाल-स्पास (पेट दर्द निवारक)",
		DefaultTiming:     TimingAfterFood,
		Contraindications: []string{"Glaucoma", "Myasthenia Gravis", "GI obstruction"},
	},
	{
		ID:                "med-016",
		BrandName:         "Taxim-O 200",
		GenericName:       "Cefixime",
		Category:          "Antibacterial / Antibiotic",
		Form:              FormTablet,
		Strength:          "200 mg",
		Composition:       "Cefixime Trihydrate 200mg",
		StandardUnit:      "tablet",
		CommonIndications: []string{"Typhoid Fever", "Urinary Tract Infection", "Otitis Media", "Bronchitis"},
		HindiName:         "टैक्सिम-ओ २०० (सेफिक्सिम)",
		DefaultTiming:     TimingAfterFood,
		Contraindications: []string{"Cephalosporin Allergy", "History of pseudomembranous colitis"},
	},
	{
		ID:                "med-017",
		BrandName:         "Pantocid 40",
		GenericName:       "Pantoprazole Sodium",
		Category:          "Gastroprokinetic & Antacid",
		Form:              FormTablet,
		Strength:          "40 mg",
		Composition:       "Pantoprazole Sodium Gastro-resistant 40mg",
		StandardUnit:      "tablet",
		CommonIndications: []string{"Acid Peptic Disease", "Gastric Ulcer Healing", "GERD"},
		HindiName:         "पैंटोसिड ४० (पैंटोप्रैजोल)",
		DefaultTiming:     TimingEmptyStomach,
		Contraindications: []string{"Hypersensitivity to substituted benzimidazoles"},
	},
	{
		ID:                "med-018",
		BrandName:         "Allegra 120",
		GenericName:       "Fexofenadine Hydrochloride",
		Category:          "Antiallergic & Anti-asthmatic",
		Form:              FormTablet,
		Strength:          "120 mg",
		Composition:       "Fexofenadine HCl 120mg",
		StandardUnit:      "tablet",
		CommonIndications: []string{"Allergic Rhinitis", "Sneezing", "Skin Itching & Hives"},
		HindiName:         "एलेग्रा १२० (फेक्सोफेनाडाइन)",
		DefaultTiming:     TimingAfterFood,
		Contraindications: []string{"Severe renal insufficiency without dose adjustment"},
	},
	{
		ID:                "med-019",
		BrandName:         "Becosules Z",
		GenericName:       "B-Complex Vitamins with Vitamin C and Zinc",
		Category:          "Nutritional Supplement",
		Form:              FormCapsule,
		Strength:          "Standard Capsule",
		Composition:       "Vitamin B1, B2, B6, B12, Niacinamide, Calcium Pantothenate, Folic Acid, Vitamin C & Zinc",
		StandardUnit:      "capsule",
		CommonIndications: []string{"Mouth Ulcers", "General Weakness", "Post-infection recovery", "Immunity Booster"},
		HindiName:         "बेकोसुल्स जेड (मल्टीविटामिन)",
		DefaultTiming:     TimingAfterFood,
		Contraindications: []string{"Hypervitaminosis"},
	},
	{
		ID:                "med-020",
		BrandName:         "Neurobion Forte",
		GenericName:       "Vitamin B-Complex with B12",
		Category:          "Nutritional Supplement",
		Form:              FormTablet,
		Strength:          "High Potency B12",
		Composition:       "Thiamine Mononitrate 10mg, Riboflavin 10mg, Pyridoxine 3mg, Cyanocobalamin 15mcg, Nicotinamide 45mg",
		StandardUnit:      "tablet",
		CommonIndications: []string{"Diabetic Neuropathy", "Nerve Regeneration", "Tingling & Numbness"},
		HindiName:         "न्यूरोबियन फोर्टे (नसों की शक्ति)",
		DefaultTiming:     TimingAfterFood,
		Contraindications: []string{"Hypersensitivity to cobalt/cyanocobalamin"},
	},
	{
		ID:                "med-021",
		BrandName:         "Calpol 500",
		GenericName:       "Paracetamol (Acetaminophen)",
		Category:          "Antipyretic & Analgesic",
		Form:              FormTablet,
		Strength:          "500 mg",
		Composition:       "Paracetamol IP 500mg",
		StandardUnit:      "tablet",
		CommonIndications: []string{"Mild to Moderate Fever", "Pain Relief", "Sore Throat"},
		HindiName:         "कैलपोल ५०० (पैरासिटामोल)",
		DefaultTiming:     TimingAfterFood,
		Contraindications: []string{"Severe Hepatic Impairment"},
	},
	{
		ID:                "med-022",
		BrandName:         "Amlopres 5",
		GenericName:       "Amlodipine Besylate",
		Category:          "Antihypertensive",
		Form:              FormTablet,
		Strength:          "5 mg",
		Composition:       "Amlodipine Besylate equivalent to Amlodipine 5mg",
		StandardUnit:      "tablet",
		CommonIndications: []string{"Hypertension", "Chronic Stable Angina", "Vasospastic Angina"},
		HindiName:         "एमलोप्रेस ५ (एमलोडिपिन)",
		DefaultTiming:     TimingAfterFood,
		Contraindications: []string{"Severe hypotension", "Cardiogenic shock"},
	},
	{
		ID:                "med-023",
		BrandName:         "Omez 20",
		GenericName:       "Omeprazole",
		Category:          "Gastroprokinetic & Antacid",
		Form:              FormCapsule,
		Strength:          "20 mg",
		Composition:       "Omeprazole Gastro-resistant 20mg",
		StandardUnit:      "capsule",
		CommonIndications: []string{"Heartburn", "Duodenal Ulcer", "NSAID-induced ulcer prevention"},
		HindiName:         "ओमेज २० (ओमेप्राजोल)",
		DefaultTiming:     TimingEmptyStomach,
		Contraindications: []string{"Concomitant nelfinavir administration"},
	},
	{
		ID:                "med-024",
		BrandName:         "Rantac 150",
		GenericName:       "Ranitidine Hydrochloride",
		Category:          "Gastroprokinetic & Antacid",
		Form:              FormTablet,
		Strength:          "150 mg",
		Composition:       "Ranitidine HCl 150mg",
		StandardUnit:      "tablet",
		CommonIndications: []string{"Acid Indigestion", "Sour Stomach", "Acid Burps"},
		HindiName:         "रैनटैक १५० (एसिडिटी की दवा)",
		DefaultTiming:     TimingBeforeFood,
		Contraindications: []string{"Porphyria history"},
	},
}

func SearchMedicines(query, category, form string) []Medicine {
	q := strings.ToLower(strings.TrimSpace(query))
	cat := strings.ToLower(strings.TrimSpace(category))
	f := strings.ToLower(strings.TrimSpace(form))

	var results []Medicine
	for _, med := range MedicineCatalog {
		if cat != "" && cat != "all" && strings.ToLower(med.Category) != cat {
			continue
		}
		if f != "" && f != "all" && strings.ToLower(string(med.Form)) != f {
			continue
		}

		if q == "" {
			results = append(results, med)
			continue
		}

		match := strings.Contains(strings.ToLower(med.BrandName), q) ||
			strings.Contains(strings.ToLower(med.GenericName), q) ||
			strings.Contains(strings.ToLower(med.Composition), q) ||
			(med.HindiName != "" && strings.Contains(strings.ToLower(med.HindiName), q))

		if !match {
			for _, ind := range med.CommonIndications {
				if strings.Contains(strings.ToLower(ind), q) {
					match = true
					break
				}
			}
		}

		if match {
			results = append(results, med)
		}
	}
	return results
}

func GetMedicineByID(id string) *Medicine {
	for _, m := range MedicineCatalog {
		if m.ID == id {
			return &m
		}
	}
	return nil
}
