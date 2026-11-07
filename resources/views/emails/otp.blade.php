<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Mission-Lokal OTP</title>
</head>
<body style="margin: 0; padding: 30px 20px; background: #eff6ff; color: #334155; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
    <main style="max-width: 560px; margin: 0 auto; padding: 32px; border: 1px solid #dbeafe; border-radius: 14px; background: #ffffff;">
        <h2 style="margin-top: 0; color: #1e3a8a;">Mission-Lokal Password Reset</h2>
        <p style="line-height: 1.6;">You requested an OTP code to reset your account password. Please use the verification code below:</p>
        <div style="padding: 20px; border: 1px solid #bfdbfe; border-radius: 8px; background: #eff6ff; text-align: center;">
            <h1 style="margin: 0; letter-spacing: 5px; color: #1d4ed8;">{{ $otp }}</h1>
        </div>
        <p style="line-height: 1.6;">This code will expire in 15 minutes. If you did not request this change, please ignore this email.</p>
        <p style="margin-bottom: 0; color: #64748b;">Mission-Lokal Administration</p>
    </main>
</body>
</html>