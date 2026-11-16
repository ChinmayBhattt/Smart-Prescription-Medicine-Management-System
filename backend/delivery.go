package main

import (
	"fmt"
	"net/url"
	"strings"
)

func GenerateWhatsAppPayload(rx *Prescription, language string) map[string]interface{} {
	cleanPhone := strings.ReplaceAll(rx.Patient.Phone, "+", "")
	cleanPhone = strings.ReplaceAll(cleanPhone, "-", "")
	cleanPhone = strings.ReplaceAll(cleanPhone, " ", "")
	if len(cleanPhone) == 10 {
		cleanPhone = "91" + cleanPhone
	}

	var msg string
	if language == "hi" {
		msg = fmt.Sprintf("🏥 *डिजिटल प्रिस्क्रिप्शन और दवा का समय*\n*प्रिस्क्रिप्शन कोड (ID):* `%s`\n*मरीज:* %s\n*डॉक्टर:* %s (%s)\n\n💊 *आपकी दवाओं का शेड्यूल:*\n",
			rx.ID, rx.Patient.Name, rx.Doctor.Name, rx.Doctor.ClinicHospital)
		for _, it := range rx.Items {
			t := it.InstructionsHI
			if t == "" {
				t = fmt.Sprintf("%s %s", it.Dosage, it.TimingRelation)
			}
			msg += fmt.Sprintf("• *%s* (%s): %s\n", it.MedicineName, it.Strength, t)
		}
		msg += fmt.Sprintf("\n📅 *दवा लेने का समय तालिका:*\n🌅 सुबह (08:00 AM)\n☀️ दोपहर (01:00 PM)\n🌙 रात (09:30 PM)\n\n🌐 *प्रिस्क्रिप्शन और वॉयस निर्देश देखें:*\nhttps://smartrx.hospital/patient/%s\n", rx.ID)
	} else {
		msg = fmt.Sprintf("🏥 *Digital Medical Prescription*\n*Prescription ID:* `%s`\n*Patient:* %s\n*Doctor:* %s (%s)\n\n💊 *Prescribed Medications:*\n",
			rx.ID, rx.Patient.Name, rx.Doctor.Name, rx.Doctor.ClinicHospital)
		for _, it := range rx.Items {
			t := it.InstructionsEN
			if t == "" {
				t = fmt.Sprintf("%s %s", it.Dosage, it.TimingRelation)
			}
			msg += fmt.Sprintf("• *%s* (%s): %s\n", it.MedicineName, it.Strength, t)
		}
		msg += fmt.Sprintf("\n📅 *Daily Intake Schedule:*\n🌅 Morning (08:00 AM)\n☀️ Afternoon (01:00 PM)\n🌙 Night (09:30 PM)\n\n🌐 *View Verified Prescription:*\nhttps://smartrx.hospital/patient/%s\n", rx.ID)
	}

	clickURL := fmt.Sprintf("https://wa.me/%s?text=%s", cleanPhone, url.QueryEscape(msg))

	return map[string]interface{}{
		"channel":          "whatsapp",
		"recipient_phone":  cleanPhone,
		"direct_click_url": clickURL,
		"message_body":     msg,
		"status":           "ready_to_send",
	}
}

func GenerateEmailPayload(rx *Prescription, recipient string) map[string]interface{} {
	targetEmail := recipient
	if targetEmail == "" {
		targetEmail = rx.Patient.Email
	}
	if targetEmail == "" {
		targetEmail = "patient@example.com"
	}

	return map[string]interface{}{
		"channel": "email",
		"to":      []string{targetEmail},
		"from":    "SmartRx System <prescriptions@resend.dev>",
		"subject": fmt.Sprintf("Official Prescription Receipt #%s - %s", rx.ID, rx.Doctor.ClinicHospital),
		"note":    "Resend API payload prepared and ready for delivery.",
	}
}
