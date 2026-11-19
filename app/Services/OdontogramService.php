<?php

namespace App\Services;

use App\Models\OdontogramEntry;
use App\Models\Patient;
use Illuminate\Database\Eloquent\Collection;

class OdontogramService
{
    /**
     * @return Collection<int, OdontogramEntry>
     */
    public function latest(Patient $patient): Collection
    {
        return $patient->odontogramEntries()
            ->with('recorder')
            ->orderByDesc('recorded_at')
            ->orderByDesc('id')
            ->get()
            ->unique(fn (OdontogramEntry $entry): string => $entry->tooth.'-'.($entry->surface ?? 'all'))
            ->sortBy('tooth')
            ->values();
    }

    /**
     * @return Collection<int, OdontogramEntry>
     */
    public function history(Patient $patient): Collection
    {
        return $patient->odontogramEntries()
            ->with('recorder')
            ->orderByDesc('recorded_at')
            ->orderByDesc('id')
            ->get();
    }
}
