<x-mail::message>
# Password Reset Request

We received a request to reset your password for Mission-Lokal.

Your 6-digit verification code is:
# {{ $otp }}

This code will expire in 15 minutes. If you did not request a password reset, no further action is required.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>