import React, { useState } from 'react';
import { 
  Trash2, 
  Copy, 
  Check, 
  RefreshCw, 
  AlertTriangle, 
  FileCheck2, 
  User, 
  Share2, 
  Volume2, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { 
  Prescription, 
  PrescriptionItem, 
  PatientInfo, 
  Medicine, 
  TimingRelation 
} from '../types';
import { MedicineSchedule } from './MedicineSchedule';

interface PrescriptionBuilderProps {
  prescription: Prescription;
  onUpdatePrescription: (rx: Prescription) => void;
  onFinalize: () => void;
  onOpenVoice: () => void;
  onNewId: () => void;
  language: 'en' | 'hi';
}

export const PrescriptionBuilder: React.FC<PrescriptionBuilderProps> = ({
  prescription,
  onUpdatePrescription,
  onFinalize,
  onOpenVoice,
  onNewId,
  language
}) => {
  const [copied, setCopied] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(prescription.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    try {
      const data = e.dataTransfer.getData('application/json');
      if (data) {
        const medicine: Medicine = JSON.parse(data);
        addItemFromMedicine(medicine);
      }
    } catch (err) {
      console.error('Error handling dropped medicine:', err);
    }
  };

  const addItemFromMedicine = (med: Medicine) => {
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
      instructions_en: '',
      instructions_hi: '',
      total_quantity: 10,
      needs_doctor_confirmation: false,
      confirmed_by_doctor: true
    };
    updateItemInstructions(newItem);
    const updatedItems = [...prescription.items, newItem];
    recomputePrescription(updatedItems, prescription.patient);
  };

  const updateItemInstructions = (item: PrescriptionItem) => {
    const slots_en: string[] = [];
    const slots_hi: string[] = [];
    if (item.morning) { slots_en.push('Morning'); slots_hi.push('सुबह'); }
    if (item.afternoon) { slots_en.push('Afternoon'); slots_hi.push('दोपहर'); }
    if (item.evening) { slots_en.push('Evening'); slots_hi.push('शाम'); }
    if (item.night) { slots_en.push('Night'); slots_hi.push('रात'); }

    const sEn = slots_en.length > 0 ? slots_en.join(' & ') : 'As directed';
    const sHi = slots_hi.length > 0 ? slots_hi.join(' और ') : 'निर्देशानुसार';

    const relEn = item.timing_relation.replace('_', ' ').toLowerCase();
    const relHi = item.timing_relation === 'AFTER_FOOD' ? 'भोजन के बाद' : 
      (item.timing_relation === 'EMPTY_STOMACH' ? 'खाली पेट' : 'भोजन के साथ');

    item.instructions_en = `Take ${item.dosage} ${relEn} in the ${sEn} for ${item.duration_days} days.`;
    item.instructions_hi = `${sHi} में ${item.dosage} ${relHi}, ${item.duration_days} दिनों तक लें।`;

    const activeSlots = (item.morning ? 1 : 0) + (item.afternoon ? 1 : 0) + (item.evening ? 1 : 0) + (item.night ? 1 : 0);
    item.total_quantity = Math.max(1, activeSlots * item.duration_days);
  };

  const handleItemChange = (index: number, updates: Partial<PrescriptionItem>) => {
    const items = [...prescription.items];
    const updated = { ...items[index], ...updates };
    updateItemInstructions(updated);
    items[index] = updated;
    recomputePrescription(items, prescription.patient);
  };

  const handleConfirmItem = (index: number) => {
    const items = [...prescription.items];
    items[index] = {
      ...items[index],
      needs_doctor_confirmation: false,
      confirmed_by_doctor: true,
      safety_notes: 'Doctor manually verified dosage.'
    };
    recomputePrescription(items, prescription.patient);
  };

  const handleRemoveItem = (index: number) => {
    const items = prescription.items.filter((_, i) => i !== index);
    recomputePrescription(items, prescription.patient);
  };

  const handlePatientChange = (field: keyof PatientInfo, value: any) => {
    const updatedPatient = { ...prescription.patient, [field]: value };
    recomputePrescription(prescription.items, updatedPatient);
  };

  const recomputePrescription = (items: PrescriptionItem[], patient: PatientInfo) => {
    const warnings: string[] = [];

    // Allergy check
    const allergies = patient.known_allergies.map(a => a.toLowerCase().trim());
    items.forEach(it => {
      const gen = it.generic_name.toLowerCase();
      allergies.forEach(al => {
        if (al && (gen.includes(al) || (al === 'penicillin' && gen.includes('amoxicillin')))) {
          warnings.push(`⚠️ ALLERGY ALERT: Patient allergic to '${al.toUpperCase()}' contained in ${it.medicine_name} (${it.generic_name}).`);
        }
      });
    });

    // Duplicate Paracetamol
    const pcmCount = items.filter(it => it.generic_name.toLowerCase().includes('paracetamol')).length;
    if (pcmCount > 1) {
      warnings.push('⚠️ DUPLICATE ANALGESIC: Multiple medications contain Paracetamol. Avoid cumulative hepatotoxicity (>3000mg/day).');
    }

    // Unconfirmed items alert
    const hasUnconfirmed = items.some(it => it.needs_doctor_confirmation || !it.confirmed_by_doctor);
    if (hasUnconfirmed) {
      warnings.push('🚨 SAFETY HOLD: One or more medicines require Doctor Confirmation. Dosages cannot be dispensed until verified.');
    }

    // Compute 24-hr schedule
    const timeSlots: ('Morning' | 'Afternoon' | 'Evening' | 'Night')[] = ['Morning', 'Afternoon', 'Evening', 'Night'];
    const approxTimes = {
      Morning: '08:00 AM',
      Afternoon: '01:00 PM',
      Evening: '06:00 PM',
      Night: '09:30 PM'
    };
    const hiLabels = {
      Morning: 'सुबह',
      Afternoon: 'दोपहर',
      Evening: 'शाम',
      Night: 'रात'
    };

    const schedule = timeSlots.map(slot => {
      const slotMeds = items.filter(it => {
        if (slot === 'Morning') return it.morning;
        if (slot === 'Afternoon') return it.afternoon;
        if (slot === 'Evening') return it.evening;
        if (slot === 'Night') return it.night;
        return false;
      }).map(it => {
        const relHi = it.timing_relation === 'AFTER_FOOD' ? 'भोजन के बाद' : 
          (it.timing_relation === 'EMPTY_STOMACH' ? 'खाली पेट' : 'भोजन के साथ');
        return {
          medicine_name: it.medicine_name,
          generic_name: it.generic_name,
          form: it.form,
          strength: it.strength,
          dosage: it.dosage,
          relation_en: it.timing_relation.replace('_', ' '),
          relation_hi: relHi,
          instruction_en: `Take ${it.dosage} ${it.timing_relation.replace('_', ' ').toLowerCase()}`,
          instruction_hi: `${it.dosage} ${relHi} लें`,
          duration_days: it.duration_days,
          is_unconfirmed: it.needs_doctor_confirmation
        };
      });

      return {
        time_slot: slot,
        time_label_hi: hiLabels[slot],
        approx_time: approxTimes[slot],
        relation: 'Scheduled',
        relation_hi: 'नियत समय',
        medicines: slotMeds
      };
    }).filter(s => s.medicines.length > 0);

    onUpdatePrescription({
      ...prescription,
      patient,
      items,
      safety_warnings: warnings,
      schedule
    });
  };

  const timingRelations: { value: TimingRelation; label_en: string; label_hi: string }[] = [
    { value: 'AFTER_FOOD', label_en: 'After Food (भोजन के बाद)', label_hi: 'भोजन के बाद' },
    { value: 'BEFORE_FOOD', label_en: 'Before Food (भोजन से पहले)', label_hi: 'भोजन से पहले' },
    { value: 'EMPTY_STOMACH', label_en: 'Empty Stomach (खाली पेट)', label_hi: 'खाली पेट' },
    { value: 'WITH_FOOD', label_en: 'With Food (भोजन के साथ)', label_hi: 'भोजन के साथ' },
    { value: 'BEDTIME', label_en: 'At Bedtime (सोने से पहले)', label_hi: 'सोने से पहले' }
  ];

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      
      {/* 1. Header Toolbar with Unique Prescription Code */}
      <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
            <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              RX CODE
            </span>
            <span className="font-mono text-sm font-bold text-slate-900 tracking-wide">
              {prescription.id}
            </span>
            <button
              onClick={handleCopyId}
              className="text-slate-400 hover:text-slate-700 transition-colors p-0.5"
              title="Copy Unique Code"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <button
            onClick={onNewId}
            className="flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs"
            title="Generate new unique prescription ID"
          >
            <RefreshCw className="w-3 h-3 text-slate-500" />
            <span>{language === 'hi' ? 'नया कोड' : 'New ID'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenVoice}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors shadow-2xs"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-500" />
            <span>{language === 'hi' ? 'वॉयस निर्देश' : 'Audio Readout'}</span>
          </button>

          <button
            onClick={onFinalize}
            disabled={prescription.items.length === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
              prescription.items.length === 0
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20 active:scale-98'
            }`}
          >
            <Share2 className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{language === 'hi' ? 'पुष्ट करें और भेजें (PDF/WA)' : 'Deliver Prescription'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* 2. Patient Information Strip */}
        <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <User className="w-3.5 h-3.5 text-emerald-600" />
            <span>{language === 'hi' ? 'मरीज का विवरण (Patient Info)' : 'Patient Information'}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 text-xs">
            {/* Patient Name (4 cols) */}
            <div className="md:col-span-4">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                {language === 'hi' ? 'मरीज का नाम' : 'Patient Full Name'}
              </label>
              <input
                type="text"
                value={prescription.patient.name}
                onChange={(e) => handlePatientChange('name', e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Age (2 cols) */}
            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                {language === 'hi' ? 'उम्र (Age)' : 'Age (Yrs)'}
              </label>
              <input
                type="number"
                value={prescription.patient.age}
                onChange={(e) => handlePatientChange('age', parseInt(e.target.value) || 0)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Gender (2 cols) */}
            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                {language === 'hi' ? 'लिंग' : 'Gender'}
              </label>
              <select
                value={prescription.patient.gender}
                onChange={(e) => handlePatientChange('gender', e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Mobile (4 cols) */}
            <div className="md:col-span-4">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                {language === 'hi' ? 'व्हाट्सएप फोन नंबर' : 'Phone (for WhatsApp delivery)'}
              </label>
              <input
                type="text"
                value={prescription.patient.phone}
                onChange={(e) => handlePatientChange('phone', e.target.value)}
                placeholder="+91 98201 54321"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Diagnosis (7 cols) */}
            <div className="md:col-span-7">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                {language === 'hi' ? 'रोग निदान (Clinical Diagnosis)' : 'Clinical Diagnosis / Symptoms'}
              </label>
              <input
                type="text"
                value={prescription.patient.diagnosis}
                onChange={(e) => handlePatientChange('diagnosis', e.target.value)}
                placeholder="e.g. Acute Bronchitis & High Grade Fever"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs"
              />
            </div>

            {/* Known Allergies (5 cols) */}
            <div className="md:col-span-5">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                {language === 'hi' ? 'ज्ञात एलर्जी (Known Allergies)' : 'Known Patient Allergies'}
              </label>
              <input
                type="text"
                value={prescription.patient.known_allergies.join(', ')}
                onChange={(e) => handlePatientChange('known_allergies', e.target.value.split(',').map(s => s.trim()))}
                placeholder="Penicillin, Sulfa, NSAIDs..."
                className="w-full bg-white border border-amber-300 rounded-lg px-3 py-1.5 text-amber-900 bg-amber-50/40 focus:outline-none focus:border-amber-500 font-semibold"
              />
            </div>
          </div>
        </div>

        {/* 3. Safety Warnings Bar (if conflicts detected) */}
        {prescription.safety_warnings.length > 0 && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1.5 shadow-2xs">
            <div className="flex items-center gap-1.5 font-bold text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>{language === 'hi' ? 'चिकित्सीय सुरक्षा चेतावनी (Safety Alerts)' : 'Clinical Safety Warnings Detected'}</span>
            </div>
            {prescription.safety_warnings.map((w, idx) => (
              <p key={idx} className="m-0 text-[11px] leading-relaxed text-amber-800 pl-5">
                • {w}
              </p>
            ))}
          </div>
        )}

        {/* 4. Drag & Drop Medicine Items Canvas */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`rounded-2xl border-2 transition-all p-4 ${
            isDragOver
              ? 'border-emerald-500 bg-emerald-50/50 scale-[1.002]'
              : 'border-dashed border-slate-300 bg-white hover:border-slate-400'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 tracking-tight m-0">
                {language === 'hi' ? 'निर्धारित दवाएं (Rx Medicines)' : 'Prescribed Medicines'}
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {prescription.items.length}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 m-0 hidden sm:block">
              {language === 'hi' 
                ? '💡 कैटलॉग से दवा कार्ड यहाँ ड्रैग करके छोड़ें' 
                : '💡 Drag medicine card here or click (+) from catalog'}
            </p>
          </div>

          {prescription.items.length === 0 ? (
            <div className="py-12 text-center">
              <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700 m-0">
                {language === 'hi' ? 'प्रिस्क्रिप्शन पैड खाली है' : 'Prescription Pad is Empty'}
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto m-0">
                {language === 'hi'
                  ? 'बाईं ओर दवा कैटलॉग से किसी भी दवा को यहाँ ड्रैग करें या (+) पर क्लिक करें।'
                  : 'Drag and drop any medicine from the left catalog, or use the Safe OCR Scan to parse a clinic slip.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {prescription.items.map((item, index) => (
                <div
                  key={item.id}
                  className={`rounded-xl border p-4 transition-all shadow-xs ${
                    item.needs_doctor_confirmation
                      ? 'bg-amber-50/40 border-amber-300 ring-1 ring-amber-200'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Item Top Row */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-400 font-mono">
                          #{index + 1}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 tracking-tight m-0">
                          {item.medicine_name}
                        </h4>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium border border-slate-200">
                          {item.form} • {item.strength}
                        </span>

                        {item.needs_doctor_confirmation && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            CONFIRMATION REQUIRED (ZERO AI HALLUCINATION)
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 mt-0.5 m-0">
                        {item.generic_name}
                      </p>
                    </div>

                    <button
                      onClick={() => handleRemoveItem(index)}
                      className="text-slate-400 hover:text-red-600 transition-colors p-1"
                      title="Remove medicine"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Unclear OCR Flag Prompt */}
                  {item.needs_doctor_confirmation && (
                    <div className="mt-2.5 p-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between gap-2">
                      <p className="text-[11px] text-amber-800 m-0">
                        ⚠️ <strong>Safety Guardrail Active:</strong> OCR confidence was low or dosage scribbled. AI never invents dosages. Please confirm dosage below:
                      </p>
                      <button
                        onClick={() => handleConfirmItem(index)}
                        className="px-3 py-1 rounded-md text-[11px] font-bold bg-amber-600 hover:bg-amber-500 text-white transition-colors shrink-0 shadow-2xs"
                      >
                        Approve & Confirm
                      </button>
                    </div>
                  )}

                  {/* Item Settings Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mt-3 pt-3 border-t border-slate-200 text-xs items-end">
                    
                    {/* Dosage Field (3 cols) */}
                    <div className="md:col-span-3">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        {language === 'hi' ? 'खुराक (Dosage)' : 'Dosage'}
                      </label>
                      <input
                        type="text"
                        value={item.dosage}
                        onChange={(e) => handleItemChange(index, { dosage: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-semibold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    {/* Timing Matrix (M-A-E-N) (3 cols) */}
                    <div className="md:col-span-3">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        {language === 'hi' ? 'समय (Morning-Noon-Eve-Night)' : 'Intake Time Slots (M-A-E-N)'}
                      </label>
                      <div className="grid grid-cols-4 gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleItemChange(index, { morning: !item.morning })}
                          className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                            item.morning
                              ? 'bg-amber-500 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'
                          }`}
                          title="Morning (सुबह ~ 08:00 AM)"
                        >
                          M
                        </button>
                        <button
                          type="button"
                          onClick={() => handleItemChange(index, { afternoon: !item.afternoon })}
                          className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                            item.afternoon
                              ? 'bg-yellow-500 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'
                          }`}
                          title="Afternoon (दोपहर ~ 01:00 PM)"
                        >
                          A
                        </button>
                        <button
                          type="button"
                          onClick={() => handleItemChange(index, { evening: !item.evening })}
                          className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                            item.evening
                              ? 'bg-orange-500 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'
                          }`}
                          title="Evening (शाम ~ 06:00 PM)"
                        >
                          E
                        </button>
                        <button
                          type="button"
                          onClick={() => handleItemChange(index, { night: !item.night })}
                          className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                            item.night
                              ? 'bg-indigo-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'
                          }`}
                          title="Night (रात ~ 09:30 PM)"
                        >
                          N
                        </button>
                      </div>
                    </div>

                    {/* Meal Timing (3 cols) */}
                    <div className="md:col-span-3">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        {language === 'hi' ? 'भोजन के साथ संबंध' : 'Meal Relation'}
                      </label>
                      <select
                        value={item.timing_relation}
                        onChange={(e) => handleItemChange(index, { timing_relation: e.target.value as TimingRelation })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs"
                      >
                        {timingRelations.map(rel => (
                          <option key={rel.value} value={rel.value}>
                            {language === 'hi' ? rel.label_hi : rel.label_en}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Duration Stepper & Total Qty (3 cols) */}
                    <div className="md:col-span-3">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        {language === 'hi' ? 'अवधि और कुल मात्रा' : 'Duration & Total Qty'}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max="90"
                          value={item.duration_days}
                          onChange={(e) => handleItemChange(index, { duration_days: parseInt(e.target.value) || 1 })}
                          className="w-16 bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-slate-900 font-bold text-center focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        />
                        <span className="text-[11px] text-slate-600 font-medium whitespace-nowrap">
                          days = <strong className="text-emerald-700 font-bold">{item.total_quantity}</strong> qty
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bilingual Instruction Preview */}
                  <div className="mt-2.5 text-[11px] text-slate-600 flex flex-wrap items-center gap-4 bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <div>
                      <span className="text-slate-400 font-bold mr-1">EN:</span>
                      <span className="text-slate-700">{item.instructions_en}</span>
                    </div>
                    <div>
                      <span className="text-emerald-700 font-bold mr-1">हिन्दी:</span>
                      <span className="text-slate-700">{item.instructions_hi}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 5. Confirmed Schedule Component */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <MedicineSchedule
            schedule={prescription.schedule}
            language={language}
          />
        </div>

        {/* 6. Clinical Advice & Notes */}
        <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-200 text-xs shadow-2xs">
          <label className="block text-[11px] text-slate-700 mb-1 font-bold uppercase tracking-wider">
            {language === 'hi' ? 'विशेष चिकित्सीय निर्देश व सलाह' : 'Clinical Notes & Patient Advice'}
          </label>
          <textarea
            rows={2}
            value={prescription.notes || ''}
            onChange={(e) => onUpdatePrescription({ ...prescription, notes: e.target.value })}
            placeholder={
              language === 'hi'
                ? 'उदा. भरपूर गुनगुना पानी पिएं, कोर्स पूरा करें, 5 दिन बाद जांच कराएं...'
                : 'e.g. Drink warm fluids, complete full antibiotic course, return for checkup if symptoms persist...'
            }
            className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none font-medium"
          />
        </div>

      </div>

    </div>
  );
};
