<?php

namespace App\Http\Controllers\Api;

use App\Enums\ThemeMode;
use App\Enums\ThemeSegment;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PreferenceController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $data = $request->validate([
            'theme_segment' => ['sometimes', Rule::enum(ThemeSegment::class)],
            'theme_mode' => ['sometimes', Rule::enum(ThemeMode::class)],
            'font_scale' => ['sometimes', 'integer', 'between:80,150'],
            'high_contrast' => ['sometimes', 'boolean'],
            'sidebar_open' => ['sometimes', 'boolean'],
        ]);

        $preferences = $request->user()->preferences()->updateOrCreate([], $data);

        return response()->json(['data' => $preferences]);
    }
}
