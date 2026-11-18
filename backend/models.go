package main

import "time"

type TimingRelation string

const (
	TimingAfterFood    TimingRelation = "AFTER_FOOD"
	TimingBeforeFood   TimingRelation = "BEFORE_FOOD"
	TimingWithFood     TimingRelation = "WITH_FOOD"
	TimingEmptyStomach TimingRelation = "EMPTY_STOMACH"
	TimingBedtime      TimingRelation = "BEDTIME"
)

type DosageForm string

const (
	FormTablet    DosageForm = "Tablet"
	FormCapsule   DosageForm = "Capsule"
	FormSyrup     DosageForm = "Syrup"
	FormDrops     DosageForm = "Drops"
	FormInjection DosageForm = "Injection"
	FormOintment  DosageForm = "Ointment"
	FormInhaler   DosageForm = "Inhaler"
)

type PrescriptionStatus string

const (
	StatusDraft               PrescriptionStatus = "DRAFT"
	StatusConfirmedByDoctor   PrescriptionStatus = "CONFIRMED_BY_DOCTOR"
	StatusDispensed           PrescriptionStatus = "DISPENSED"
	StatusCancelled           PrescriptionStatus = "CANCELLED"
)

type Medicine struct {
	ID                string         `json:"id"`
	BrandName         string         `json:"brand_name"`
	GenericName       string         `json:"generic_name"`
	Category          string         `json:"category"`
	Form              DosageForm     `json:"form"`
	Strength          string         `json:"strength"`
	Composition       string         `json:"composition"`
	StandardUnit      string         `json:"standard_unit"`
	CommonIndications []string       `json:"common_indications"`
	HindiName         string         `json:"hindi_name,omitempty"`
	DefaultTiming     TimingRelation `json:"default_timing"`
	Contraindications []string       `json:"contraindications"`
	Source            string         `json:"source,omitempty"`
}

type PrescriptionItem struct {
	ID                       string         `json:"id"`
	MedicineID               string         `json:"medicine_id"`
	MedicineName             string         `json:"medicine_name"`
	GenericName              string         `json:"generic_name"`
	Form                     string         `json:"form"`
	Strength                 string         `json:"strength"`
	Dosage                   string         `json:"dosage"`
	Morning                  bool           `json:"morning"`
	Afternoon                bool           `json:"afternoon"`
	Evening                  bool           `json:"evening"`
	Night                    bool           `json:"night"`
	TimingRelation           TimingRelation `json:"timing_relation"`
	DurationDays             int            `json:"duration_days"`
	InstructionsEN           string         `json:"instructions_en"`
	InstructionsHI           string         `json:"instructions_hi"`
	TotalQuantity            int            `json:"total_quantity"`
	IsOCRExtracted           bool           `json:"is_ocr_extracted,omitempty"`
	OCRConfidence            *float64       `json:"ocr_confidence,omitempty"`
	NeedsDoctorConfirmation  bool           `json:"needs_doctor_confirmation"`
	ConfirmedByDoctor        bool           `json:"confirmed_by_doctor"`
	SafetyNotes              string         `json:"safety_notes,omitempty"`
}

type PatientInfo struct {
	Name           string   `json:"name"`
	Age            int      `json:"age"`
	Gender         string   `json:"gender"`
	Phone          string   `json:"phone"`
	Email          string   `json:"email,omitempty"`
	Address        string   `json:"address,omitempty"`
	KnownAllergies []string `json:"known_allergies"`
	Diagnosis      string   `json:"diagnosis"`
}

type DoctorInfo struct {
	Name            string `json:"name"`
	Qualification   string `json:"qualification"`
	RegNumber       string `json:"reg_number"`
	ClinicHospital  string `json:"clinic_hospital"`
	Phone           string `json:"phone"`
	Email           string `json:"email"`
	SignatureToken  string `json:"signature_token,omitempty"`
}

type ScheduledMedicine struct {
	MedicineName   string `json:"medicine_name"`
	GenericName    string `json:"generic_name"`
	Form           string `json:"form"`
	Strength       string `json:"strength"`
	Dosage         string `json:"dosage"`
	RelationEN     string `json:"relation_en"`
	RelationHI     string `json:"relation_hi"`
	InstructionEN  string `json:"instruction_en"`
	InstructionHI  string `json:"instruction_hi"`
	DurationDays   int    `json:"duration_days"`
	IsUnconfirmed  bool   `json:"is_unconfirmed"`
}

type ConfirmedScheduleEntry struct {
	TimeSlot     string              `json:"time_slot"`      // "Morning", "Afternoon", "Evening", "Night"
	TimeLabelHI  string              `json:"time_label_hi"`   // "सुबह", "दोपहर", "शाम", "रात"
	ApproxTime   string              `json:"approx_time"`    // "08:00 AM", etc.
	Relation     string              `json:"relation"`
	RelationHI   string              `json:"relation_hi"`
	Medicines    []ScheduledMedicine `json:"medicines"`
}

type Prescription struct {
	ID                string                   `json:"id"`
	CreatedAt         time.Time                `json:"created_at"`
	Doctor            DoctorInfo               `json:"doctor"`
	Patient           PatientInfo              `json:"patient"`
	Status            PrescriptionStatus       `json:"status"`
	Items             []PrescriptionItem       `json:"items"`
	Notes             string                   `json:"notes,omitempty"`
	FollowUpDays      int                      `json:"follow_up_days,omitempty"`
	Schedule          []ConfirmedScheduleEntry `json:"schedule"`
	SafetyWarnings    []string                 `json:"safety_warnings"`
	DigitalReceiptURL string                   `json:"digital_receipt_url,omitempty"`
	QRCodeData        string                   `json:"qr_code_data,omitempty"`
}

type SafetyCheckRequest struct {
	Items   []PrescriptionItem `json:"items"`
	Patient PatientInfo        `json:"patient"`
}

type SafetyCheckResponse struct {
	IsSafe   bool                     `json:"is_safe"`
	Warnings []string                 `json:"warnings"`
	Schedule []ConfirmedScheduleEntry `json:"schedule"`
}

type OCRScanRequest struct {
	ImageBase64 string `json:"image_base64,omitempty"`
	SampleType  string `json:"sample_type,omitempty"`
}

type OCRScanResult struct {
	RawExtractedText        string                   `json:"raw_extracted_text"`
	OverallConfidence       float64                  `json:"overall_confidence"`
	DetectedMedicines       []map[string]interface{} `json:"detected_medicines"`
	FlaggedForConfirmation  bool                     `json:"flagged_for_confirmation"`
	SafetyDisclaimer        string                   `json:"safety_disclaimer"`
	UnclearLines            []string                 `json:"unclear_lines"`
}

type DeliveryRequest struct {
	PrescriptionID string `json:"prescription_id"`
	Channel        string `json:"channel"`  // "whatsapp", "email"
	Recipient      string `json:"recipient"`
	Language       string `json:"language"` // "en", "hi"
}
