<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Treatment extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'active' => 'boolean',
        ];
    }

    /**
     * @return HasMany<TreatmentPlanItem, $this>
     */
    public function planItems(): HasMany
    {
        return $this->hasMany(TreatmentPlanItem::class);
    }
}
