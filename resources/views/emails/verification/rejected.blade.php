<div>
    <h2>Hello {{ $user->first_name }},</h2>
    <p>We encountered an issue while reviewing your government ID submission.</p>
    <p><strong>Reason for rejection:</strong> {{ $reason }}</p>
    <p>Please log in to your account to upload a clearer or valid ID document so we can complete your registration.</p>
    <br>
    <p>Log in here: <a href="{{ config('app.url') }}/login">{{ config('app.url') }}/login</a></p>
    <br>
    <p>Thank you,<br>Mission-Lokal Admin</p>
</div>