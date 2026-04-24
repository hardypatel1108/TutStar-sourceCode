<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>Welcome to TutStar</title>
</head>

<body style="font-family: Arial, sans-serif; background:#f9fafb; padding:20px">

    <div style="max-width:600px; margin:auto; background:white; padding:20px; border-radius:8px">

        <h2>{{ $title }}</h2>

        <p>{{ $bodyMessage }}</p>

        {{-- @if (!empty($payload))
            <ul>
                @foreach ($payload as $key => $value)
                    <li>
                        <strong>{{ ucfirst($key) }}:</strong>
                        {{ is_scalar($value) ? $value : json_encode($value) }}
                    </li>
                @endforeach
            </ul>
        @endif --}}


        <p>Thank you,<br>{{ config('app.name') }}</p>
    </div>

</body>

</html>
