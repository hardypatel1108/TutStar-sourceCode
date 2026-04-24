<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>Welcome to TutStar</title>
</head>

<body style="font-family: Arial, sans-serif; background:#f9fafb; padding:20px">

    <div style="max-width:600px; margin:auto; background:white; padding:20px; border-radius:8px">
        <h2 style="color:#4f46e5">Welcome to TutStar 🎉</h2>

        <p>Hello <strong>{{ $user->name }}</strong>,</p>

        <p>Your Teacher account has been successfully created.</p>

        <p><strong>Login Details:</strong></p>
        <ul>
            <li>Email: {{ $user->email }}</li>
            <li>Password: <strong>{{ $password }}</strong></li>
        </ul>

        <p>Please login and change your password after first login.</p>

        <a href="{{ url('/teacher/login') }}"
            style="display:inline-block; padding:10px 16px; background:#4f46e5; color:white; text-decoration:none; border-radius:6px">
            Login Now
        </a>

        <p style="margin-top:20px; font-size:12px; color:#6b7280">
            If you didn’t request this account, please contact support.
        </p>
    </div>

</body>

</html>
