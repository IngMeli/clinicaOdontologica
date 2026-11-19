<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class AuditLogger
{
    /**
     * @param  array<string, mixed>  $properties
     */
    public function log(string $description, Model $subject, array $properties = [], string $logName = 'clinica'): void
    {
        $logger = activity($logName)
            ->performedOn($subject)
            ->withProperties($properties);

        $user = Auth::user();

        if ($user instanceof Model) {
            $logger->causedBy($user);
        }

        $logger->log($description);
    }
}
