<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $adminData['admin_type_label'] ?? 'Primary Administrator' }} Credentials</title>
</head>
<body style="font-family: sans-serif; background-color: #eff6ff; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 30px; border: 1px solid #dbeafe;">
        <h2 style="color: #1e3a8a; margin-top: 0;">Mission-Lokal {{ $adminData['admin_type_label'] ?? 'Primary Administrator' }} Account</h2>
        <p>Hello <strong>{{ $adminData['name'] }}</strong>,</p>
        <p>Your barangay office has been provisioned. Keep this onboarding information for your records.</p>

        @if (!empty($adminData['barangay']))
            <h3 style="color: #1e3a8a; margin-bottom: 8px;">Barangay information</h3>
            <div style="background: #eff6ff; padding: 15px; border-radius: 6px; margin: 12px 0;">
                <p style="margin: 5px 0;"><strong>Barangay:</strong> {{ $adminData['barangay']['name'] }}</p>
                <p style="margin: 5px 0;"><strong>Barangay code:</strong> {{ $adminData['barangay']['code'] }}</p>
                <p style="margin: 5px 0;"><strong>Office address:</strong> {{ $adminData['barangay']['house_street'] }}, {{ $adminData['barangay']['city'] }}, {{ $adminData['barangay']['province'] }}</p>
                <p style="margin: 5px 0;"><strong>Office phone:</strong> {{ $adminData['barangay']['contact_phone'] }}</p>
                <p style="margin: 5px 0;"><strong>Office email:</strong> {{ $adminData['barangay']['contact_email'] }}</p>
            </div>
        @endif

        <p>Use the account below to sign in at <a href="{{ url('/admin-personnel/login') }}">the admin portal</a>:</p>
        
        <div style="background: #eff6ff; padding: 15px; border-radius: 6px; margin: 20px 0; font-family: monospace;">
            <p style="margin: 5px 0;"><strong>Account ID (User ID):</strong> {{ $adminData['account_id'] }}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> {{ $adminData['email'] }}</p>
            <p style="margin: 5px 0;"><strong>Temporary Password:</strong> {{ $adminData['password'] }}</p>
        </div>

        <p><strong>Security reminder:</strong> this is a default temporary password. Change it after your first sign-in. The portal will remind you until it is changed.</p>
        <p style="color: #64748b; font-size: 12px; margin-top: 30px;">This is an automated notification from Mission-Lokal System.</p>
    </div>
</body>
</html>