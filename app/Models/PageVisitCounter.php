<?php

namespace App\Models;

use Database\Factories\PageVisitCounterFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PageVisitCounter extends Model
{
    /** @use HasFactory<PageVisitCounterFactory> */
    use HasFactory;

    protected $primaryKey = 'path';

    public $incrementing = false;

    protected $keyType = 'string';

    public $timestamps = false;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'count' => 'integer',
            'last_visited_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }
}
