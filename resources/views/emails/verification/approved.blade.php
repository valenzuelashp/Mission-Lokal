<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Account Approved</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 30px 20px; color: #334155;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        
        <!-- Header Brand Accent -->
        <div style="border-bottom: 2px solid #0d9488; padding-bottom: 16px; margin-bottom: 24px;">
            <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #0d9488; font-weight: 700;">Mission-Lokal Portal</span>
            <h2 style="color: #0f172a; margin: 6px 0 0 0; font-size: 22px;">ID Verification Approved</h2>
        </div>

        <p style="font-size: 15px; color: #475569; line-height: 1.6;">
            Hello <strong>{{ $user->first_name }}</strong>,
        </p>
        
        <p style="font-size: 15px; color: #475569; line-height: 1.6;">
            Great news! Your government ID has been reviewed and successfully approved by the barangay administration. Your resident account is now fully verified.
        </p>
        
        <!-- Credentials Box -->
        <div style="background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border: 1px solid #a7f3d0; border-radius: 8px; padding: 24px; margin: 28px 0; text-align: center;">
            <div style="margin-bottom: 16px;">
                <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #0f766e; font-weight: 700; display: block; margin-bottom: 4px;">Your Account ID</span>
                <span style="font-size: 20px; font-weight: 800; font-family: monospace; color: #134e4a; letter-spacing: 2px;">{{ $user->account_id }}</span>
            </div>
            
            <div style="border-top: 1px solid #cbd5e1; padding-top: 16px;">
                <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #0f766e; font-weight: 700; display: block; margin-bottom: 4px;">Your Temporary Password</span>
                <span style="font-size: 20px; font-weight: 800; font-family: monospace; color: #134e4a; letter-spacing: 1px;">{{ $rawPassword }}</span>
            </div>
        </div>

        <!-- Security Warning -->
        <div style="background-color: #fefce8; border-left: 3px solid #ca8a04; padding: 12px 16px; border-radius: 4px; margin-bottom: 24px;">
            <p style="font-size: 13px; color: #854d0e; margin: 0; line-height: 1.5;">
                🔒 <strong>Security Tip:</strong> For your protection, please change your password immediately through your profile security settings after logging in.
            </p>
        </div>

        <!-- Action Button -->
        <div style="text-align: center; margin: 32px 0 24px 0;">
            <a href="{{ config('app.url') }}/login" style="background-color: #0d9488; color: #ffffff; padding: 12px 28px; border-radius: 6px; font-size: 14px; font-weight: 600; text-decoration: none; display: inline-block; box-shadow: 0 2px 4px rgba(13, 148, 136, 0.2);">Log In to Your Account</a>
        </div>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        
        <p style="font-size: 13px; color: #94a3b8; margin: 0;">
            Stay safe,<br>
            <strong style="color: #64748b;">Mission-Lokal Administration</strong>
        </p>
    </div>
</body>
</html>