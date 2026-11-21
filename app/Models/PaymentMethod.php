<?php

namespace App\Models;

use App\Enums\PaymentMethodType;
use Database\Factories\PaymentMethodFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property PaymentMethodType $type
 */
class PaymentMethod extends Model
{
    /** @use HasFactory<PaymentMethodFactory> */
    use HasFactory;

    protected $guarded = ['id'];

    protected $appends = ['name'];

    protected function casts(): array
    {
        return [
            'type' => PaymentMethodType::class,
            'is_default' => 'boolean',
            'expires_at' => 'date',
        ];
    }

    public function getNameAttribute(): string
    {
        return $this->alias ?? $this->provider ?? $this->type->label();
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return HasMany<Payment, $this>
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}
