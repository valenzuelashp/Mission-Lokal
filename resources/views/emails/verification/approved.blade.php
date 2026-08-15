<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Account Approved</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f6f9fc; padding: 20px; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #1e3a8a; margin-top: 0;">Hello {{ $user->first_name }},</h2>
        
        <p>Good news! Your government ID has been reviewed and approved by the barangay administration.</p>
        
        <p>Your resident account is now fully verified. You can log in using your Account ID and temporary password below to start reporting concerns to the community:</p>

        <div style="background: #f1f5f9; padding: 15px; border-radius: 6px; margin: 20px 0; text-align: center;">
            <div style="margin-bottom: 12px;">
                <span style="font-size: 14px; color: #64748b; display: block; margin-bottom: 3px;">Your Account ID:</span>
                <strong style="font-size: 18px; font-family: monospace; color: #0f172a;">{{ $user->account_id }}</strong>
            </div>
            
            <div style="border-top: 1px solid #e2e8f0; padding-top: 12px;">
                <span style="font-size: 14px; color: #64748b; display: block; margin-bottom: 3px;">Your Temporary Password:</span>
                <strong style="font-size: 18px; font-family: monospace; color: #0f172a;">{{ $rawPassword }}</strong>
            </div>
        </div>

        <p style="font-size: 13px; color: #64748b;">For security purposes, we strongly recommend that you change your password immediately after logging into your profile security settings.</p>
        
        <br>
        <p>Log in here: <a href="{{ config('app.url') }}/login" style="color: #2563eb; text-decoration: underline;">{{ config('app.url') }}/login</a></p>
        <br>
        
        <p>Stay safe,<br>Mission-Lokal Admin</p>
    </div>
</body>
</html>