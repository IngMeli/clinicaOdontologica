<?php

namespace App\Http\Middleware;

use App\Models\PageVisitCounter;
use App\Models\Visit;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class TrackPageVisit
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $this->shouldTrack($request)) {
            return $next($request);
        }

        $path = '/'.ltrim($request->path(), '/');

        Visit::create([
            'path' => $path,
            'route_name' => $request->route()?->getName(),
            'user_id' => $request->user()?->id,
            'ip_address' => $request->ip(),
            'session_id' => $request->session()->getId(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        if (DB::getDriverName() !== 'pgsql') {
            PageVisitCounter::updateOrCreate(
                ['path' => $path],
                ['route_name' => $request->route()?->getName(), 'last_visited_at' => now(), 'updated_at' => now()],
            )->increment('count');
        }

        $counter = PageVisitCounter::find($path);

        $request->attributes->set('page_visits', $counter->count ?? 1);
        $request->attributes->set('total_visits', PageVisitCounter::sum('count'));

        return $next($request);
    }

    private function shouldTrack(Request $request): bool
    {
        return $request->isMethod('GET')
            && ! $request->is('api/*')
            && ! $request->is('up')
            && ! $request->header('X-Inertia-Partial-Data')
            && ! $request->header('X-Inertia-Prefetch')
            && $request->header('Purpose') !== 'prefetch';
    }
}
