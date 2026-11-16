package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
)

// CORS Middleware
func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func jsonResponse(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(data)
}

func main() {
	mux := http.NewServeMux()

	// 1. Health check
	mux.HandleFunc("GET /api/health", func(w http.ResponseWriter, r *http.Request) {
		jsonResponse(w, http.StatusOK, map[string]interface{}{
			"status":                 "healthy",
			"engine":                 "Go (Golang 1.26)",
			"service":                "Smart Prescription System Backend",
			"zero_hallucination_ocr": "ACTIVE",
			"bilingual_support":      []string{"en", "hi"},
			"timestamp":              time.Now().Format(time.RFC3339),
		})
	})

	// 2. Search medicines
	mux.HandleFunc("GET /api/medicines", func(w http.ResponseWriter, r *http.Request) {
		query := r.URL.Query().Get("q")
		cat := r.URL.Query().Get("category")
		form := r.URL.Query().Get("form")

		results := SearchMedicines(query, cat, form)
		jsonResponse(w, http.StatusOK, map[string]interface{}{
			"count":     len(results),
			"medicines": results,
		})
	})

	// 3. Single medicine by ID
	mux.HandleFunc("GET /api/medicines/{id}", func(w http.ResponseWriter, r *http.Request) {
		id := r.PathValue("id")
		med := GetMedicineByID(id)
		if med == nil {
			jsonResponse(w, http.StatusNotFound, map[string]string{"error": "Medicine not found"})
			return
		}
		jsonResponse(w, http.StatusOK, med)
	})

	// 4. Generate unique prescription code
	mux.HandleFunc("GET /api/prescriptions/generate-id", func(w http.ResponseWriter, r *http.Request) {
		newID := GenerateUniqueRxID()
		jsonResponse(w, http.StatusOK, map[string]string{
			"prescription_id": newID,
		})
	})

	// 5. Safety validation
	mux.HandleFunc("POST /api/prescriptions/validate-safety", func(w http.ResponseWriter, r *http.Request) {
		var req SafetyCheckRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			jsonResponse(w, http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
			return
		}

		warnings := AnalyzeSafety(req.Items, req.Patient)
		schedule := GenerateSchedule(req.Items)

		jsonResponse(w, http.StatusOK, SafetyCheckResponse{
			IsSafe:   len(warnings) == 0,
			Warnings: warnings,
			Schedule: schedule,
		})
	})

	// 6. Create / Save prescription
	mux.HandleFunc("POST /api/prescriptions/create", func(w http.ResponseWriter, r *http.Request) {
		var rx Prescription
		if err := json.NewDecoder(r.Body).Decode(&rx); err != nil {
			jsonResponse(w, http.StatusBadRequest, map[string]string{"error": "Invalid prescription data"})
			return
		}

		if rx.ID == "" {
			rx.ID = GenerateUniqueRxID()
		}
		if rx.CreatedAt.IsZero() {
			rx.CreatedAt = time.Now()
		}

		// Ensure bilingual instructions
		for i := range rx.Items {
			if rx.Items[i].InstructionsEN == "" || rx.Items[i].InstructionsHI == "" {
				en, hi := GenerateBilingualInstructions(&rx.Items[i])
				rx.Items[i].InstructionsEN = en
				rx.Items[i].InstructionsHI = hi
			}
		}

		rx.SafetyWarnings = AnalyzeSafety(rx.Items, rx.Patient)
		rx.Schedule = GenerateSchedule(rx.Items)
		rx.QRCodeData = fmt.Sprintf("https://smartrx.hospital/patient/%s", rx.ID)

		GlobalStore.Save(&rx)

		jsonResponse(w, http.StatusOK, map[string]interface{}{
			"message":      "Prescription saved successfully in Go backend",
			"prescription": rx,
		})
	})

	// 7. List prescriptions
	mux.HandleFunc("GET /api/prescriptions", func(w http.ResponseWriter, r *http.Request) {
		list := GlobalStore.List()
		jsonResponse(w, http.StatusOK, list)
	})

	// 8. Get prescription by ID
	mux.HandleFunc("GET /api/prescriptions/{id}", func(w http.ResponseWriter, r *http.Request) {
		id := r.PathValue("id")
		rx := GlobalStore.Get(id)
		if rx == nil {
			jsonResponse(w, http.StatusNotFound, map[string]string{
				"error": fmt.Sprintf("Prescription '%s' not found", id),
			})
			return
		}
		jsonResponse(w, http.StatusOK, rx)
	})

	// 9. Dispense prescription
	mux.HandleFunc("POST /api/prescriptions/{id}/dispense", func(w http.ResponseWriter, r *http.Request) {
		id := r.PathValue("id")
		pharmacist := r.URL.Query().Get("pharmacist_name")
		if pharmacist == "" {
			pharmacist = "Chief Pharmacist"
		}

		rx := GlobalStore.Get(id)
		if rx == nil {
			jsonResponse(w, http.StatusNotFound, map[string]string{
				"error": fmt.Sprintf("Prescription '%s' not found", id),
			})
			return
		}

		rx.Status = StatusDispensed
		GlobalStore.Save(rx)

		jsonResponse(w, http.StatusOK, map[string]interface{}{
			"message":      fmt.Sprintf("Prescription %s marked as DISPENSED by %s", id, pharmacist),
			"prescription": rx,
		})
	})

	// 10. OCR scan
	mux.HandleFunc("POST /api/ocr/scan", func(w http.ResponseWriter, r *http.Request) {
		var req OCRScanRequest
		_ = json.NewDecoder(r.Body).Decode(&req)

		sampleType := req.SampleType
		if sampleType == "" {
			sampleType = "clean_typed_prescription"
		}

		result := ProcessOCR(sampleType, req.ImageBase64)
		jsonResponse(w, http.StatusOK, result)
	})

	// 11. Delivery dispatch
	mux.HandleFunc("POST /api/delivery/send", func(w http.ResponseWriter, r *http.Request) {
		var req DeliveryRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			jsonResponse(w, http.StatusBadRequest, map[string]string{"error": "Invalid delivery request"})
			return
		}

		rx := GlobalStore.Get(req.PrescriptionID)
		if rx == nil {
			jsonResponse(w, http.StatusNotFound, map[string]string{"error": "Prescription not found"})
			return
		}

		if req.Channel == "whatsapp" {
			data := GenerateWhatsAppPayload(rx, req.Language)
			jsonResponse(w, http.StatusOK, map[string]interface{}{
				"status":  "success",
				"channel": "whatsapp",
				"data":    data,
			})
		} else if req.Channel == "email" {
			data := GenerateEmailPayload(rx, req.Recipient)
			jsonResponse(w, http.StatusOK, map[string]interface{}{
				"status":  "success",
				"channel": "email",
				"data":    data,
			})
		} else {
			jsonResponse(w, http.StatusBadRequest, map[string]string{"error": "Invalid channel"})
		}
	})

	// 12. Voice instructions script
	mux.HandleFunc("GET /api/prescriptions/{id}/voice", func(w http.ResponseWriter, r *http.Request) {
		id := r.PathValue("id")
		rx := GlobalStore.Get(id)
		if rx == nil {
			jsonResponse(w, http.StatusNotFound, map[string]string{"error": "Prescription not found"})
			return
		}

		script := GenerateVoiceScript(rx)
		jsonResponse(w, http.StatusOK, script)
	})

	handler := enableCORS(mux)
	port := "8000"

	log.Printf("🚀 SmartRx Go Backend listening on http://127.0.0.1:%s (FastAPI completely replaced)\n", port)
	if err := http.ListenAndServe("127.0.0.1:"+port, handler); err != nil {
		log.Fatalf("Server failed to start: %v\n", err)
	}
}
