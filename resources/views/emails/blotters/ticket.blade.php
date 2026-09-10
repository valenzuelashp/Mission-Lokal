<div>
    <h2>E-Blotter Ticket Issued</h2>
    <p>Hello {{ $blotter->complainant->first_name }},</p>
    <p>Your E-Blotter submission has been reviewed and formally filed by the barangay.</p>
    <ul>
        <li><strong>Ticket Number:</strong> {{ $blotter->ticket_number }}</li>
        <li><strong>Date Filed:</strong> {{ $blotter->approved_at->format('M d, Y') }}</li>
    </ul>
    <p>Please keep this ticket number for your records.</p>
    <br>
    <p>Mission-Lokal Admin</p>
</div>