package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"
	"sync"
	"time"
)

// DrugSetu Base URLs (API keys are loaded exclusively from .env)
const (
	DrugSetuBaseURL1 = "https://api.drugsetu.in/v1"
	DrugSetuBaseURL2 = "https://api.drugsetu.com/v1"
)

// GetDrugSetuPrivateKey loads the private key strictly from .env or system environment
func GetDrugSetuPrivateKey() string {
	if val := os.Getenv("DRUGSETU_PRIVATE_KEY"); val != "" {
		return val
	}

	// Read strictly from .env file
	for _, envPath := range []string{".env", "backend/.env", "../backend/.env"} {
		f, err := os.Open(envPath)
		if err == nil {
			defer f.Close()
			scanner := bufio.NewScanner(f)
			for scanner.Scan() {
				line := strings.TrimSpace(scanner.Text())
				if strings.HasPrefix(line, "DRUGSETU_PRIVATE_KEY=") {
					return strings.Trim(strings.TrimPrefix(line, "DRUGSETU_PRIVATE_KEY="), "\"'\r ")
				}
			}
		}
	}

	return ""
}

// Cache entry with TTL (5 minutes)
type cacheItem struct {
	medicines []Medicine
	timestamp time.Time
}

var (
	drugSetuCache   sync.Map
	drugSetuHTTPCli = &http.Client{
		Timeout: 4 * time.Second,
	}
)

// Raw DrugSetu response item representation
type DrugSetuMedicineRaw struct {
	ID             interface{} `json:"id"`
	Name           string      `json:"name"`
	BrandName      string      `json:"brand_name"`
	GenericName    string      `json:"generic_name"`
	Salt           string      `json:"salt"`
	Composition    string      `json:"composition"`
	DosageForm     string      `json:"dosage_form"`
	Form           string      `json:"form"`
	Strength       string      `json:"strength"`
	Manufacturer   string      `json:"manufacturer"`
	Category       string      `json:"category"`
	Indications    interface{} `json:"indications"`
	SideEffects    interface{} `json:"side_effects"`
	Price          interface{} `json:"price"`
	MRP            interface{} `json:"mrp"`
	PackageSize    string      `json:"package_size"`
}

type DrugSetuSearchResponse struct {
	Status    string                `json:"status"`
	Total     int                   `json:"total"`
	Data      []DrugSetuMedicineRaw `json:"data"`
	Results   []DrugSetuMedicineRaw `json:"results"`
	Medicines []DrugSetuMedicineRaw `json:"medicines"`
}

// Map any dosage string to our strict DosageForm
func parseDosageForm(raw string) DosageForm {
	lower := strings.ToLower(raw)
	switch {
	case strings.Contains(lower, "tab"):
		return FormTablet
	case strings.Contains(lower, "cap"):
		return FormCapsule
	case strings.Contains(lower, "syr") || strings.Contains(lower, "liquid") || strings.Contains(lower, "susp"):
		return FormSyrup
	case strings.Contains(lower, "drop"):
		return FormDrops
	case strings.Contains(lower, "inj"):
		return FormInjection
	case strings.Contains(lower, "oint") || strings.Contains(lower, "gel") || strings.Contains(lower, "cream"):
		return FormOintment
	case strings.Contains(lower, "inhal") || strings.Contains(lower, "resp"):
		return FormInhaler
	default:
		return FormTablet
	}
}

// Convert DrugSetu item into SmartRx standard Medicine struct
func convertDrugSetuToMedicine(raw DrugSetuMedicineRaw, idx int) Medicine {
	brand := raw.BrandName
	if brand == "" {
		brand = raw.Name
	}
	if brand == "" {
		brand = fmt.Sprintf("Drug #%v", raw.ID)
	}

	generic := raw.GenericName
	if generic == "" {
		generic = raw.Salt
	}
	if generic == "" {
		generic = raw.Composition
	}
	if generic == "" {
		generic = brand
	}

	formStr := raw.DosageForm
	if formStr == "" {
		formStr = raw.Form
	}
	form := parseDosageForm(formStr)

	composition := raw.Composition
	if composition == "" {
		composition = raw.Salt
	}
	if composition == "" {
		composition = generic
	}

	strength := raw.Strength
	if strength == "" {
		// Try to parse strength from brand name e.g. "Dolo 650", "Pan 40"
		parts := strings.Fields(brand)
		for _, p := range parts {
			if strings.ContainsAny(p, "0123456789") && (strings.HasSuffix(p, "mg") || strings.HasSuffix(p, "ml") || strings.HasSuffix(p, "g") || len(p) <= 4) {
				strength = p
				break
			}
		}
		if strength == "" {
			strength = "Standard Dose"
		}
	}

	idStr := fmt.Sprintf("ds-%v", raw.ID)
	if raw.ID == nil || fmt.Sprintf("%v", raw.ID) == "" {
		idStr = fmt.Sprintf("ds-%d-%s", idx, strings.ToLower(strings.ReplaceAll(brand, " ", "-")))
	}

	cat := raw.Category
	if cat == "" {
		// Infer category
		lowerGen := strings.ToLower(generic)
		switch {
		case strings.Contains(lowerGen, "paracetamol") || strings.Contains(lowerGen, "ibuprofen") || strings.Contains(lowerGen, "mefenamic"):
			cat = "Antipyretic & Analgesic"
		case strings.Contains(lowerGen, "cillin") || strings.Contains(lowerGen, "mycin") || strings.Contains(lowerGen, "oxacin") || strings.Contains(lowerGen, "cefp") || strings.Contains(lowerGen, "cefix"):
			cat = "Antibacterial / Antibiotic"
		case strings.Contains(lowerGen, "prazole") || strings.Contains(lowerGen, "tidine") || strings.Contains(lowerGen, "domperidone"):
			cat = "Gastroprokinetic & Antacid"
		case strings.Contains(lowerGen, "metformin") || strings.Contains(lowerGen, "glim") || strings.Contains(lowerGen, "vildag"):
			cat = "Anti-Diabetic"
		case strings.Contains(lowerGen, "sartan") || strings.Contains(lowerGen, "dipine") || strings.Contains(lowerGen, "olol"):
			cat = "Antihypertensive"
		case strings.Contains(lowerGen, "cetirizine") || strings.Contains(lowerGen, "montelukast") || strings.Contains(lowerGen, "fexo"):
			cat = "Antiallergic & Anti-asthmatic"
		default:
			cat = "General Pharmaceutical"
		}
	}

	var indications []string
	switch v := raw.Indications.(type) {
	case []interface{}:
		for _, item := range v {
			if str, ok := item.(string); ok && str != "" {
				indications = append(indications, str)
			}
		}
	case string:
		if v != "" {
			for _, part := range strings.Split(v, ",") {
				if tr := strings.TrimSpace(part); tr != "" {
					indications = append(indications, tr)
				}
			}
		}
	}

	if len(indications) == 0 {
		indications = []string{cat, "As directed by physician"}
	}

	var contra []string
	lowerName := strings.ToLower(brand + " " + generic)
	if strings.Contains(lowerName, "paracetamol") {
		contra = append(contra, "Severe Hepatic Impairment")
	}
	if strings.Contains(lowerName, "amoxicillin") || strings.Contains(lowerName, "penicillin") {
		contra = append(contra, "Penicillin Allergy")
	}
	if strings.Contains(lowerName, "metformin") {
		contra = append(contra, "Severe Renal Impairment (eGFR < 30)")
	}

	return Medicine{
		ID:                idStr,
		BrandName:         brand,
		GenericName:       generic,
		Category:          cat,
		Form:              form,
		Strength:          strength,
		Composition:       composition,
		StandardUnit:      strings.ToLower(string(form)),
		CommonIndications: indications,
		DefaultTiming:     TimingAfterFood,
		Contraindications: contra,
	}
}

// FetchLiveDrugSetuMedicines queries the DrugSetu API with timeout & fallback
func FetchLiveDrugSetuMedicines(query string) ([]Medicine, error) {
	q := strings.TrimSpace(query)
	if q == "" {
		return nil, nil
	}

	apiKey := GetDrugSetuPrivateKey()
	if apiKey == "" {
		return nil, fmt.Errorf("DRUGSETU_PRIVATE_KEY is not configured in .env")
	}

	// Check in-memory cache first
	cacheKey := strings.ToLower(q)
	if val, ok := drugSetuCache.Load(cacheKey); ok {
		item := val.(cacheItem)
		if time.Since(item.timestamp) < 5*time.Minute {
			return item.medicines, nil
		}
	}

	// Try base URLs (api.drugsetu.in then api.drugsetu.com)
	endpoints := []string{
		fmt.Sprintf("%s/medicines/search?q=%s", DrugSetuBaseURL1, url.QueryEscape(q)),
		fmt.Sprintf("%s/medicines?q=%s", DrugSetuBaseURL1, url.QueryEscape(q)),
		fmt.Sprintf("%s/medicines/search?q=%s", DrugSetuBaseURL2, url.QueryEscape(q)),
	}

	var lastErr error
	for _, ep := range endpoints {
		req, err := http.NewRequest("GET", ep, nil)
		if err != nil {
			lastErr = err
			continue
		}

		apiKey := GetDrugSetuPrivateKey()
		req.Header.Set("X-API-Key", apiKey)
		req.Header.Set("Accept", "application/json")
		req.Header.Set("User-Agent", "SmartRx-Clinic-System/2.0")

		resp, err := drugSetuHTTPCli.Do(req)
		if err != nil {
			lastErr = err
			continue
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			lastErr = fmt.Errorf("DrugSetu API returned HTTP %d for %s", resp.StatusCode, ep)
			continue
		}

		var parsed DrugSetuSearchResponse
		if err := json.NewDecoder(resp.Body).Decode(&parsed); err != nil {
			lastErr = err
			continue
		}

		var rawItems []DrugSetuMedicineRaw
		if len(parsed.Data) > 0 {
			rawItems = parsed.Data
		} else if len(parsed.Results) > 0 {
			rawItems = parsed.Results
		} else if len(parsed.Medicines) > 0 {
			rawItems = parsed.Medicines
		}

		var meds []Medicine
		for i, raw := range rawItems {
			meds = append(meds, convertDrugSetuToMedicine(raw, i))
		}

		if len(meds) > 0 {
			// Store in cache
			drugSetuCache.Store(cacheKey, cacheItem{
				medicines: meds,
				timestamp: time.Now(),
			})
			return meds, nil
		}
	}

	return nil, lastErr
}

// SearchMedicinesWithDrugSetu blends DrugSetu live data with local curated clinic catalog
func SearchMedicinesWithDrugSetu(query, category, form string) []Medicine {
	localResults := SearchMedicines(query, category, form)

	// If query is present, also query DrugSetu for live Indian drug data
	if strings.TrimSpace(query) != "" {
		liveMeds, err := FetchLiveDrugSetuMedicines(query)
		if err != nil {
			// Log quietly; local catalog ensures 100% zero downtime
			log.Printf("[DrugSetu Note] Live lookup for '%s': %v (served from local Indian clinic catalog)", query, err)
		} else if len(liveMeds) > 0 {
			// Merge with deduplication (by normalized brand name)
			seen := make(map[string]bool)
			var combined []Medicine

			// Keep local high-priority items first
			for _, m := range localResults {
				norm := strings.ToLower(strings.TrimSpace(m.BrandName))
				seen[norm] = true
				combined = append(combined, m)
			}

			// Add unique DrugSetu items
			catLower := strings.ToLower(strings.TrimSpace(category))
			formLower := strings.ToLower(strings.TrimSpace(form))

			for _, m := range liveMeds {
				norm := strings.ToLower(strings.TrimSpace(m.BrandName))
				if seen[norm] {
					continue
				}
				if catLower != "" && catLower != "all" && strings.ToLower(m.Category) != catLower {
					continue
				}
				if formLower != "" && formLower != "all" && strings.ToLower(string(m.Form)) != formLower {
					continue
				}
				seen[norm] = true
				combined = append(combined, m)
			}

			return combined
		}
	}

	return localResults
}
