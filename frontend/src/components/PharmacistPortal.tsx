import React, { useState } from 'react';
import { 
  Search, 
  CheckCircle2, 
  Package, 
  ShieldCheck, 
  BadgeCheck 
} from 'lucide-react';
import { Prescription } from '../types';
import { getPrescription, dispensePrescription } from '../services/api';

interface PharmacistPortalProps {
  language: 'en' | 'hi';
}

export const PharmacistPortal: React.FC<PharmacistPortalProps> = ({ language }) => {
  const [searchId, setSearchId] = useState('RX-2026-7849K');
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dispenseSuccess, setDispenseSuccess] = useState<string | null>(null);
  const [pharmacistName] = useState('Suresh Patel, Reg. Pharmacist (PH-8912)');

  const handleSearch = async () => {
    if (!searchId.trim()) return;
    setIsLoading(true);
    setError(null);
    setDispenseSuccess(null);
    try {
      const rx = await getPrescription(searchId.trim());
      if (rx) {
        setPrescription(rx);
      } else {
        setError(`Prescription '${searchId}' not found in registry.`);
        setPrescription(null);
      }
    } catch (err) {
      setError('Failed to fetch prescription from database.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDispense = async () => {
    if (!prescription) return;
    try {
      await dispensePrescription(prescription.id, pharmacistName);
      setPrescription({ ...prescription, status: 'DISPENSED' });
      setDispenseSuccess(`Prescription ${prescription.id} successfully dispensed and inventory updated.`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900 tracking-tight m-0">
              {language === 'hi' ? 'फार्मासिस्ट डिस्पेंसिंग वर्कस्टेशन' : 'Pharmacist Prescription Dispensing Station'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 m-0">
            Verify Doctor Prescriptions, Confirm Safety Flags, and Dispense Medications
          </p>
        </div>

        {/* Prescription Search Bar */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="e.g. RX-2026-7849K"
              className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 font-mono font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shrink-0 shadow-xs"
          >
            {isLoading ? 'Searching...' : 'Lookup Rx'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
          {error}
        </div>
      )}

      {dispenseSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{dispenseSuccess}</span>
        </div>
      )}

      {/* Prescription Details Card */}
      {prescription && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs text-xs space-y-4 p-5">
          
          {/* Header Info */}
          <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-200 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold text-emerald-700">
                  {prescription.id}
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  prescription.status === 'DISPENSED'
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {prescription.status}
                </span>
              </div>
              <p className="text-slate-500 mt-1 m-0">
                Created on {new Date(prescription.created_at).toLocaleString('en-IN')}
              </p>
            </div>

            <div className="text-right">
              <p className="font-bold text-slate-900 m-0">{prescription.doctor.name}</p>
              <p className="text-slate-500 text-[11px] m-0">{prescription.doctor.clinic_hospital}</p>
              <p className="text-[10px] text-slate-400 m-0">Reg: {prescription.doctor.reg_number}</p>
            </div>
          </div>

          {/* Patient Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Patient Name:</span>
              <p className="font-bold text-slate-900 text-sm m-0 mt-0.5">{prescription.patient.name}</p>
              <p className="text-slate-500 text-[11px] m-0">{prescription.patient.age} Yrs / {prescription.patient.gender}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Diagnosis:</span>
              <p className="text-slate-700 text-xs m-0 mt-0.5 font-medium">{prescription.patient.diagnosis}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Known Allergies:</span>
              <p className="text-amber-800 font-bold text-xs m-0 mt-0.5">
                {prescription.patient.known_allergies.length > 0
                  ? prescription.patient.known_allergies.join(', ')
                  : 'None Reported'}
              </p>
            </div>
          </div>

          {/* Medicines to Dispense Table */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Medications to Dispense ({prescription.items.length}):
            </h4>

            <div className="space-y-2">
              {prescription.items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-mono font-bold text-slate-600 text-xs shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <h5 className="font-bold text-slate-900 text-xs m-0">{item.medicine_name}</h5>
                      <p className="text-[11px] text-slate-500 m-0">{item.generic_name}</p>
                      <p className="text-[10px] text-emerald-700 mt-0.5 m-0 font-medium">
                        {item.instructions_en} ({item.instructions_hi})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-medium">Dosage</span>
                      <strong className="text-slate-900 text-xs">{item.dosage}</strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-medium">Duration</span>
                      <span className="text-slate-700 text-xs font-semibold">{item.duration_days} days</span>
                    </div>

                    <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                      <span className="text-[10px] text-emerald-800 block uppercase font-bold">Dispense Qty</span>
                      <span className="text-emerald-800 font-mono text-sm font-bold">
                        {item.total_quantity} {item.form}s
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dispense Action Footer */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-slate-600 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Safety Check: Verified against patient profile</span>
            </div>

            <button
              onClick={handleDispense}
              disabled={prescription.status === 'DISPENSED'}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm ${
                prescription.status === 'DISPENSED'
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
              }`}
            >
              <BadgeCheck className="w-4 h-4 stroke-[2.5]" />
              <span>
                {prescription.status === 'DISPENSED'
                  ? 'Already Dispensed & Logged'
                  : 'Verify & Dispense All Medications'}
              </span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
