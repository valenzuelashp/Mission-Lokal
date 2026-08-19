<x-mail::message>
# Password Reset Request

<p style="font-size: 15px; color: #4b5563; line-height: 1.6;">
    Hello,
</p>

<p style="font-size: 15px; color: #4b5563; line-height: 1.6;">
    We received a request to reset the password for your <strong>Mission-Lokal</strong> community account. Use the secure verification code below to proceed with your request:
</p>

<div style="background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border: 1px solid #a7f3d0; border-left: 4px solid #0d9488; border-radius: 8px; padding: 28px; text-align: center; margin: 28px 0; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);">
    <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #0f766e; font-weight: 700; display: block; margin-bottom: 10px;">Secure Verification Code</span>
    <span style="font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #134e4a; font-family: monospace; display: inline-block; text-indent: 8px;">{{ $otp }}</span>
</div>

<div style="background-color: #f9fafb; border-left: 3px solid #d1d5db; padding: 12px 16px; border-radius: 4px; margin-bottom: 24px;">
    <p style="font-size: 13px; color: #4b5563; margin: 0; line-height: 1.5;">
        ⏳ This code will expire in <strong>15 minutes</strong>. For your security, never share this code with anyone, including barangay personnel.
    </p>
</div>

<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

<p style="font-size: 12px; color: #9ca3af; line-height: 1.5;">
    If you did not request a password reset, you can safely ignore this email. Your account remains completely secure.
</p>

<div style="margin-top: 24px;">
    <p style="font-size: 14px; color: #374151; margin: 0;">
        Regards,<br>
        <strong style="color: #0d9488;">{{ config('app.name') }} </strong>
    </p>
</div>
</x-mail::message>