import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  Send, 
  Mail, 
  FileDown, 
  QrCode, 
  CheckCircle2, 
  MessageSquare, 
  Copy, 
  Check 
} from 'lucide-react';
import { Prescription } from '../types';
import { generatePrescriptionPDF } from '../services/pdfGenerator';
import { deliverPrescription } from '../services/api';

interface DeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  prescription: Prescription;
  language: 'en' | 'hi';
}

export const DeliveryModal: React.FC<DeliveryModalProps> = ({
  isOpen,
  onClose,
  prescription,
  language
}) => {
  const [activeChannel, setActiveChannel] = useState<'whatsapp' | 'email' | 'pdf' | 'qr'>('whatsapp');
  const [phone, setPhone] = useState(prescription.patient.phone || '');
  const [email, setEmail] = useState(prescription.patient.email || '');
  const [deliveryLanguage, setDeliveryLanguage] = useState<'hi' | 'en'>(language);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPhone(prescription.patient.phone || '');
      setEmail(prescription.patient.email || '');
      setSuccessMessage(null);

      const verifyUrl = prescription.qr_code_data || `https://smartrx.hospital/patient/${prescription.id}`;
      QRCode.toDataURL(verifyUrl, { width: 220, margin: 1 })
        .then(url => setQrDataUrl(url))
        .catch(err => console.error(err));
    }
  }, [isOpen, prescription]);

  if (!isOpen) return null;

  const patientUrl = `https://smartrx.hospital/patient/${prescription.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(patientUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSendWhatsApp = async () => {
    setIsSending(true);
    try {
      await deliverPrescription('whatsapp', prescription.id, phone, deliveryLanguage);
      
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const text = deliveryLanguage === 'hi'
        ? `🏥 *डिजिटल प्रिस्क्रिप्शन (Digital Rx):* ${prescription.id}\n*मरीज:* ${prescription.patient.name}\n*दवाएं और समय सारणी यहाँ देखें:*\n${patientUrl}`
        : `🏥 *Digital Prescription:* ${prescription.id}\n*Patient:* ${prescription.patient.name}\n*View verified medicines & schedule:*\n${patientUrl}`;
      
      const waUrl = `https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}?text=${encodeURIComponent(text)}`;
      window.open(waUrl, '_blank');
      setSuccessMessage('WhatsApp click-to-chat opened and dispatch payload prepared!');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendEmail = async () => {
    setIsSending(true);
    try {
      await deliverPrescription('email', prescription.id, email, deliveryLanguage);
      setSuccessMessage(`Official prescription receipt emailed via Resend to ${email}!`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      await generatePrescriptionPDF(prescription);
      setSuccessMessage('Official Prescription PDF generated and downloaded!');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight m-0">
                {language === 'hi' ? 'मरीज को डिजिटल रसीद भेजें' : 'Deliver Digital Prescription'}
              </h3>
              <p className="text-[11px] text-slate-500 m-0">
                Prescription ID: <span className="font-mono text-emerald-700 font-bold">{prescription.id}</span>
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

        {/* Channel Selection Tabs */}
        <div className="grid grid-cols-4 p-2 gap-1.5 bg-slate-100 border-b border-slate-200 text-xs">
          <button
            onClick={() => setActiveChannel('whatsapp')}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl font-bold transition-all ${
              activeChannel === 'whatsapp'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={() => setActiveChannel('email')}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl font-bold transition-all ${
              activeChannel === 'email'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Resend Email</span>
          </button>

          <button
            onClick={() => setActiveChannel('pdf')}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl font-bold transition-all ${
              activeChannel === 'pdf'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <FileDown className="w-4 h-4" />
            <span>PDF Receipt</span>
          </button>

          <button
            onClick={() => setActiveChannel('qr')}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl font-bold transition-all ${
              activeChannel === 'qr'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>QR Code</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 text-xs space-y-4">
          
          {/* Success Banner */}
          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-800 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* 1. WhatsApp Channel Tab */}
          {activeChannel === 'whatsapp' && (
            <div className="space-y-3.5">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Recipient WhatsApp Mobile Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98201 54321"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  Message Schedule Language
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDeliveryLanguage('en')}
                    className={`flex-1 py-2 rounded-lg font-bold transition-colors ${
                      deliveryLanguage === 'en' 
                        ? 'bg-emerald-600 text-white shadow-2xs' 
                        : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    English (Default)
                  </button>
                  <button
                    onClick={() => setDeliveryLanguage('hi')}
                    className={`flex-1 py-2 rounded-lg font-bold transition-colors ${
                      deliveryLanguage === 'hi' 
                        ? 'bg-emerald-600 text-white shadow-2xs' 
                        : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    हिन्दी (Hindi Schedule)
                  </button>
                </div>
              </div>

              <button
                onClick={handleSendWhatsApp}
                disabled={isSending || !phone}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-sm"
              >
                <Send className="w-4 h-4 stroke-[2.5]" />
                <span>Open in WhatsApp Web & Dispatch</span>
              </button>
            </div>
          )}

          {/* 2. Email (Resend) Channel Tab */}
          {activeChannel === 'email' && (
            <div className="space-y-3.5">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Recipient Patient Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patient@example.com"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <p className="font-bold text-slate-800 m-0">Resend API Delivery Features:</p>
                <p className="m-0">• Sends official clinic letterhead HTML receipt with complete intake schedule table.</p>
                <p className="m-0">• Includes doctor registration number, verification QR link, and zero-hallucination seal.</p>
              </div>

              <button
                onClick={handleSendEmail}
                disabled={isSending || !email}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-sm"
              >
                <Mail className="w-4 h-4 stroke-[2.5]" />
                <span>Send via Resend API</span>
              </button>
            </div>
          )}

          {/* 3. PDF Channel Tab */}
          {activeChannel === 'pdf' && (
            <div className="space-y-3.5 text-center">
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200">
                <FileDown className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-900 m-0">Official Medical Prescription PDF</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto m-0">
                  Ready-to-print or save. Features hospital letterhead, confirmed 24-hr schedule, doctor signature block, and smartphone verification QR code.
                </p>
              </div>

              <button
                onClick={handleDownloadPDF}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-sm"
              >
                <FileDown className="w-4 h-4 stroke-[2.5]" />
                <span>Download Official PDF Receipt</span>
              </button>
            </div>
          )}

          {/* 4. QR Code Channel Tab */}
          {activeChannel === 'qr' && (
            <div className="space-y-4 text-center">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Prescription QR Code"
                    className="w-44 h-44 rounded-xl border border-slate-200 p-2 bg-white shadow-xs"
                  />
                ) : (
                  <div className="w-44 h-44 rounded-xl bg-slate-200 animate-pulse flex items-center justify-center">
                    <QrCode className="w-8 h-8 text-slate-400" />
                  </div>
                )}
                
                <h4 className="text-xs font-bold text-slate-900 mt-3 m-0">
                  Scan to View Verified Prescription on Phone
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs m-0">
                  Patients can point their smartphone camera at this screen to instantly open their interactive schedule and voice audio directions.
                </p>
              </div>

              {/* Direct Link Copier */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 p-2 rounded-xl">
                <input
                  type="text"
                  readOnly
                  value={patientUrl}
                  className="flex-1 bg-transparent text-slate-600 font-mono text-[11px] px-2 focus:outline-none truncate"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-[11px] flex items-center gap-1 transition-colors shrink-0 shadow-2xs"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
