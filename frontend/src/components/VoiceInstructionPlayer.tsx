import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  Square, 
  X, 
  Play, 
  Mic 
} from 'lucide-react';
import { Prescription } from '../types';
import { 
  speechService, 
  generateSpokenHindiText, 
  generateSpokenEnglishText 
} from '../services/speechService';

interface VoiceInstructionPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  prescription: Prescription;
  language: 'en' | 'hi';
}

export const VoiceInstructionPlayer: React.FC<VoiceInstructionPlayerProps> = ({
  isOpen,
  onClose,
  prescription,
  language: defaultLang
}) => {
  const [selectedLang, setSelectedLang] = useState<'hi-IN' | 'en-IN'>(defaultLang === 'hi' ? 'hi-IN' : 'en-IN');
  const [isPlaying, setIsPlaying] = useState(false);
  const [spokenText, setSpokenText] = useState('');

  useEffect(() => {
    if (selectedLang === 'hi-IN') {
      setSpokenText(generateSpokenHindiText(prescription));
    } else {
      setSpokenText(generateSpokenEnglishText(prescription));
    }
  }, [selectedLang, prescription]);

  useEffect(() => {
    return () => {
      speechService.stop();
    };
  }, []);

  if (!isOpen) return null;

  const handleTogglePlay = () => {
    if (isPlaying) {
      speechService.stop();
      setIsPlaying(false);
    } else {
      speechService.speak(
        spokenText,
        selectedLang,
        () => setIsPlaying(true),
        () => setIsPlaying(false)
      );
    }
  };

  const handleClose = () => {
    speechService.stop();
    setIsPlaying(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight m-0">
                {defaultLang === 'hi' ? 'वॉयस दवा निर्देश (Voice Assistant)' : 'Patient Audio Prescription Readout'}
              </h3>
              <p className="text-[11px] text-slate-500 m-0">
                Accessible Voice Instructions for Patients
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs">
          
          {/* Animated Waveform Visualizer */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center">
            
            {/* Voice Avatar */}
            <div className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all ${
              isPlaying
                ? 'bg-emerald-100 text-emerald-700 ring-8 ring-emerald-50 scale-105'
                : 'bg-white text-slate-400 border border-slate-200 shadow-xs'
            }`}>
              <Volume2 className="w-7 h-7" />
              {isPlaying && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              )}
            </div>

            {/* Audio Wave Bars */}
            <div className="flex items-center gap-1.5 h-10 mt-5">
              {[40, 75, 55, 90, 65, 80, 45, 95, 60, 85, 50, 70].map((h, i) => (
                <span
                  key={i}
                  className={`w-1.5 rounded-full transition-all duration-150 ${
                    isPlaying
                      ? 'bg-emerald-600 animate-pulse'
                      : 'bg-slate-300'
                  }`}
                  style={{
                    height: isPlaying ? `${Math.max(12, Math.round(h * Math.random()))}px` : '6px',
                    animationDelay: `${i * 0.08}s`
                  }}
                />
              ))}
            </div>

            <p className="text-xs font-bold text-slate-700 mt-3 m-0">
              {isPlaying ? 'Speaking clearly for patient...' : 'Ready to narrate confirmed instructions'}
            </p>
          </div>

          {/* Voice Language Toggle */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-700 pl-1">Select Voice Language:</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => {
                  speechService.stop();
                  setIsPlaying(false);
                  setSelectedLang('en-IN');
                }}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                  selectedLang === 'en-IN'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                English (Indian Accent)
              </button>
              <button
                onClick={() => {
                  speechService.stop();
                  setIsPlaying(false);
                  setSelectedLang('hi-IN');
                }}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                  selectedLang === 'hi-IN'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                हिन्दी (Hindi Audio)
              </button>
            </div>
          </div>

          {/* Spoken Text Transcript Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Spoken Narration Transcript:
            </label>
            <p className="text-xs text-slate-700 leading-relaxed m-0 italic bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
              "{spokenText}"
            </p>
          </div>

          {/* Play/Stop Button */}
          <button
            onClick={handleTogglePlay}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs transition-all shadow-sm ${
              isPlaying
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/20'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
            }`}
          >
            {isPlaying ? (
              <>
                <Square className="w-4 h-4 fill-current" />
                <span>Stop Voice Narration</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Play Voice Instructions Now</span>
              </>
            )}
          </button>

        </div>

      </div>
    </div>
  );
};
