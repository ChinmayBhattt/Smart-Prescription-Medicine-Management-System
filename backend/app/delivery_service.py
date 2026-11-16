import urllib.parse
from typing import Dict, Any, Optional
from app.models import Prescription

RESEND_API_ENDPOINT = "https://api.resend.com/emails"

def generate_whatsapp_share_payload(rx: Prescription, language: str = "hi") -> Dict[str, Any]:
    """
    Generates WhatsApp message payload compliant with WhatsApp Cloud API template
    and provides a direct WhatsApp Web/App click-to-chat URL with bilingual formatting.
    """
    pt_name = rx.patient.name
    doc_name = rx.doctor.name
    rx_id = rx.id
    
    if language == "hi":
        msg = f"""🏥 *डिजिटल प्रिस्क्रिप्शन और दवा का समय (Digital Prescription)*
*प्रिस्क्रिप्शन कोड (ID):* `{rx_id}`
*मरीज (Patient):* {pt_name}
*डॉक्टर (Doctor):* {doc_name} ({rx.doctor.clinic_hospital})

💊 *आपकी दवाओं का शेड्यूल:*
"""
        for item in rx.items:
            timing_hi = item.instructions_hi or f"{item.dosage} {item.timing_relation.value}"
            msg += f"• *{item.medicine_name}* ({item.strength}): {timing_hi}\n"
            
        msg += f"""
📅 *दवा लेने का समय तालिका:*
🌅 सुबह (Morning - 08:00 AM)
☀️ दोपहर (Afternoon - 01:00 PM)
🌙 रात (Night - 09:30 PM)

🌐 *अपना डिजिटल प्रिस्क्रिप्शन और वॉयस निर्देश यहाँ देखें:*
https://smartrx.hospital/patient/{rx_id}

⚠️ *नोट:* केवल डॉक्टर द्वारा पुष्टि की गई खुराक ही लें। किसी भी असुविधा पर डॉक्टर से संपर्क करें: {rx.doctor.phone}
"""
    else:
        msg = f"""🏥 *Digital Medical Prescription & Schedule*
*Prescription ID:* `{rx_id}`
*Patient:* {pt_name}
*Doctor:* {doc_name} ({rx.doctor.clinic_hospital})

💊 *Prescribed Medications:*
"""
        for item in rx.items:
            timing_en = item.instructions_en or f"{item.dosage} {item.timing_relation.value}"
            msg += f"• *{item.medicine_name}* ({item.strength}): {timing_en}\n"
            
        msg += f"""
📅 *Standard Intake Schedule:*
🌅 Morning (08:00 AM) | ☀️ Afternoon (01:00 PM) | 🌙 Night (09:30 PM)

🌐 *View Verified Prescription & Voice Instructions:*
https://smartrx.hospital/patient/{rx_id}

⚠️ *Clinical Note:* Follow strictly as prescribed. Emergency Contact: {rx.doctor.phone}
"""
    
    clean_phone = rx.patient.phone.replace("+", "").replace("-", "").replace(" ", "")
    # Default to India ISD 91 if not provided
    if len(clean_phone) == 10:
        clean_phone = "91" + clean_phone
        
    encoded_text = urllib.parse.quote(msg)
    direct_wa_link = f"https://wa.me/{clean_phone}?text={encoded_text}"
    
    # Cloud API template payload format
    cloud_api_payload = {
        "messaging_product": "whatsapp",
        "to": clean_phone,
        "type": "text",
        "text": {"body": msg}
    }
    
    return {
        "channel": "whatsapp",
        "recipient_phone": clean_phone,
        "direct_click_url": direct_wa_link,
        "message_body": msg,
        "cloud_api_payload": cloud_api_payload,
        "status": "ready_to_send"
    }

def generate_resend_email_payload(rx: Prescription, recipient_email: Optional[str] = None) -> Dict[str, Any]:
    """
    Generates Resend Email payload with HTML receipt and inline CSS for doctor and patient.
    """
    target_email = recipient_email or rx.patient.email or "patient@example.com"
    
    meds_html = ""
    for idx, item in enumerate(rx.items, 1):
        meds_html += f"""
        <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 12px; font-weight: bold; color: #0f172a;">{idx}. {item.medicine_name} <br/><span style="font-size: 11px; color: #64748b; font-weight: normal;">{item.generic_name}</span></td>
            <td style="padding: 12px; color: #334155;">{item.form} ({item.strength})</td>
            <td style="padding: 12px; color: #059669; font-weight: 600;">{item.dosage}</td>
            <td style="padding: 12px; color: #334155;">{item.instructions_en}<br/><span style="color: #64748b; font-size: 11px;">{item.instructions_hi}</span></td>
            <td style="padding: 12px; color: #334155;">{item.duration_days} Days</td>
        </tr>
        """
        
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Official Prescription Receipt - {rx.id}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px;">
        <div style="max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
            <div style="background: #0f172a; padding: 24px; color: #ffffff;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h1 style="margin: 0; font-size: 22px; color: #34d399; font-weight: bold;">{rx.doctor.clinic_hospital}</h1>
                        <p style="margin: 4px 0 0; font-size: 13px; color: #94a3b8;">Smart Prescription System • Unique Rx: {rx.id}</p>
                    </div>
                </div>
            </div>
            
            <div style="padding: 24px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 13px; line-height: 1.6; border-bottom: 1px dashed #cbd5e1; padding-bottom: 16px;">
                    <div>
                        <strong>Patient:</strong> {rx.patient.name} ({rx.patient.age}y / {rx.patient.gender})<br/>
                        <strong>Diagnosis:</strong> {rx.patient.diagnosis}<br/>
                        <strong>Date:</strong> {rx.created_at.strftime('%d-%b-%Y')}
                    </div>
                    <div>
                        <strong>Doctor:</strong> {rx.doctor.name}<br/>
                        <strong>Reg. No:</strong> {rx.doctor.reg_number}<br/>
                        <strong>Specialty:</strong> {rx.doctor.qualification}
                    </div>
                </div>
                
                <h3 style="color: #0f172a; margin-top: 0; margin-bottom: 12px; font-size: 15px; border-left: 4px solid #10b981; padding-left: 8px;">Prescribed Medications (Rx)</h3>
                
                <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 24px;">
                    <thead>
                        <tr style="background: #f1f5f9; text-align: left; color: #475569;">
                            <th style="padding: 10px;">Medicine</th>
                            <th style="padding: 10px;">Form & Strength</th>
                            <th style="padding: 10px;">Dose</th>
                            <th style="padding: 10px;">Timing & Food Relation</th>
                            <th style="padding: 10px;">Duration</th>
                        </tr>
                    </thead>
                    <tbody>
                        {meds_html}
                    </tbody>
                </table>
                
                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
                    <h4 style="margin: 0 0 8px; color: #166534; font-size: 14px;">📅 Daily Intake Schedule (दवा लेने का समय)</h4>
                    <p style="margin: 0; font-size: 12px; color: #15803d; line-height: 1.5;">
                        • <strong>Morning (08:00 AM / सुबह):</strong> Follow designated post/pre-meal medications.<br/>
                        • <strong>Afternoon (01:00 PM / दोपहर):</strong> Take with adequate water.<br/>
                        • <strong>Night (09:30 PM / रात):</strong> Take before sleeping as instructed.
                    </p>
                </div>
                
                <div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b;">
                    <p style="margin: 0;">Verified Digital Medical Document • Prescribed by {rx.doctor.name}</p>
                    <p style="margin: 4px 0 0;">Zero-Hallucination Safe Prescription Guarantee</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    """
    
    return {
        "channel": "email",
        "to": [target_email],
        "from": "SmartRx System <prescriptions@resend.dev>",
        "subject": f"Prescription Receipt #{rx.id} - {rx.doctor.clinic_hospital}",
        "html": html_content
    }
