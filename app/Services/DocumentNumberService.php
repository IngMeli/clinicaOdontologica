<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Model;

class DocumentNumberService
{
    /**
     * @param  class-string<Model>  $modelClass
     */
    public function next(string $modelClass, string $column, string $prefix, int $width = 4): string
    {
        $model = new $modelClass;

        $last = $model->newQuery()
            ->where($column, 'like', $prefix.'-%')
            ->orderByDesc($column)
            ->lockForUpdate()
            ->value($column);

        $next = 1;

        if (is_string($last) && preg_match('/-(\d+)$/', $last, $matches) === 1) {
            $next = (int) $matches[1] + 1;
        }

        return $prefix.'-'.str_pad((string) $next, $width, '0', STR_PAD_LEFT);
    }
}
