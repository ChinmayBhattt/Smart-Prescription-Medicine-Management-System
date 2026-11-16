import { Prescription } from '../types';

export interface SpeechController {
  speak: (text: string, lang: 'hi-IN' | 'en-IN' | 'en-US', onStart?: () => void, onEnd?: () => void) => void;
  stop: () => void;
  isSpeaking: () => boolean;
}

export function generateSpokenHindiText(rx: Prescription): string {
  const parts: string[] = [
    `नमस्ते ${rx.patient.name} जी। डॉक्टर ${rx.doctor.name} द्वारा आपकी दवाओं के निर्देश इस प्रकार हैं।`
  ];

  const morningItems = rx.items.filter(i => i.morning);
  const afternoonItems = rx.items.filter(i => i.afternoon);
  const eveningItems = rx.items.filter(i => i.evening);
  const nightItems = rx.items.filter(i => i.night);

  if (morningItems.length > 0) {
    const list = morningItems.map(i => {
      const rel = i.timing_relation === 'AFTER_FOOD' ? 'भोजन के बाद' : (i.timing_relation === 'EMPTY_STOMACH' ? 'खाली पेट' : 'भोजन के साथ');
      const unit = i.form.toLowerCase().includes('syrup') ? 'चम्मच' : 'गोली';
      return `${i.medicine_name} की ${i.dosage} ${unit} ${rel}`;
    }).join(', और ');
    parts.push(`सुबह के समय: ${list} लें।`);
  }

  if (afternoonItems.length > 0) {
    const list = afternoonItems.map(i => {
      const rel = i.timing_relation === 'AFTER_FOOD' ? 'भोजन के बाद' : 'भोजन से पहले';
      const unit = i.form.toLowerCase().includes('syrup') ? 'चम्मच' : 'गोली';
      return `${i.medicine_name} की ${i.dosage} ${unit} ${rel}`;
    }).join(', और ');
    parts.push(`दोपहर के समय: ${list} लें।`);
  }

  if (eveningItems.length > 0) {
    const list = eveningItems.map(i => {
      return `${i.medicine_name} की ${i.dosage} शाम को लें।`;
    }).join(', और ');
    parts.push(`शाम को: ${list} लें।`);
  }

  if (nightItems.length > 0) {
    const list = nightItems.map(i => {
      const rel = i.timing_relation === 'BEDTIME' ? 'सोने से पहले' : 'रात के भोजन के बाद';
      const unit = i.form.toLowerCase().includes('syrup') ? 'चम्मच' : 'गोली';
      return `${i.medicine_name} की ${i.dosage} ${unit} ${rel}`;
    }).join(', और ');
    parts.push(`रात के समय: ${list} लें।`);
  }

  const duration = rx.items.length > 0 ? rx.items[0].duration_days : 5;
  parts.push(`कृपया यह दवा पूरे ${duration} दिनों तक नियमित रूप से लें। किसी भी असुविधा पर तुरंत डॉक्टर से संपर्क करें। स्वस्थ रहें।`);

  return parts.join(' ');
}

export function generateSpokenEnglishText(rx: Prescription): string {
  const parts: string[] = [
    `Hello ${rx.patient.name}. Here are your daily medicine instructions from Dr. ${rx.doctor.name}.`
  ];

  const morningItems = rx.items.filter(i => i.morning);
  const afternoonItems = rx.items.filter(i => i.afternoon);
  const nightItems = rx.items.filter(i => i.night);

  if (morningItems.length > 0) {
    const list = morningItems.map(i => {
      const rel = i.timing_relation.replace('_', ' ').toLowerCase();
      return `${i.medicine_name} ${i.dosage} ${rel}`;
    }).join(', and ');
    parts.push(`In the morning: Take ${list}.`);
  }

  if (afternoonItems.length > 0) {
    const list = afternoonItems.map(i => {
      const rel = i.timing_relation.replace('_', ' ').toLowerCase();
      return `${i.medicine_name} ${i.dosage} ${rel}`;
    }).join(', and ');
    parts.push(`In the afternoon: Take ${list}.`);
  }

  if (nightItems.length > 0) {
    const list = nightItems.map(i => {
      const rel = i.timing_relation.replace('_', ' ').toLowerCase();
      return `${i.medicine_name} ${i.dosage} ${rel}`;
    }).join(', and ');
    parts.push(`At night: Take ${list}.`);
  }

  parts.push('Please take your prescribed medicines with clean water and complete your course. Get well soon.');
  return parts.join(' ');
}

class SpeechService implements SpeechController {
  private synth: SpeechSynthesis | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  speak(text: string, lang: 'hi-IN' | 'en-IN' | 'en-US', onStart?: () => void, onEnd?: () => void): void {
    if (!this.synth) {
      console.warn('SpeechSynthesis is not supported in this browser.');
      return;
    }

    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.92; // Slightly calm and clear for elderly patients
    utterance.pitch = 1.0;

    // Find best matching voice
    const voices = this.synth.getVoices();
    const matchedVoice = voices.find(v => v.lang === lang || v.lang.startsWith(lang.slice(0, 2)));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    if (onStart) utterance.onstart = onStart;
    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    this.synth.speak(utterance);
  }

  stop(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  isSpeaking(): boolean {
    return this.synth ? this.synth.speaking : false;
  }
}

export const speechService = new SpeechService();
