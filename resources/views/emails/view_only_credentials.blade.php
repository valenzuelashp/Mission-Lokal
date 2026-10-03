<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>View-Only Official Credentials</title>
</head>
<body style="font-family: sans-serif; background-color: #f8fafc; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 30px; border: 1px solid #e2e8f0;">
        <h2 style="color: #3730a3; margin-top: 0;">Mission-Lokal View-Only Monitoring Account</h2>
        <p>Hello <strong>{{ $adminData['name'] }}</strong>,</p>
        <p>A secure read-only monitoring account has been created for you. Below are your login credentials:</p>
        
        <div style="background: #f1f5f9; padding: 15px; border-radius: 6px; margin: 20px 0; font-family: monospace;">
            <p style="margin: 5px 0;"><strong>Account ID (User ID):</strong> {{ $adminData['account_id'] }}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> {{ $adminData['email'] }}</p>
            <p style="margin: 5px 0;"><strong>Temporary Password:</strong> {{ $adminData['password'] }}</p>
        </div>

        <p>You can use these credentials to log in and monitor all reports, resident queues, and dashboards in real-time.</p>
        <p style="color: #64748b; font-size: 12px; margin-top: 30px;">This is an automated notification from Mission-Lokal System.</p>
    </div>
</body>
</html>