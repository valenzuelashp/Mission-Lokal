<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <meta name="theme-color" content="#1d4ed8">
    <title>Digital ID Verification | Mission-Lokal</title>
</head>
<body style="margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 24px; box-sizing: border-box; background: #eff6ff; color: #1e293b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
    <main style="width: 100%; max-width: 440px; box-sizing: border-box; padding: 32px; border: 1px solid #dbeafe; border-radius: 20px; background: #ffffff; box-shadow: 0 20px 50px rgba(30, 64, 175, 0.12); text-align: center;">
        <div style="width: 56px; height: 56px; margin: 0 auto 18px; display: grid; place-items: center; border-radius: 50%; background: {{ $verified ? '#dbeafe' : '#f1f5f9' }}; color: {{ $verified ? '#1d4ed8' : '#64748b' }}; font-size: 28px; font-weight: 700;">
            {{ $verified ? '✓' : '!' }}
        </div>
        <p style="margin: 0 0 8px; color: #2563eb; font-size: 12px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;">Mission-Lokal Digital ID</p>
        <h1 style="margin: 0; color: #0f172a; font-size: 24px; line-height: 1.3;">
            {{ $verified ? 'Resident Verified' : 'Unable to Verify ID' }}
        </h1>
        @if ($verified)
            <p style="margin: 20px 0 6px; color: #64748b; font-size: 13px;">Registered cardholder</p>
            <p style="margin: 0; color: #1e3a8a; font-size: 20px; font-weight: 700;">{{ $cardholderName }}</p>
            <p style="margin: 18px 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">This digital ID belongs to an active, approved resident.</p>
        @else
            <p style="margin: 18px 0 0; color: #475569; font-size: 14px; line-height: 1.6;">This QR code is invalid or the resident is not currently eligible for verification. Please ask the cardholder to contact their barangay office.</p>
        @endif
        <p style="margin: 28px 0 0; padding-top: 18px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px;">Official resident identity verification</p>
    </main>
</body>
</html>
