package main

import (
	"strings"
	"testing"
)

func TestGenerateUniqueRxID(t *testing.T) {
	id := GenerateUniqueRxID()
	if !strings.HasPrefix(id, "RX-2026-") {
		t.Errorf("Expected Rx ID to start with 'RX-2026-', got: %s", id)
	}
	if len(id) < 12 {
		t.Errorf("Expected Rx ID to be at least 12 characters, got: %s", id)
	}
}

func TestAnalyzeSafety_AllergyConflict(t *testing.T) {
	patient := PatientInfo{
		Name:           "Test Patient",
		Age:            30,
		Gender:         "Male",
		KnownAllergies: []string{"Penicillin"},
	}

	items := []PrescriptionItem{
		{
			ID:                "item-1",
			MedicineName:      "Augmentin 625 Duo",
			GenericName:       "Amoxicillin + Clavulanic Acid",
			ConfirmedByDoctor: true,
		},
	}

	warnings := AnalyzeSafety(items, patient)
	foundAllergyWarning := false
	for _, w := range warnings {
		if strings.Contains(strings.ToLower(w), "allergy") {
			foundAllergyWarning = true
			break
		}
	}

	if !foundAllergyWarning {
		t.Errorf("Expected allergy warning for Penicillin/Amoxicillin, but got: %v", warnings)
	}
}

func TestAnalyzeSafety_DuplicateParacetamol(t *testing.T) {
	patient := PatientInfo{
		Name:           "Test Patient",
		Age:            45,
		Gender:         "Female",
		KnownAllergies: []string{},
	}

	items := []PrescriptionItem{
		{
			ID:                "item-1",
			MedicineName:      "Dolo 650",
			GenericName:       "Paracetamol (Acetaminophen)",
			ConfirmedByDoctor: true,
		},
		{
			ID:                "item-2",
			MedicineName:      "Combiflam",
			GenericName:       "Ibuprofen + Paracetamol",
			ConfirmedByDoctor: true,
		},
	}

	warnings := AnalyzeSafety(items, patient)
	foundDuplicatePCM := false
	for _, w := range warnings {
		if strings.Contains(strings.ToLower(w), "duplicate paracetamol") {
			foundDuplicatePCM = true
			break
		}
	}

	if !foundDuplicatePCM {
		t.Errorf("Expected duplicate Paracetamol warning, got: %v", warnings)
	}
}

func TestGenerateSchedule(t *testing.T) {
	items := []PrescriptionItem{
		{
			ID:             "item-1",
			MedicineName:   "Pan-D",
			GenericName:    "Pantoprazole + Domperidone",
			Form:           "Capsule",
			Strength:       "40 mg",
			Dosage:         "1 capsule",
			Morning:        true,
			Afternoon:      false,
			Evening:        false,
			Night:          false,
			TimingRelation: TimingEmptyStomach,
			DurationDays:   5,
		},
		{
			ID:             "item-2",
			MedicineName:   "Dolo 650",
			GenericName:    "Paracetamol",
			Form:           "Tablet",
			Strength:       "650 mg",
			Dosage:         "1 tablet",
			Morning:        true,
			Afternoon:      false,
			Evening:        false,
			Night:          true,
			TimingRelation: TimingAfterFood,
			DurationDays:   3,
		},
	}

	schedule := GenerateSchedule(items)
	if len(schedule) == 0 {
		t.Fatal("Expected schedule entries, got 0")
	}

	hasMorning := false
	hasNight := false
	for _, slot := range schedule {
		if slot.TimeSlot == "Morning" && len(slot.Medicines) == 2 {
			hasMorning = true
		}
		if slot.TimeSlot == "Night" && len(slot.Medicines) == 1 {
			hasNight = true
		}
	}

	if !hasMorning {
		t.Errorf("Expected 2 medicines in Morning slot")
	}
	if !hasNight {
		t.Errorf("Expected 1 medicine in Night slot")
	}
}
