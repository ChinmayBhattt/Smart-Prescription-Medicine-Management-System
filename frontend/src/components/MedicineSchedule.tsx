import React from 'react';
import { Sun, Sunset, Moon, Coffee, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { ConfirmedScheduleEntry } from '../types';

interface MedicineScheduleProps {
  schedule: ConfirmedScheduleEntry[];
  language: 'en' | 'hi';
}

export const MedicineSchedule: React.FC<MedicineScheduleProps> = ({ schedule, language }) => {
  const getSlotIcon = (slot: string) => {
    switch (slot) {
      case 'Morning':
        return <Coffee className="w-4 h-4 text-amber-600" />;
      case 'Afternoon':
        return <Sun className="w-4 h-4 text-yellow-600" />;
      case 'Evening':
        return <Sunset className="w-4 h-4 text-orange-600" />;
      case 'Night':
        return <Moon className="w-4 h-4 text-indigo-600" />;
      default:
        return <Clock className="w-4 h-4 text-emerald-600" />;
    }
  };

  const getSlotColorTheme = (slot: string) => {
    switch (slot) {
      case 'Morning':
        return {
          border: 'border-amber-200',
          headerBg: 'bg-amber-50/80',
          pill: 'bg-amber-100 text-amber-800 border-amber-300'
        };
      case 'Afternoon':
        return {
          border: 'border-yellow-200',
          headerBg: 'bg-yellow-50/80',
          pill: 'bg-yellow-100 text-yellow-800 border-yellow-300'
        };
      case 'Evening':
        return {
          border: 'border-orange-200',
          headerBg: 'bg-orange-50/80',
          pill: 'bg-orange-100 text-orange-800 border-orange-300'
        };
      case 'Night':
        return {
          border: 'border-indigo-200',
          headerBg: 'bg-indigo-50/80',
          pill: 'bg-indigo-100 text-indigo-800 border-indigo-300'
        };
      default:
        return {
          border: 'border-slate-200',
          headerBg: 'bg-slate-50',
          pill: 'bg-slate-100 text-slate-800 border-slate-300'
        };
    }
  };

  if (!schedule || schedule.length === 0) {
    return (
      <div className="p-6 text-center rounded-xl bg-slate-50 border border-slate-200">
        <Clock className="w-6 h-6 text-slate-400 mx-auto mb-2" />
        <p className="text-xs font-medium text-slate-600 m-0">
          {language === 'hi'
            ? 'प्रिस्क्रिप्शन में दवाएं जोड़ें और समय चुनें, समय-सारणी यहां स्वतः बनेगी।'
            : 'Add medicines and set intake time slots above to see the confirmed chronological schedule.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 m-0">
            {language === 'hi' ? 'पुष्ट दैनिक खुराक समय-सारणी' : 'Confirmed Daily Intake Schedule'}
          </h4>
        </div>
        <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          {language === 'hi' ? 'डॉक्टर द्वारा सत्यापित' : 'Doctor-Verified Only'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {schedule.map((entry, idx) => {
          const theme = getSlotColorTheme(entry.time_slot);
          return (
            <div
              key={idx}
              className={`rounded-xl border ${theme.border} bg-white shadow-2xs overflow-hidden flex flex-col justify-between`}
            >
              <div>
                {/* Header */}
                <div className={`p-3 border-b ${theme.border} ${theme.headerBg} flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-lg bg-white border border-slate-200 shadow-2xs">
                      {getSlotIcon(entry.time_slot)}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 tracking-tight m-0">
                        {language === 'hi' ? entry.time_label_hi : entry.time_slot}
                      </h5>
                      <span className="text-[10px] text-slate-500 font-mono font-medium">
                        {entry.approx_time}
                      </span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${theme.pill}`}>
                    {entry.medicines.length} {language === 'hi' ? 'दवा' : 'Meds'}
                  </span>
                </div>

                {/* Medicines in this slot */}
                <div className="p-3 space-y-2">
                  {entry.medicines.map((med, mIdx) => (
                    <div
                      key={mIdx}
                      className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-200 text-xs shadow-2xs"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-slate-900 truncate">
                          {med.medicine_name}
                        </span>
                        <span className="font-bold text-emerald-700 text-xs shrink-0">
                          {med.dosage}
                        </span>
                      </div>

                      <p className="text-[10px] text-slate-500 truncate m-0 mt-0.5">
                        {med.form} • {med.strength}
                      </p>

                      <div className="mt-1.5 flex items-center justify-between text-[10px]">
                        <span className="text-slate-700 font-semibold bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                          {language === 'hi' ? med.relation_hi : med.relation_en}
                        </span>
                        <span className="text-slate-500 font-mono font-medium">
                          {med.duration_days} days
                        </span>
                      </div>

                      {med.is_unconfirmed && (
                        <div className="mt-1.5 flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 p-1 rounded border border-amber-200">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>Pending Confirmation</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-2 border-t border-slate-100 text-[10px] text-slate-500 text-center bg-slate-50/50">
                {language === 'hi' ? 'ताजे पानी के साथ लें' : 'Take with clean water'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
