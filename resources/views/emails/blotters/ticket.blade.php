<div style="max-width: 600px; margin: 0 auto; padding: 28px; border: 1px solid #dbeafe; border-radius: 12px; background: #ffffff; color: #334155; font-family: Arial, sans-serif;">
    <h2 style="margin-top: 0; color: #1e3a8a;">E-Blotter Ticket Issued</h2>
    <p>Hello {{ $blotter->complainant->first_name }},</p>
    <p>Your E-Blotter submission has been reviewed and formally filed by the barangay.</p>
    <div style="padding: 16px; border-left: 4px solid #2563eb; border-radius: 6px; background: #eff6ff;">
        <p style="margin: 5px 0;"><strong>Ticket Number:</strong> {{ $blotter->ticket_number }}</p>
        <p style="margin: 5px 0;"><strong>Date Filed:</strong> {{ $blotter->approved_at->format('M d, Y') }}</p>
    </div>
    <p>Please keep this ticket number for your records.</p>
    <p style="color: #64748b;">Mission-Lokal Admin</p>
</div>