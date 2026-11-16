package main

import (
	"fmt"
	"strings"
)

var HindiTimingRelations = map[TimingRelation]string{
	TimingAfterFood:    "भोजन के बाद (After Food)",
	TimingBeforeFood:   "भोजन से 30 मिनट पहले (Before Food)",
	TimingEmptyStomach: "खाली पेट (Empty Stomach)",
	TimingWithFood:     "भोजन के साथ (With Food)",
	TimingBedtime:      "सोने से पहले (At Bedtime)",
}

func AnalyzeSafety(items []PrescriptionItem, patient PatientInfo) []string {
	var warnings []string

	// 1. Unconfirmed items flag
	for _, it := range items {
		if it.NeedsDoctorConfirmation || !it.ConfirmedByDoctor {
			warnings = append(warnings, fmt.Sprintf(
				"🚨 SAFETY HOLD: Medicine '%s' dosage was unclear in OCR scan or missing. AI hallucination strictly prevented. Doctor or Pharmacist MUST confirm dosage before dispensing.",
				it.MedicineName,
			))
		}
	}

	// 2. Patient allergies check
	for _, it := range items {
		gen := strings.ToLower(it.GenericName)
		medName := strings.ToLower(it.MedicineName)
		for _, al := range patient.KnownAllergies {
			alClean := strings.ToLower(strings.TrimSpace(al))
			if alClean == "" {
				continue
			}
			if strings.Contains(gen, alClean) || strings.Contains(medName, alClean) || (alClean == "penicillin" && strings.Contains(gen, "amoxicillin")) {
				warnings = append(warnings, fmt.Sprintf(
					"⚠️ CRITICAL ALLERGY CONFLICT: Patient is allergic to '%s', which is contained in or cross-reactive with prescribed '%s' (%s).",
					strings.ToUpper(alClean), it.MedicineName, it.GenericName,
				))
			}
		}
	}

	// 3. Duplicate Paracetamol check
	pcmCount := 0
	var pcmNames []string
	for _, it := range items {
		gen := strings.ToLower(it.GenericName)
		if strings.Contains(gen, "paracetamol") || strings.Contains(gen, "acetaminophen") {
			pcmCount++
			pcmNames = append(pcmNames, it.MedicineName)
		}
	}
	if pcmCount > 1 {
		warnings = append(warnings, fmt.Sprintf(
			"⚠️ DUPLICATE PARACETAMOL DETECTED: Multiple medications (%s) contain Paracetamol. Risk of cumulative hepatotoxicity (>3000mg/day).",
			strings.Join(pcmNames, ", "),
		))
	}

	// 4. Antibiotic + Antacid Chelation Warning
	hasQuinolone := false
	hasAntacid := false
	for _, it := range items {
		gen := strings.ToLower(it.GenericName)
		if strings.Contains(gen, "ciprofloxacin") || strings.Contains(gen, "norfloxacin") {
			hasQuinolone = true
		}
		if strings.Contains(gen, "pantoprazole") || strings.Contains(gen, "calcium") || strings.Contains(gen, "antacid") {
			hasAntacid = true
		}
	}
	if hasQuinolone && hasAntacid {
		warnings = append(warnings,
			"ℹ️ CHELATION INTERACTION: Fluoroquinolone antibiotic detected alongside Antacid/Calcium. Space administration at least 2 hours apart.",
		)
	}

	return warnings
}

func GenerateSchedule(items []PrescriptionItem) []ConfirmedScheduleEntry {
	slots := []struct {
		Name     string
		LabelHI  string
		Approx   string
	}{
		{"Morning", "सुबह", "08:00 AM"},
		{"Afternoon", "दोपहर", "01:00 PM"},
		{"Evening", "शाम", "06:00 PM"},
		{"Night", "रात", "09:30 PM"},
	}

	var schedule []ConfirmedScheduleEntry

	for _, s := range slots {
		var slotMeds []ScheduledMedicine
		var defaultRelation TimingRelation = TimingAfterFood

		for _, it := range items {
			active := false
			switch s.Name {
			case "Morning":
				active = it.Morning
			case "Afternoon":
				active = it.Afternoon
			case "Evening":
				active = it.Evening
			case "Night":
				active = it.Night
			}

			if active {
				defaultRelation = it.TimingRelation
				relEN := strings.ReplaceAll(string(it.TimingRelation), "_", " ")
				relHI := HindiTimingRelations[it.TimingRelation]

				unitHI := "गोली"
				if strings.Contains(strings.ToLower(it.Form), "syrup") {
					unitHI = "चम्मच"
				} else if strings.Contains(strings.ToLower(it.Form), "capsule") {
					unitHI = "कैप्सूल"
				}

				slotMeds = append(slotMeds, ScheduledMedicine{
					MedicineName:  it.MedicineName,
					GenericName:   it.GenericName,
					Form:          it.Form,
					Strength:      it.Strength,
					Dosage:        it.Dosage,
					RelationEN:    relEN,
					RelationHI:    relHI,
					InstructionEN: fmt.Sprintf("Take %s %s", it.Dosage, relEN),
					InstructionHI: fmt.Sprintf("%s %s %s लें", it.Dosage, unitHI, relHI),
					DurationDays:  it.DurationDays,
					IsUnconfirmed: it.NeedsDoctorConfirmation,
				})
			}
		}

		if len(slotMeds) > 0 {
			relEN := strings.ReplaceAll(string(defaultRelation), "_", " ")
			relHI := HindiTimingRelations[defaultRelation]

			schedule = append(schedule, ConfirmedScheduleEntry{
				TimeSlot:    s.Name,
				TimeLabelHI: s.LabelHI,
				ApproxTime:  s.Approx,
				Relation:    relEN,
				RelationHI:  relHI,
				Medicines:   slotMeds,
			})
		}
	}

	return schedule
}

func GenerateBilingualInstructions(it *PrescriptionItem) (string, string) {
	var slotsEN, slotsHI []string
	if it.Morning {
		slotsEN = append(slotsEN, "Morning")
		slotsHI = append(slotsHI, "सुबह")
	}
	if it.Afternoon {
		slotsEN = append(slotsEN, "Afternoon")
		slotsHI = append(slotsHI, "दोपहर")
	}
	if it.Evening {
		slotsEN = append(slotsEN, "Evening")
		slotsHI = append(slotsHI, "शाम")
	}
	if it.Night {
		slotsEN = append(slotsEN, "Night")
		slotsHI = append(slotsHI, "रात")
	}

	sEN := "As directed"
	if len(slotsEN) > 0 {
		sEN = strings.Join(slotsEN, " & ")
	}
	sHI := "निर्देशानुसार"
	if len(slotsHI) > 0 {
		sHI = strings.Join(slotsHI, " और ")
	}

	relEN := strings.ReplaceAll(string(it.TimingRelation), "_", " ")
	relHI := HindiTimingRelations[it.TimingRelation]

	unitHI := "गोली"
	if strings.Contains(strings.ToLower(it.Form), "syrup") {
		unitHI = "चम्मच"
	} else if strings.Contains(strings.ToLower(it.Form), "capsule") {
		unitHI = "कैप्सूल"
	}

	en := fmt.Sprintf("Take %s %s in the %s for %d days.", it.Dosage, strings.ToLower(relEN), sEN, it.DurationDays)
	hi := fmt.Sprintf("%s में %s %s %s, %d दिनों तक लें।", sHI, it.Dosage, unitHI, relHI, it.DurationDays)

	return en, hi
}
