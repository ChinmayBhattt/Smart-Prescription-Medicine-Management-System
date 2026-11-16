package main

import (
	"math/rand"
	"sync"
	"time"
)

type Store struct {
	mu            sync.RWMutex
	prescriptions map[string]*Prescription
}

var GlobalStore = &Store{
	prescriptions: make(map[string]*Prescription),
}

func init() {
	// Seed demo prescription RX-2026-7849K
	demoRx := &Prescription{
		ID:        "RX-2026-7849K",
		CreatedAt: time.Now(),
		Doctor: DoctorInfo{
			Name:           "Dr. Rajesh Sharma, MD",
			Qualification:  "Consultant Physician & Diabetologist",
			RegNumber:      "MCI-74829-DEL",
			ClinicHospital: "Apollo Wellness Center, New Delhi",
			Phone:          "+91 98112 34567",
			Email:          "dr.rajesh@apollowellness.org",
		},
		Patient: PatientInfo{
			Name:           "Aarav Mehta",
			Age:            36,
			Gender:         "Male",
			Phone:          "+91 98201 54321",
			Email:          "aarav.mehta@example.com",
			KnownAllergies: []string{"Penicillin"},
			Diagnosis:      "Acute Bronchitis & High Grade Fever",
		},
		Status: StatusConfirmedByDoctor,
		Items: []PrescriptionItem{
			{
				ID:                      "item-1",
				MedicineID:              "med-001",
				MedicineName:            "Dolo 650",
				GenericName:             "Paracetamol (Acetaminophen)",
				Form:                    "Tablet",
				Strength:                "650 mg",
				Dosage:                  "1 tablet",
				Morning:                 true,
				Afternoon:               false,
				Evening:                 false,
				Night:                   true,
				TimingRelation:          TimingAfterFood,
				DurationDays:            5,
				InstructionsEN:          "Take 1 tablet after food in the Morning & Night for 5 days.",
				InstructionsHI:          "सुबह और रात में 1 गोली भोजन के बाद, 5 दिनों तक लें।",
				TotalQuantity:           10,
				NeedsDoctorConfirmation: false,
				ConfirmedByDoctor:       true,
			},
			{
				ID:                      "item-2",
				MedicineID:              "med-004",
				MedicineName:            "Azithral 500",
				GenericName:             "Azithromycin",
				Form:                    "Tablet",
				Strength:                "500 mg",
				Dosage:                  "1 tablet",
				Morning:                 false,
				Afternoon:               false,
				Evening:                 false,
				Night:                   true,
				TimingRelation:          TimingAfterFood,
				DurationDays:            3,
				InstructionsEN:          "Take 1 tablet after food at Night for 3 days.",
				InstructionsHI:          "रात में 1 गोली भोजन के बाद, 3 दिनों तक लें।",
				TotalQuantity:           3,
				NeedsDoctorConfirmation: false,
				ConfirmedByDoctor:       true,
			},
			{
				ID:                      "item-3",
				MedicineID:              "med-003",
				MedicineName:            "Pan-D",
				GenericName:             "Pantoprazole + Domperidone",
				Form:                    "Capsule",
				Strength:                "40 mg / 30 mg SR",
				Dosage:                  "1 capsule",
				Morning:                 true,
				Afternoon:               false,
				Evening:                 false,
				Night:                   false,
				TimingRelation:          TimingEmptyStomach,
				DurationDays:            5,
				InstructionsEN:          "Take 1 capsule empty stomach in the Morning for 5 days.",
				InstructionsHI:          "सुबह खाली पेट 1 कैप्सूल, 5 दिनों तक लें।",
				TotalQuantity:           5,
				NeedsDoctorConfirmation: false,
				ConfirmedByDoctor:       true,
			},
		},
		Notes:        "Drink plenty of warm fluids. Complete full antibiotic course. Return for review if fever persists.",
		FollowUpDays: 5,
		QRCodeData:   "https://smartrx.hospital/patient/RX-2026-7849K",
	}
	demoRx.Schedule = GenerateSchedule(demoRx.Items)
	demoRx.SafetyWarnings = AnalyzeSafety(demoRx.Items, demoRx.Patient)

	GlobalStore.prescriptions[demoRx.ID] = demoRx
}

func (s *Store) Save(rx *Prescription) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.prescriptions[rx.ID] = rx
}

func (s *Store) Get(id string) *Prescription {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.prescriptions[id]
}

func (s *Store) List() []*Prescription {
	s.mu.RLock()
	defer s.mu.RUnlock()
	var list []*Prescription
	for _, rx := range s.prescriptions {
		list = append(list, rx)
	}
	return list
}

func GenerateUniqueRxID() string {
	const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"
	b := make([]byte, 5)
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	for i := range b {
		b[i] = chars[r.Intn(len(chars))]
	}
	return "RX-" + time.Now().Format("2006") + "-" + string(b)
}
