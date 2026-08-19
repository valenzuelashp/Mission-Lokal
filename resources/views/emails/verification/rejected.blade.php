<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Verification Update Required</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 30px 20px; color: #334155;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        
        <!-- Header Brand Accent -->
        <div style="border-bottom: 2px solid #dc2626; padding-bottom: 16px; margin-bottom: 24px;">
            <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #dc2626; font-weight: 700;">Mission-Lokal Portal</span>
            <h2 style="color: #0f172a; margin: 6px 0 0 0; font-size: 22px;">Verification Update Required</h2>
        </div>

        <p style="font-size: 15px; color: #475569; line-height: 1.6;">
            Hello <strong>{{ $user->first_name }}</strong>,
        </p>
        
        <p style="font-size: 15px; color: #475569; line-height: 1.6;">
            We encountered an issue while reviewing your government ID submission for community verification.
        </p>
        
        <!-- Reason Box -->
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-left: 4px solid #dc2626; padding: 16px; margin: 24px 0; border-radius: 6px;">
            <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #991b1b; font-weight: 700; display: block; margin-bottom: 4px;">Reason for Rejection</span>
            <p style="margin: 0; color: #7f1d1d; font-size: 14px; line-height: 1.5;">{{ $reason }}</p>
        </div>

        <p style="font-size: 15px; color: #475569; line-height: 1.6;">
            Please check your details and re-submit your registration with a clearer, valid government ID document so our administration can complete your verification.
        </p>
        
        <!-- Action Button -->
        <div style="text-align: center; margin: 32px 0 24px 0;">
            <a href="{{ config('app.url') }}account-status" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; border-radius: 6px; font-size: 14px; font-weight: 600; text-decoration: none; display: inline-block; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);">Update Registration Status</a>
        </div>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        
        <p style="font-size: 13px; color: #94a3b8; margin: 0;">
            Thank you,<br>
            <strong style="color: #64748b;">Mission-Lokal Administration</strong>
        </p>
    </div>
</body>
</html>