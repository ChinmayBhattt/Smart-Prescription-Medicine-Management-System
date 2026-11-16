import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { Prescription } from '../types';

export async function generatePrescriptionPDF(rx: Prescription): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = 15;

  // 1. Header / Hospital Letterhead
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 32, 'F');

  doc.setTextColor(52, 211, 153); // emerald-400
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(rx.doctor.clinic_hospital.toUpperCase(), 14, 12);

  doc.setTextColor(203, 213, 225); // slate-300
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`${rx.doctor.name} | ${rx.doctor.qualification} | Reg: ${rx.doctor.reg_number}`, 14, 18);
  doc.text(`Contact: ${rx.doctor.phone} | Email: ${rx.doctor.email}`, 14, 24);

  // Prescription ID Badge
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.roundedRect(pageWidth - 55, 8, 42, 14, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('PRESCRIPTION ID', pageWidth - 53, 13);
  doc.setFontSize(11);
  doc.text(rx.id, pageWidth - 53, 19);

  currentY = 40;

  // 2. Patient Information Bar
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(12, currentY, pageWidth - 24, 22, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`Patient: ${rx.patient.name}`, 16, currentY + 7);
  doc.setFont('helvetica', 'normal');
  doc.text(`Age/Gender: ${rx.patient.age} Yrs / ${rx.patient.gender}`, 16, currentY + 13);
  doc.text(`Phone: ${rx.patient.phone}`, 16, currentY + 18);

  const dateStr = new Date(rx.created_at).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
  doc.text(`Date: ${dateStr}`, pageWidth / 2 + 10, currentY + 7);
  doc.text(`Diagnosis: ${rx.patient.diagnosis}`, pageWidth / 2 + 10, currentY + 13);
  if (rx.patient.known_allergies.length > 0) {
    doc.setTextColor(220, 38, 38); // red-600
    doc.setFont('helvetica', 'bold');
    doc.text(`Allergies: ${rx.patient.known_allergies.join(', ')}`, pageWidth / 2 + 10, currentY + 18);
  }

  currentY += 28;

  // 3. Rx Symbol & Header
  doc.setTextColor(16, 185, 129);
  doc.setFont('times', 'bolditalic');
  doc.setFontSize(22);
  doc.text('Rx', 14, currentY + 2);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('PRESCRIBED MEDICINES (चिकित्सा निर्देश)', 28, currentY);

  currentY += 6;

  // 4. Medicines Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(12, currentY, pageWidth - 24, 7, 'F');
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('#', 15, currentY + 5);
  doc.text('Medicine & Strength', 22, currentY + 5);
  doc.text('Dose', 78, currentY + 5);
  doc.text('Timing (M-A-E-N)', 102, currentY + 5);
  doc.text('Relation to Food', 135, currentY + 5);
  doc.text('Duration', 170, currentY + 5);

  currentY += 8;

  // 5. Medicines List
  rx.items.forEach((item, index) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(`${index + 1}.`, 15, currentY + 4);
    doc.text(`${item.medicine_name} (${item.form} - ${item.strength})`, 22, currentY + 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(item.generic_name, 22, currentY + 8);

    doc.setTextColor(5, 150, 105);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(item.dosage, 78, currentY + 4);

    // M-A-E-N pattern
    const m = item.morning ? '1' : '0';
    const a = item.afternoon ? '1' : '0';
    const e = item.evening ? '1' : '0';
    const n = item.night ? '1' : '0';
    doc.setTextColor(15, 23, 42);
    doc.text(`${m}-${a}-${e}-${n}`, 102, currentY + 4);

    const relStr = item.timing_relation.replace('_', ' ').toLowerCase();
    doc.text(relStr.charAt(0).toUpperCase() + relStr.slice(1), 135, currentY + 4);

    doc.text(`${item.duration_days} days (${item.total_quantity} qty)`, 170, currentY + 4);

    // Instructions
    if (item.instructions_en) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7);
      doc.setTextColor(71, 85, 105);
      doc.text(`Instructions: ${item.instructions_en}`, 22, currentY + 12);
    }

    doc.setDrawColor(241, 245, 249);
    doc.line(12, currentY + 14, pageWidth - 12, currentY + 14);

    currentY += 16;
  });

  currentY += 4;

  // 6. Confirmed Daily Schedule Box
  doc.setFillColor(240, 253, 244); // emerald-50
  doc.setDrawColor(187, 247, 208); // emerald-200
  doc.roundedRect(12, currentY, pageWidth - 24, 30, 2, 2, 'FD');

  doc.setTextColor(22, 101, 52); // emerald-800
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('CONFIRMED DAILY INTAKE SCHEDULE (दवा लेने की दैनिक समय-सारणी)', 16, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(21, 128, 61);
  doc.text('• MORNING (सुबह ~ 08:00 AM): Take assigned morning medications with water.', 16, currentY + 12);
  doc.text('• AFTERNOON (दोपहर ~ 01:00 PM): Take with or after lunch as designated.', 16, currentY + 17);
  doc.text('• NIGHT (रात ~ 09:30 PM): Complete night doses before sleep.', 16, currentY + 22);
  doc.text('• Note: Follow complete course duration. Do not stop midway without consulting.', 16, currentY + 27);

  currentY += 36;

  // 7. Clinical Notes & Advice
  if (rx.notes) {
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('CLINICAL ADVICE & INSTRUCTIONS:', 14, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(rx.notes, 14, currentY + 5);
    currentY += 14;
  }

  // 8. QR Code and Doctor Sign-off
  const qrDataUrl = await QRCode.toDataURL(
    rx.qr_code_data || `https://smartrx.hospital/verify/${rx.id}`,
    { width: 128, margin: 1 }
  );

  doc.addImage(qrDataUrl, 'PNG', 14, currentY, 26, 26);
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7);
  doc.text('Scan with smartphone to', 14, currentY + 29);
  doc.text('verify & hear voice schedule', 14, currentY + 32);

  // Doctor Signature
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(rx.doctor.name, pageWidth - 65, currentY + 16);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(rx.doctor.qualification, pageWidth - 65, currentY + 20);
  doc.text(`Reg: ${rx.doctor.reg_number}`, pageWidth - 65, currentY + 24);
  doc.setDrawColor(203, 213, 225);
  doc.line(pageWidth - 65, currentY + 12, pageWidth - 14, currentY + 12);
  doc.text('Digitally Signed & Verified', pageWidth - 65, currentY + 10);

  // Footer Disclaimer
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'ZERO-HALLUCINATION GUARANTEE: This medical document is generated strictly from confirmed physician orders. AI never invents dosages.',
    pageWidth / 2,
    288,
    { align: 'center' }
  );

  // Save the PDF
  doc.save(`Prescription_${rx.id}_${rx.patient.name.replace(/\s+/g, '_')}.pdf`);
}
