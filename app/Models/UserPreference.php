<?php

namespace App\Models;

use App\Enums\ThemeMode;
use App\Enums\ThemeSegment;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserPreference extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'theme_segment' => ThemeSegment::class,
            'theme_mode' => ThemeMode::class,
            'font_scale' => 'integer',
            'high_contrast' => 'boolean',
            'sidebar_open' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
