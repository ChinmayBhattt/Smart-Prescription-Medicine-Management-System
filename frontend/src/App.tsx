import React, { useState, useEffect } from 'react';
import { 
  Header 
} from './components/Header';
import { 
  MedicineCatalog 
} from './components/MedicineCatalog';
import { 
  PrescriptionBuilder 
} from './components/PrescriptionBuilder';
import { 
  PharmacistPortal 
} from './components/PharmacistPortal';
import { 
  PatientPortal 
} from './components/PatientPortal';
import { 
  SafetyAuditDrawer 
} from './components/SafetyAuditDrawer';
import { 
  OCRScannerModal 
} from './components/OCRScannerModal';
import { 
  DeliveryModal 
} from './components/DeliveryModal';
import { 
  VoiceInstructionPlayer 
} from './components/VoiceInstructionPlayer';
import { 
  Medicine, 
  Prescription, 
  PrescriptionItem 
} from './types';
import { 
  INITIAL_DOCTOR, 
  INITIAL_PATIENT, 
  INITIAL_MEDICINES 
} from './constants/mockData';
import { 
  fetchMedicines, 
  generatePrescriptionId, 
  savePrescription 
} from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState<'doctor' | 'pharmacist' | 'patient' | 'safety'>('doctor');
  const [language, setLanguage] = useState<'en' | 'hi'>('hi');
  const [medicines, setMedicines] = useState<Medicine[]>(INITIAL_MEDICINES);
  const [isOcrOpen, setIsOcrOpen] = useState(false);
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  // Active working prescription
  const [prescription, setPrescription] = useState<Prescription>({
    id: 'RX-2026-7849K',
    created_at: new Date().toISOString(),
    doctor: INITIAL_DOCTOR,
    patient: INITIAL_PATIENT,
    status: 'CONFIRMED_BY_DOCTOR',
    items: [
      {
        id: 'item-1',
        medicine_id: 'med-001',
        medicine_name: 'Dolo 650',
        generic_name: 'Paracetamol (Acetaminophen)',
        form: 'Tablet',
        strength: '650 mg',
        dosage: '1 tablet',
        morning: true,
        afternoon: false,
        evening: false,
        night: true,
        timing_relation: 'AFTER_FOOD',
        duration_days: 5,
        instructions_en: 'Take 1 tablet after food in the Morning & Night for 5 days.',
        instructions_hi: 'सुबह और रात में 1 गोली भोजन के बाद, 5 दिनों तक लें।',
        total_quantity: 10,
        needs_doctor_confirmation: false,
        confirmed_by_doctor: true
      },
      {
        id: 'item-2',
        medicine_id: 'med-004',
        medicine_name: 'Azithral 500',
        generic_name: 'Azithromycin',
        form: 'Tablet',
        strength: '500 mg',
        dosage: '1 tablet',
        morning: false,
        afternoon: false,
        evening: false,
        night: true,
        timing_relation: 'AFTER_FOOD',
        duration_days: 3,
        instructions_en: 'Take 1 tablet after food at Night for 3 days.',
        instructions_hi: 'रात में 1 गोली भोजन के बाद, 3 दिनों तक लें।',
        total_quantity: 3,
        needs_doctor_confirmation: false,
        confirmed_by_doctor: true
      },
      {
        id: 'item-3',
        medicine_id: 'med-003',
        medicine_name: 'Pan-D',
        generic_name: 'Pantoprazole + Domperidone',
        form: 'Capsule',
        strength: '40 mg / 30 mg SR',
        dosage: '1 capsule',
        morning: true,
        afternoon: false,
        evening: false,
        night: false,
        timing_relation: 'EMPTY_STOMACH',
        duration_days: 5,
        instructions_en: 'Take 1 capsule empty stomach in the Morning for 5 days.',
        instructions_hi: 'सुबह खाली पेट 1 कैप्सूल, 5 दिनों तक लें।',
        total_quantity: 5,
        needs_doctor_confirmation: false,
        confirmed_by_doctor: true
      }
    ],
    notes: 'Drink plenty of warm fluids. Complete full antibiotic course. Return for review if fever persists.',
    follow_up_days: 5,
    schedule: [
      {
        time_slot: 'Morning',
        time_label_hi: 'सुबह',
        approx_time: '08:00 AM',
        relation: 'Scheduled',
        relation_hi: 'नियत समय',
        medicines: [
          {
            medicine_name: 'Pan-D',
            generic_name: 'Pantoprazole + Domperidone',
            form: 'Capsule',
            strength: '40 mg / 30 mg SR',
            dosage: '1 capsule',
            relation_en: 'Empty Stomach',
            relation_hi: 'खाली पेट (Empty Stomach)',
            instruction_en: 'Take 1 capsule empty stomach',
            instruction_hi: '1 कैप्सूल खाली पेट लें',
            duration_days: 5
          },
          {
            medicine_name: 'Dolo 650',
            generic_name: 'Paracetamol (Acetaminophen)',
            form: 'Tablet',
            strength: '650 mg',
            dosage: '1 tablet',
            relation_en: 'After Food',
            relation_hi: 'भोजन के बाद (After Food)',
            instruction_en: 'Take 1 tablet after food',
            instruction_hi: '1 गोली भोजन के बाद लें',
            duration_days: 5
          }
        ]
      },
      {
        time_slot: 'Night',
        time_label_hi: 'रात',
        approx_time: '09:30 PM',
        relation: 'Scheduled',
        relation_hi: 'नियत समय',
        medicines: [
          {
            medicine_name: 'Dolo 650',
            generic_name: 'Paracetamol (Acetaminophen)',
            form: 'Tablet',
            strength: '650 mg',
            dosage: '1 tablet',
            relation_en: 'After Food',
            relation_hi: 'भोजन के बाद (After Food)',
            instruction_en: 'Take 1 tablet after food',
            instruction_hi: '1 गोली भोजन के बाद लें',
            duration_days: 5
          },
          {
            medicine_name: 'Azithral 500',
            generic_name: 'Azithromycin',
            form: 'Tablet',
            strength: '500 mg',
            dosage: '1 tablet',
            relation_en: 'After Food',
            relation_hi: 'भोजन के बाद (After Food)',
            instruction_en: 'Take 1 tablet after food',
            instruction_hi: '1 गोली भोजन के बाद लें',
            duration_days: 3
          }
        ]
      }
    ],
    safety_warnings: []
  });

  useEffect(() => {
    // Load medicines from backend API
    fetchMedicines().then(data => {
      if (data && data.length > 0) {
        setMedicines(data);
      }
    });
  }, []);

  const handleNewId = async () => {
    const newId = await generatePrescriptionId();
    setPrescription(prev => ({
      ...prev,
      id: newId,
      created_at: new Date().toISOString()
    }));
  };

  const handleAddMedicine = (med: Medicine) => {
    const newItem: PrescriptionItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      medicine_id: med.id,
      medicine_name: med.brand_name,
      generic_name: med.generic_name,
      form: med.form,
      strength: med.strength,
      dosage: med.form === 'Syrup' ? '5 ml' : (med.form === 'Inhaler' ? '1 puff' : '1 tablet'),
      morning: true,
      afternoon: false,
      evening: false,
      night: true,
      timing_relation: med.default_timing || 'AFTER_FOOD',
      duration_days: 5,
      instructions_en: `Take 1 ${med.form.toLowerCase()} after food in Morning & Night for 5 days.`,
      instructions_hi: `सुबह और रात में 1 खुराक भोजन के बाद, 5 दिनों तक लें।`,
      total_quantity: 10,
      needs_doctor_confirmation: false,
      confirmed_by_doctor: true
    };
    setPrescription(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const handleApplyOcrItems = (ocrItems: Partial<PrescriptionItem>[]) => {
    const newItems: PrescriptionItem[] = ocrItems.map((m, idx) => ({
      id: `ocr-${Date.now()}-${idx}`,
      medicine_id: m.medicine_id || `med-${idx}`,
      medicine_name: m.medicine_name || 'Prescribed Medicine',
      generic_name: m.generic_name || '',
      form: m.form || 'Tablet',
      strength: m.strength || 'Standard',
      dosage: m.dosage || '1 tablet',
      morning: m.morning || false,
      afternoon: m.afternoon || false,
      evening: m.evening || false,
      night: m.night || false,
      timing_relation: m.timing_relation || 'AFTER_FOOD',
      duration_days: m.duration_days || 5,
      instructions_en: `Take ${m.dosage || '1 dose'} as scheduled.`,
      instructions_hi: `${m.dosage || '1 खुराक'} निर्देशानुसार लें।`,
      total_quantity: 10,
      is_ocr_extracted: true,
      ocr_confidence: m.ocr_confidence,
      needs_doctor_confirmation: m.needs_doctor_confirmation || false,
      confirmed_by_doctor: !m.needs_doctor_confirmation,
      safety_notes: m.safety_notes
    }));

    setPrescription(prev => ({
      ...prev,
      items: [...prev.items, ...newItems]
    }));
  };

  const handleFinalize = async () => {
    await savePrescription(prescription);
    setIsDeliveryOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* 1. Universal Top Header */}
      <Header
        doctor={prescription.doctor}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        language={language}
        setLanguage={setLanguage}
        onOpenOcr={() => setIsOcrOpen(true)}
        onOpenVoice={() => setIsVoiceOpen(true)}
      />

      {/* 2. Main Workstation Area */}
      <main className="flex-1 p-4 md:p-6 max-w-[1600px] w-full mx-auto overflow-hidden">
        {activeTab === 'doctor' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-5rem)]">
            {/* Left 4 cols: Searchable Medicine Catalog */}
            <div className="lg:col-span-4 xl:col-span-4 h-full">
              <MedicineCatalog
                medicines={medicines}
                onAddMedicine={handleAddMedicine}
                language={language}
              />
            </div>

            {/* Right 8 cols: Drag & Drop Prescription Builder */}
            <div className="lg:col-span-8 xl:col-span-8 h-full">
              <PrescriptionBuilder
                prescription={prescription}
                onUpdatePrescription={setPrescription}
                onFinalize={handleFinalize}
                onOpenVoice={() => setIsVoiceOpen(true)}
                onNewId={handleNewId}
                language={language}
              />
            </div>
          </div>
        )}

        {activeTab === 'pharmacist' && (
          <div className="py-4">
            <PharmacistPortal language={language} />
          </div>
        )}

        {activeTab === 'patient' && (
          <div className="py-4">
            <PatientPortal
              initialPrescription={prescription}
              language={language}
            />
          </div>
        )}

        {activeTab === 'safety' && (
          <div className="py-4">
            <SafetyAuditDrawer
              prescription={prescription}
              language={language}
            />
          </div>
        )}
      </main>

      {/* 3. Safe Zero-Hallucination OCR Modal */}
      <OCRScannerModal
        isOpen={isOcrOpen}
        onClose={() => setIsOcrOpen(false)}
        onApplyMedicines={handleApplyOcrItems}
        language={language}
      />

      {/* 4. Delivery Modal (WhatsApp / Resend Email / PDF / QR Code) */}
      <DeliveryModal
        isOpen={isDeliveryOpen}
        onClose={() => setIsDeliveryOpen(false)}
        prescription={prescription}
        language={language}
      />

      {/* 5. Voice Instructions Modal (Bilingual Audio Narration) */}
      <VoiceInstructionPlayer
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        prescription={prescription}
        language={language}
      />

    </div>
  );
}

export default App;
