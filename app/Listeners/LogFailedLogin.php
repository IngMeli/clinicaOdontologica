<?php

namespace App\Listeners;

use App\Models\LoginAttempt;
use Illuminate\Auth\Events\Failed;

class LogFailedLogin
{
    public function handle(Failed $event): void
    {
        LoginAttempt::create([
            'user_id' => $event->user?->getAuthIdentifier(),
            'email' => $event->credentials['email'] ?? 'desconocido',
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'successful' => false,
            'failure_reason' => 'Credenciales inválidas',
            'created_at' => now(),
        ]);
    }
}
