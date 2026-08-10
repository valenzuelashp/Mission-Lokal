<div>
    <h2>Hello {{ $user->first_name }},</h2>
    <p>Good news! Your government ID has been reviewed and approved by the barangay administration.</p>
    <p>Your resident account is now fully verified. You can log in and start reporting concerns to the community.</p>
    <br>
    <p>Log in here: <a href="{{ config('app.url') }}/login">{{ config('app.url') }}/login</a></p>
    <br>
    <p>Stay safe,<br>Mission-Lokal Admin</p>
</div>