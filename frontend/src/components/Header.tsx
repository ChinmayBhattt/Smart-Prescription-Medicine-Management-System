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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 lg:px-8 h-16 shadow-2xs">
      <div className="max-w-[1700px] h-full mx-auto flex items-center justify-between gap-6">
        
        {/* 1. Left: Clean Uncluttered Brand Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-600 text-white shadow-xs">
            <Pill className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-extrabold tracking-tight text-slate-900">SmartRx</span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              Clinic
            </span>
          </div>
        </div>

        {/* 2. Center: Spacious, Decongested Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
          <button
            onClick={() => setActiveTab('doctor')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'doctor'
                ? 'bg-white text-emerald-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'डॉक्टर वर्कस्टेशन' : 'Doctor Pad'}</span>
          </button>

          <button
            onClick={() => setActiveTab('pharmacist')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'pharmacist'
                ? 'bg-white text-emerald-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'फार्मेसी' : 'Pharmacy'}</span>
          </button>

          <button
            onClick={() => setActiveTab('patient')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'patient'
                ? 'bg-white text-emerald-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'मरीज पोर्टल' : 'Patient Portal'}</span>
          </button>

          <button
            onClick={() => setActiveTab('safety')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'safety'
                ? 'bg-white text-emerald-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'सुरक्षा ऑडिट' : 'Safety Audit'}</span>
          </button>
        </nav>

        {/* 3. Right: Cleanly Spaced Utility Controls & Doctor Profile */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenOcr}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs"
              title="Scan prescription slip with Zero-Hallucination Safe OCR"
            >
              <Scan className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'hi' ? 'OCR स्कैन' : 'OCR Scan'}</span>
            </button>

            <button
              onClick={onOpenVoice}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs"
              title="Voice audio readout in Hindi & English"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{language === 'hi' ? 'वॉयस' : 'Audio'}</span>
            </button>
          </div>

          <div className="h-5 w-[1px] bg-slate-200 mx-0.5" />

          {/* Minimalist Language Switcher */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                language === 'en' 
                  ? 'bg-white text-emerald-700 shadow-2xs' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                language === 'hi' 
                  ? 'bg-white text-emerald-700 shadow-2xs' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              हिन्दी
            </button>
          </div>

          {/* Doctor Profile Pill */}
          <div className="hidden xl:flex items-center gap-2.5 pl-2">
            <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-xs font-bold text-emerald-700 shadow-2xs">
              {doctor.name.split(' ')[1]?.[0] || 'D'}
            </div>
            <div className="text-left text-xs leading-tight">
              <p className="font-bold text-slate-900 m-0">{doctor.name}</p>
              <p className="text-[10px] text-slate-500 m-0 font-medium">{doctor.reg_number}</p>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};
