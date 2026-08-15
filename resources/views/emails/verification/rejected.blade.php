<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Verification Update Required</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f6f9fc; padding: 20px; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #b91c1c; margin-top: 0;">Hello {{ $user->first_name }},</h2>
        
        <p>We encountered an issue while reviewing your government ID submission.</p>
        
        <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 12px 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #991b1b;"><strong>Reason for rejection:</strong> {{ $reason }}</p>
        </div>

        <p>Please check your details and re-submit your registration with a clearer or valid ID document so we can complete your verification.</p>
        
        <br>
        <p>Check status or register here: <a href="{{ config('app.url') }}/account-status" style="color: #2563eb; text-decoration: underline;">{{ config('app.url') }}/account-status</a></p>
        <br>
        
        <p>Thank you,<br>Mission-Lokal Admin</p>
    </div>
</body>
</html>