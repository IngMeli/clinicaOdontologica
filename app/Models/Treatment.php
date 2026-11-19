<?php

namespace App\Models;

use Database\Factories\TreatmentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Treatment extends Model
{
    /** @use HasFactory<TreatmentFactory> */
    use HasFactory;

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
