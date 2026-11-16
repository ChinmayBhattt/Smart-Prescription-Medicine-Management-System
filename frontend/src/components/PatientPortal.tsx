import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Volume2, 
  FileDown, 
  CheckCircle2, 
  Clock, 
  Coffee, 
  Sun, 
  Sunset, 
  Moon, 
  Check 
} from 'lucide-react';
import { Prescription } from '../types';
import { generatePrescriptionPDF } from '../services/pdfGenerator';
import { speechService, generateSpokenHindiText, generateSpokenEnglishText } from '../services/speechService';

interface PatientPortalProps {
  initialPrescription: Prescription;
  language: 'en' | 'hi';
}

export const PatientPortal: React.FC<PatientPortalProps> = ({
  initialPrescription,
  language
}) => {
  const [prescription] = useState<Prescription>(initialPrescription);
  const [adherence, setAdherence] = useState<{ [key: string]: boolean }>({});
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioLang] = useState<'hi' | 'en'>(language);

  const toggleTaken = (key: string) => {
    const nextState = !adherence[key];
    setAdherence(prev => ({ ...prev, [key]: nextState }));
    if (nextState) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 }
      });
    }
  };

  const handlePlayVoice = () => {
    if (isPlayingAudio) {
      speechService.stop();
      setIsPlayingAudio(false);
    } else {
      const text = audioLang === 'hi' 
        ? generateSpokenHindiText(prescription) 
        : generateSpokenEnglishText(prescription);
      
      speechService.speak(
        text,
        audioLang === 'hi' ? 'hi-IN' : 'en-IN',
        () => setIsPlayingAudio(true),
        () => setIsPlayingAudio(false)
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 text-xs">
      
      {/* Patient Welcome Hero */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold mb-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Official Digital Prescription Verified</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight m-0">
              {language === 'hi' ? `नमस्ते, ${prescription.patient.name}` : `Hello, ${prescription.patient.name}`}
            </h2>
            <p className="text-slate-500 text-xs mt-1 m-0">
              {prescription.doctor.clinic_hospital} • {prescription.doctor.name}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayVoice}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all shadow-xs ${
                isPlayingAudio
                  ? 'bg-red-600 text-white'
                  : 'bg-amber-500 hover:bg-amber-400 text-white'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>{isPlayingAudio ? 'Stop Audio' : (audioLang === 'hi' ? 'दवा निर्देश सुनें' : 'Listen in English')}</span>
            </button>

            <button
              onClick={() => generatePrescriptionPDF(prescription)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold transition-all border border-slate-300 shadow-2xs"
            >
              <FileDown className="w-4 h-4 text-emerald-600" />
              <span>PDF Receipt</span>
            </button>
          </div>
        </div>
      </div>

      {/* Patient Timeline / Daily Intake Schedule */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 tracking-tight m-0">
              {language === 'hi' ? 'दवा लेने का समय और चेकलिस्ट' : 'Today\'s Medicine Schedule & Adherence Tracker'}
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            {language === 'hi' ? 'दवा लेने के बाद टिक करें' : 'Check off medicines after taking'}
          </span>
        </div>

        {/* 4 Time Slots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          
          {/* Morning Slot */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-amber-200/60">
              <div className="flex items-center gap-2">
                <Coffee className="w-4 h-4 text-amber-600" />
                <h4 className="font-bold text-slate-900 text-xs m-0">
                  {language === 'hi' ? 'सुबह (Morning)' : 'Morning'}
                </h4>
              </div>
              <span className="text-[10px] font-mono text-amber-800 font-bold">08:00 AM</span>
            </div>

            {prescription.items.filter(i => i.morning).length === 0 ? (
              <p className="text-[11px] text-slate-400 m-0 italic">No morning medicines prescribed.</p>
            ) : (
              prescription.items.filter(i => i.morning).map((m, idx) => {
                const k = `m-${m.id}`;
                return (
                  <div key={idx} className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs flex items-center justify-between gap-2">
                    <div>
                      <strong className="text-slate-900 text-xs block">{m.medicine_name}</strong>
                      <span className="text-[10px] text-slate-600 font-medium">
                        {m.dosage} • {language === 'hi' ? m.instructions_hi : m.instructions_en}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleTaken(k)}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                        adherence[k] 
                          ? 'bg-emerald-600 text-white shadow-2xs' 
                          : 'bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 border border-slate-200'
                      }`}
                      title="Mark as taken"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Afternoon Slot */}
          <div className="p-4 rounded-xl border border-yellow-200 bg-yellow-50/40 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-yellow-200/60">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-yellow-600" />
                <h4 className="font-bold text-slate-900 text-xs m-0">
                  {language === 'hi' ? 'दोपहर (Afternoon)' : 'Afternoon'}
                </h4>
              </div>
              <span className="text-[10px] font-mono text-yellow-800 font-bold">01:00 PM</span>
            </div>

            {prescription.items.filter(i => i.afternoon).length === 0 ? (
              <p className="text-[11px] text-slate-400 m-0 italic">No afternoon medicines prescribed.</p>
            ) : (
              prescription.items.filter(i => i.afternoon).map((m, idx) => {
                const k = `a-${m.id}`;
                return (
                  <div key={idx} className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs flex items-center justify-between gap-2">
                    <div>
                      <strong className="text-slate-900 text-xs block">{m.medicine_name}</strong>
                      <span className="text-[10px] text-slate-600 font-medium">
                        {m.dosage} • {language === 'hi' ? m.instructions_hi : m.instructions_en}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleTaken(k)}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                        adherence[k] 
                          ? 'bg-emerald-600 text-white shadow-2xs' 
                          : 'bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 border border-slate-200'
                      }`}
                      title="Mark as taken"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Evening Slot */}
          <div className="p-4 rounded-xl border border-orange-200 bg-orange-50/40 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-orange-200/60">
              <div className="flex items-center gap-2">
                <Sunset className="w-4 h-4 text-orange-600" />
                <h4 className="font-bold text-slate-900 text-xs m-0">
                  {language === 'hi' ? 'शाम (Evening)' : 'Evening'}
                </h4>
              </div>
              <span className="text-[10px] font-mono text-orange-800 font-bold">06:00 PM</span>
            </div>

            {prescription.items.filter(i => i.evening).length === 0 ? (
              <p className="text-[11px] text-slate-400 m-0 italic">No evening medicines prescribed.</p>
            ) : (
              prescription.items.filter(i => i.evening).map((m, idx) => {
                const k = `e-${m.id}`;
                return (
                  <div key={idx} className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs flex items-center justify-between gap-2">
                    <div>
                      <strong className="text-slate-900 text-xs block">{m.medicine_name}</strong>
                      <span className="text-[10px] text-slate-600 font-medium">
                        {m.dosage} • {language === 'hi' ? m.instructions_hi : m.instructions_en}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleTaken(k)}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                        adherence[k] 
                          ? 'bg-emerald-600 text-white shadow-2xs' 
                          : 'bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 border border-slate-200'
                      }`}
                      title="Mark as taken"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Night Slot */}
          <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-indigo-200/60">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-indigo-600" />
                <h4 className="font-bold text-slate-900 text-xs m-0">
                  {language === 'hi' ? 'रात (Night)' : 'Night'}
                </h4>
              </div>
              <span className="text-[10px] font-mono text-indigo-800 font-bold">09:30 PM</span>
            </div>

            {prescription.items.filter(i => i.night).length === 0 ? (
              <p className="text-[11px] text-slate-400 m-0 italic">No night medicines prescribed.</p>
            ) : (
              prescription.items.filter(i => i.night).map((m, idx) => {
                const k = `n-${m.id}`;
                return (
                  <div key={idx} className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs flex items-center justify-between gap-2">
                    <div>
                      <strong className="text-slate-900 text-xs block">{m.medicine_name}</strong>
                      <span className="text-[10px] text-slate-600 font-medium">
                        {m.dosage} • {language === 'hi' ? m.instructions_hi : m.instructions_en}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleTaken(k)}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                        adherence[k] 
                          ? 'bg-emerald-600 text-white shadow-2xs' 
                          : 'bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 border border-slate-200'
                      }`}
                      title="Mark as taken"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

        </div>
      </div>

      {/* Doctor Clinical Advice Card */}
      {prescription.notes && (
        <div className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-700 shadow-xs">
          <strong className="text-slate-900 block mb-1">Doctor's Advice:</strong>
          <p className="m-0 text-slate-600 leading-relaxed font-medium">{prescription.notes}</p>
        </div>
      )}

    </div>
  );
};
