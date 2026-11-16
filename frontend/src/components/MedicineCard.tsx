import React from 'react';
import { Plus, GripVertical, Pill, Droplet, Wind, ShieldAlert } from 'lucide-react';
import { Medicine } from '../types';

interface MedicineCardProps {
  medicine: Medicine;
  onAdd: (medicine: Medicine) => void;
  language: 'en' | 'hi';
}

export const MedicineCard: React.FC<MedicineCardProps> = ({ medicine, onAdd, language }) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify(medicine));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const getFormIcon = () => {
    switch (medicine.form) {
      case 'Syrup':
      case 'Drops':
        return <Droplet className="w-3.5 h-3.5 text-cyan-600" />;
      case 'Inhaler':
        return <Wind className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return <Pill className="w-3.5 h-3.5 text-emerald-600" />;
    }
  };

  const getFormBadgeColor = () => {
    switch (medicine.form) {
      case 'Capsule':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Syrup':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'Inhaler':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Drops':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="group relative bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-emerald-500 rounded-xl p-3 transition-all duration-150 cursor-grab active:cursor-grabbing shadow-xs hover:shadow-md select-none"
    >
      <div className="flex items-start justify-between gap-2.5">
        
        {/* Drag handle & Main details */}
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <div className="pt-0.5 text-slate-400 group-hover:text-emerald-600 transition-colors">
            <GripVertical className="w-4 h-4" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="text-xs font-bold text-slate-900 tracking-tight truncate group-hover:text-emerald-700 transition-colors m-0">
                {medicine.brand_name}
              </h4>
              <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                {medicine.strength}
              </span>
            </div>

            {/* Hindi Name if available */}
            {medicine.hindi_name && (
              <p className="text-[10px] text-emerald-700 font-medium mt-0.5 truncate m-0">
                {medicine.hindi_name}
              </p>
            )}

            {/* Generic composition */}
            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 m-0">
              {medicine.generic_name}
            </p>

            {/* Indications & Category tags */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${getFormBadgeColor()}`}>
                {getFormIcon()}
                <span>{medicine.form}</span>
              </span>

              {medicine.common_indications.slice(0, 2).map((ind, i) => (
                <span
                  key={i}
                  className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200"
                >
                  {ind}
                </span>
              ))}
            </div>

            {/* Contraindication alert pill if critical */}
            {medicine.contraindications.length > 0 && (
              <div className="flex items-center gap-1 mt-1.5 text-[10px] text-amber-700">
                <ShieldAlert className="w-3 h-3 text-amber-600 shrink-0" />
                <span className="truncate">Caution: {medicine.contraindications[0]}</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Add Button */}
        <button
          onClick={() => onAdd(medicine)}
          className="shrink-0 w-7 h-7 rounded-lg bg-slate-100 hover:bg-emerald-600 text-slate-600 hover:text-white flex items-center justify-center transition-all duration-150 border border-slate-200 hover:border-emerald-600"
          title={language === 'hi' ? 'प्रिस्क्रिप्शन में जोड़ें' : 'Add to Prescription'}
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
        </button>

      </div>
    </div>
  );
};
