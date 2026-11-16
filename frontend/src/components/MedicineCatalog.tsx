import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, X, Layers, Loader2, Database, ShieldCheck } from 'lucide-react';
import { Medicine } from '../types';
import { MedicineCard } from './MedicineCard';
import { CATEGORIES } from '../constants/mockData';
import { fetchMedicines } from '../services/api';

interface MedicineCatalogProps {
  medicines: Medicine[];
  onAddMedicine: (medicine: Medicine) => void;
  language: 'en' | 'hi';
}

export const MedicineCatalog: React.FC<MedicineCatalogProps> = ({
  medicines: initialMedicines,
  onAddMedicine,
  language
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedForm, setSelectedForm] = useState('All');
  const [displayedMedicines, setDisplayedMedicines] = useState<Medicine[]>(initialMedicines);
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const forms = ['All', 'Tablet', 'Capsule', 'Syrup', 'Inhaler'];

  // Trigger search on query or filter changes with 250ms debounce
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!searchQuery.trim() && selectedCategory === 'All' && selectedForm === 'All') {
      setDisplayedMedicines(initialMedicines);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const results = await fetchMedicines(searchQuery, selectedCategory, selectedForm);
        setDisplayedMedicines(results || []);
      } catch (err) {
        console.error('Error fetching live medicines:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, selectedCategory, selectedForm, initialMedicines]);

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      
      {/* Top Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 tracking-tight m-0">
              {language === 'hi' ? 'दवा कैटलॉग' : 'Medicine Catalog'}
            </h3>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
              {displayedMedicines.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80">
            <Database className="w-3 h-3 text-emerald-600" />
            <span>DrugSetu Live</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              language === 'hi'
                ? 'दवा खोजें (उदा. Dolo, Paracetamol, Metformin)...'
                : 'Search brand, generic, or salt across India (e.g. Dolo, Metformin)...'
            }
            className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-colors shadow-2xs"
          />
          {isSearching ? (
            <div className="absolute right-3 top-2.5 text-emerald-600 animate-spin">
              <Loader2 className="w-3.5 h-3.5" />
            </div>
          ) : searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.slice(0, 6).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-[11px] font-medium px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white font-semibold shadow-2xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Form Pills */}
        <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-0.5 scrollbar-none">
          {forms.map(form => (
            <button
              key={form}
              onClick={() => setSelectedForm(form)}
              className={`text-[10px] font-medium px-2 py-0.5 rounded-md whitespace-nowrap transition-colors ${
                selectedForm === form
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200/60'
              }`}
            >
              {form}
            </button>
          ))}
        </div>
      </div>

      {/* Cards List with Scroll */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50/30">
        {isSearching && displayedMedicines.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center p-6">
            <Loader2 className="w-7 h-7 text-emerald-600 animate-spin mb-2" />
            <p className="text-xs font-semibold text-slate-700 m-0">
              {language === 'hi' ? 'DrugSetu से दवाएं खोजी जा रही हैं...' : 'Querying DrugSetu National Formulary...'}
            </p>
          </div>
        ) : displayedMedicines.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center p-6">
            <Sparkles className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-xs font-semibold text-slate-700 m-0">
              {language === 'hi' ? 'कोई दवा नहीं मिली' : 'No medicines matched your search'}
            </p>
            <p className="text-[11px] text-slate-500 mt-1 m-0">
              {language === 'hi' ? 'कृपया अन्य नाम या सॉल्ट से खोजें' : 'Try searching for generic name or clear filters'}
            </p>
          </div>
        ) : (
          displayedMedicines.map(med => (
            <MedicineCard
              key={med.id}
              medicine={med}
              onAdd={onAddMedicine}
              language={language}
            />
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="px-3 py-2 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between text-[10px] text-slate-500">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>CDSCO & Indian Pharmacopoeia Aligned</span>
        </span>
        <span className="text-slate-400">DrugSetu v1.0</span>
      </div>

    </div>
  );
};
