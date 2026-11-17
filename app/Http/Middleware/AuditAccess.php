<?php

namespace App\Http\Middleware;

use App\Models\AccessLog;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuditAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        $startedAt = microtime(true);
        $response = $next($request);

        if ($this->shouldLog($request)) {
            $segment = explode('/', trim($request->path(), '/'))[0] ?: null;

            AccessLog::create([
                'user_id' => $request->user()?->id,
                'method' => $request->method(),
                'path' => '/'.ltrim($request->path(), '/'),
                'route_name' => $request->route()?->getName(),
                'resource_type' => $segment,
                'status_code' => $response->getStatusCode(),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'duration_ms' => (int) round((microtime(true) - $startedAt) * 1000),
                'created_at' => now(),
            ]);
        }

        return $response;
    }

    private function shouldLog(Request $request): bool
    {
        return $request->user() !== null
            && ! $request->is('api/v1/search*')
            && ! $request->is('api/v1/preferences*')
            && ! $request->is('up');
    }
}
