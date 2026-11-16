import React from 'react';
import { 
  FileText, 
  Scan, 
  ShieldCheck, 
  Pill, 
  UserCheck, 
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { DoctorInfo } from '../types';

interface HeaderProps {
  doctor: DoctorInfo;
  activeTab: 'doctor' | 'pharmacist' | 'patient' | 'safety';
  setActiveTab: (tab: 'doctor' | 'pharmacist' | 'patient' | 'safety') => void;
  language: 'en' | 'hi';
  setLanguage: (lang: 'en' | 'hi') => void;
  onOpenOcr: () => void;
  onOpenVoice: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  doctor,
  activeTab,
  setActiveTab,
  language,
  setLanguage,
  onOpenOcr,
  onOpenVoice
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-6 py-2.5 shadow-xs">
      <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-600 text-white shadow-sm">
            <Pill className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-slate-900 m-0">SmartRx</h1>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Live v2
              </span>
            </div>
            <p className="text-[11px] text-slate-500 m-0 leading-tight">
              {language === 'hi' 
                ? 'स्मार्ट प्रिस्क्रिप्शन प्रबंधन'
                : 'Smart Prescription & Medicine Management System'}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('doctor')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'doctor'
                ? 'bg-white text-emerald-700 font-semibold shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            <span>{language === 'hi' ? 'डॉक्टर वर्कस्टेशन' : 'Doctor Workstation'}</span>
          </button>

          <button
            onClick={() => setActiveTab('pharmacist')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'pharmacist'
                ? 'bg-white text-emerald-700 font-semibold shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{language === 'hi' ? 'फार्मासिस्ट डिस्पेंस' : 'Pharmacist Dispense'}</span>
          </button>

          <button
            onClick={() => setActiveTab('patient')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'patient'
                ? 'bg-white text-emerald-700 font-semibold shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
            <span>{language === 'hi' ? 'मरीज पोर्टल' : 'Patient Portal'}</span>
          </button>

          <button
            onClick={() => setActiveTab('safety')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'safety'
                ? 'bg-white text-emerald-700 font-semibold shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{language === 'hi' ? 'सुरक्षा और ऑडिट' : 'Safety & Audit'}</span>
          </button>
        </nav>

        {/* Right Tools: Safe OCR, Voice Audio, Language & Doctor Details */}
        <div className="flex items-center gap-2.5">
          {/* Safe OCR Button */}
          <button
            onClick={onOpenOcr}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs"
            title="Scan handwritten or printed prescription with Zero-Hallucination Safe OCR"
          >
            <Scan className="w-3.5 h-3.5 text-emerald-600" />
            <span>{language === 'hi' ? 'सुरक्षित OCR स्कैन' : 'Safe OCR Scan'}</span>
          </button>

          {/* Voice Audio Button */}
          <button
            onClick={onOpenVoice}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs"
            title="Voice instructions for patients in Hindi & English"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{language === 'hi' ? 'वॉयस निर्देश' : 'Voice Audio'}</span>
          </button>

          {/* Language Switcher */}
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5 text-xs font-medium">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                language === 'en' 
                  ? 'bg-white text-emerald-700 font-bold shadow-2xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                language === 'hi' 
                  ? 'bg-white text-emerald-700 font-bold shadow-2xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              हिन्दी
            </button>
          </div>

          {/* Doctor Badge */}
          <div className="hidden xl:flex items-center gap-2.5 pl-3 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-xs font-bold text-emerald-700">
              {doctor.name.split(' ')[1]?.[0] || 'D'}
            </div>
            <div className="text-left text-xs leading-tight">
              <p className="font-semibold text-slate-800 m-0">{doctor.name}</p>
              <p className="text-[10px] text-slate-500 m-0">{doctor.reg_number}</p>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};
