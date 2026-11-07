<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>View-Only Official Credentials</title>
</head>
<body style="font-family: sans-serif; background-color: #eff6ff; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 30px; border: 1px solid #dbeafe;">
        <h2 style="color: #1e3a8a; margin-top: 0;">Mission-Lokal View-Only Monitoring Account</h2>
        <p>Hello <strong>{{ $adminData['name'] }}</strong>,</p>
        <p>A secure read-only monitoring account has been created for you. Below are your barangay details and login credentials:</p>

        @if (!empty($adminData['barangay']))
            <div style="background: #eff6ff; padding: 15px; border-radius: 6px; margin: 12px 0;">
                <p style="margin: 5px 0;"><strong>Barangay:</strong> {{ $adminData['barangay']['name'] }} ({{ $adminData['barangay']['code'] }})</p>
                <p style="margin: 5px 0;"><strong>Office address:</strong> {{ $adminData['barangay']['house_street'] }}, {{ $adminData['barangay']['city'] }}, {{ $adminData['barangay']['province'] }}</p>
                <p style="margin: 5px 0;"><strong>Office contact:</strong> {{ $adminData['barangay']['contact_phone'] }} | {{ $adminData['barangay']['contact_email'] }}</p>
            </div>
        @endif
        
        <div style="background: #eff6ff; padding: 15px; border-radius: 6px; margin: 20px 0; font-family: monospace;">
            <p style="margin: 5px 0;"><strong>Account ID (User ID):</strong> {{ $adminData['account_id'] }}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> {{ $adminData['email'] }}</p>
            <p style="margin: 5px 0;"><strong>Temporary Password:</strong> {{ $adminData['password'] }}</p>
        </div>

        <p>Sign in at <a href="{{ url('/admin-personnel/login') }}">the admin portal</a> to monitor reports, resident queues, and dashboards.</p>
        <p><strong>Security reminder:</strong> this is a default temporary password. Change it after your first sign-in. The portal will remind you until it is changed.</p>
        <p style="color: #64748b; font-size: 12px; margin-top: 30px;">This is an automated notification from Mission-Lokal System.</p>
    </div>
</body>
</html>