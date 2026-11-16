import React, { useState } from 'react';
import { 
  X, 
  Scan, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck
} from 'lucide-react';
import { OCRScanResult, PrescriptionItem } from '../types';
import { runOcrScan } from '../services/api';

interface OCRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyMedicines: (items: Partial<PrescriptionItem>[]) => void;
  language: 'en' | 'hi';
}

export const OCRScannerModal: React.FC<OCRScannerModalProps> = ({
  isOpen,
  onClose,
  onApplyMedicines,
  language
}) => {
  const [selectedScenario, setSelectedScenario] = useState('handwritten_illegible_dosage');
  const [isLoading, setIsLoading] = useState(false);
  const [scanResult, setScanResult] = useState<OCRScanResult | null>(null);

  if (!isOpen) return null;

  const handleScan = async () => {
    setIsLoading(true);
    try {
      const result = await runOcrScan(selectedScenario);
      setScanResult(result);
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (scanResult && scanResult.detected_medicines.length > 0) {
      onApplyMedicines(scanResult.detected_medicines);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Scan className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight m-0">
                {language === 'hi' ? 'सुरक्षित प्रिस्क्रिप्शन OCR स्कैनर' : 'Zero-Hallucination Safe OCR Scanner'}
              </h3>
              <p className="text-[11px] text-emerald-700 font-semibold m-0">
                AI Hallucination Strictly Prohibited • Text Extracted Only When Clear
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          
          {/* Policy Banner */}
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-emerald-900 m-0">
                {language === 'hi' ? 'सख्त सुरक्षा नीति (Zero-AI-Hallucination)' : 'Strict Clinical Safety Rule'}
              </h4>
              <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed m-0">
                {language === 'hi'
                  ? 'यह प्रणाली केवल स्पष्ट अक्षरों को निकालती है और कभी भी खुराक (dosage) का अनुमान नहीं लगाती। अस्पष्ट लिखावट को डॉक्टर द्वारा पुष्टि के लिए ध्वजांकित (flag) किया जाता है।'
                  : 'This OCR engine parses strictly verified pharmaceutical text. It is programmatically prohibited from guessing or hallucinating missing dosages. Any ambiguous line requires explicit doctor sign-off.'}
              </p>
            </div>
          </div>

          {/* Test Preset Scenarios Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              {language === 'hi' ? 'परीक्षण हेतु प्रिस्क्रिप्शन पर्ची चुनें' : 'Select Prescription Slip Test Scenario'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedScenario('handwritten_illegible_dosage')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedScenario === 'handwritten_illegible_dosage'
                    ? 'border-amber-400 bg-amber-50/70 text-slate-900 shadow-2xs ring-1 ring-amber-300'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-amber-900 text-xs">Handwritten / Illegible Slip</span>
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold border border-amber-300">Safety Hold</span>
                </div>
                <p className="text-[11px] text-slate-600 m-0">
                  Line 2 has illegible doctor scribble. Tests zero-hallucination guardrail.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedScenario('clean_typed_prescription')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedScenario === 'clean_typed_prescription'
                    ? 'border-emerald-400 bg-emerald-50/70 text-slate-900 shadow-2xs ring-1 ring-emerald-300'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-emerald-900 text-xs">Clean Hospital Printout</span>
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">98% Match</span>
                </div>
                <p className="text-[11px] text-slate-600 m-0">
                  Crisp typed slip with 3 medicines and unambiguous 1-0-1 dosages.
                </p>
              </button>
            </div>
          </div>

          {/* Trigger Scan Button */}
          <div className="flex justify-center pt-1">
            <button
              onClick={handleScan}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-sm"
            >
              <Scan className="w-4 h-4 stroke-[2.5]" />
              <span>{isLoading ? 'Processing OCR Safely...' : 'Run Safe Text Extraction'}</span>
            </button>
          </div>

          {/* Scan Results Display */}
          {scanResult && (
            <div className="space-y-3 pt-3 border-t border-slate-200">
              
              {/* Confidence & Flag Meter */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-slate-600 text-[11px]">OCR Extraction Confidence: </span>
                  <strong className={`font-mono text-sm ${
                    scanResult.overall_confidence > 0.8 ? 'text-emerald-700' : 'text-amber-700'
                  }`}>
                    {(scanResult.overall_confidence * 100).toFixed(1)}%
                  </strong>
                </div>

                {scanResult.flagged_for_confirmation ? (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-300">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    FLAGGED: DOCTOR CONFIRMATION REQUIRED
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ALL DOSAGES VERIFIED
                  </span>
                )}
              </div>

              {/* Unclear lines warnings */}
              {scanResult.unclear_lines.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                  <p className="font-bold text-xs mb-1 text-amber-800">
                    ⚠️ The following lines could not be read safely and were NOT hallucinated:
                  </p>
                  {scanResult.unclear_lines.map((l, i) => (
                    <p key={i} className="text-[11px] m-0 pl-2">• {l}</p>
                  ))}
                </div>
              )}

              {/* Detected Items Grid */}
              <div>
                <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Extracted Medications ({scanResult.detected_medicines.length}):
                </h5>

                <div className="space-y-2">
                  {scanResult.detected_medicines.map((m, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                        m.needs_doctor_confirmation
                          ? 'bg-amber-50/60 border-amber-300'
                          : 'bg-white border-slate-200 shadow-2xs'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-slate-900 text-xs">{m.medicine_name}</strong>
                          <span className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            {m.form} • {m.strength}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 m-0 mt-0.5">{m.generic_name}</p>
                        {m.safety_notes && (
                          <p className="text-[10px] text-amber-800 font-semibold mt-1 m-0">
                            {m.safety_notes}
                          </p>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`text-xs font-bold ${
                          m.needs_doctor_confirmation ? 'text-amber-800' : 'text-emerald-700'
                        }`}>
                          {m.dosage}
                        </span>
                        <p className="text-[10px] text-slate-500 m-0">
                          {m.duration_days ? `${m.duration_days} days` : 'Needs duration'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleApply}
            disabled={!scanResult || scanResult.detected_medicines.length === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
              !scanResult || scanResult.detected_medicines.length === 0
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
            }`}
          >
            <span>Import Confirmed Items to Prescription</span>
          </button>
        </div>

      </div>
    </div>
  );
};
