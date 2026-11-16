package main

import (
	"fmt"
	"strings"
)

func GenerateVoiceScript(rx *Prescription) map[string]interface{} {
	var hiParts []string
	hiParts = append(hiParts, fmt.Sprintf("नमस्ते %s जी। डॉक्टर %s द्वारा आपकी दवाओं के निर्देश इस प्रकार हैं।", rx.Patient.Name, rx.Doctor.Name))

	var morningMeds, afternoonMeds, nightMeds []string
	for _, it := range rx.Items {
		relHI := "खाने के बाद"
		if it.TimingRelation == TimingEmptyStomach {
			relHI = "खाली पेट"
		}
		unitHI := "गोली"
		if strings.Contains(strings.ToLower(it.Form), "syrup") {
			unitHI = "चम्मच"
		}

		desc := fmt.Sprintf("%s की %s %s %s", it.MedicineName, it.Dosage, unitHI, relHI)
		if it.Morning {
			morningMeds = append(morningMeds, desc)
		}
		if it.Afternoon {
			afternoonMeds = append(afternoonMeds, desc)
		}
		if it.Night {
			nightMeds = append(nightMeds, desc)
		}
	}

	if len(morningMeds) > 0 {
		hiParts = append(hiParts, fmt.Sprintf("सुबह के समय: %s लें।", strings.Join(morningMeds, ", और ")))
	}
	if len(afternoonMeds) > 0 {
		hiParts = append(hiParts, fmt.Sprintf("दोपहर के समय: %s लें।", strings.Join(afternoonMeds, ", और ")))
	}
	if len(nightMeds) > 0 {
		hiParts = append(hiParts, fmt.Sprintf("रात के समय: %s लें।", strings.Join(nightMeds, ", और ")))
	}

	hiParts = append(hiParts, "कृपया दवाएं पूरे समय तक नियमित लें। स्वस्थ रहें।")
	fullHI := strings.Join(hiParts, " ")

	// English
	var enParts []string
	enParts = append(enParts, fmt.Sprintf("Hello %s. Here are your medicine instructions from Dr. %s.", rx.Patient.Name, rx.Doctor.Name))
	for _, it := range rx.Items {
		enParts = append(enParts, fmt.Sprintf("Take %s %s (%s).", it.MedicineName, it.Dosage, it.TimingRelation))
	}
	enParts = append(enParts, "Please take your prescribed medicines with water and complete your course.")
	fullEN := strings.Join(enParts, " ")

	return map[string]interface{}{
		"prescription_id":      rx.ID,
		"patient_name":         rx.Patient.Name,
		"voice_script_hindi":   fullHI,
		"voice_script_english": fullEN,
		"language_supported":   []string{"hi-IN", "en-IN", "en-US"},
	}
}
