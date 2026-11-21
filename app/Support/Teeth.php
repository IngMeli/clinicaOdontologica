<?php

namespace App\Support;

final class Teeth
{
    /**
     * @return array<int, int>
     */
    public static function permanent(): array
    {
        return [
            18, 17, 16, 15, 14, 13, 12, 11,
            21, 22, 23, 24, 25, 26, 27, 28,
            31, 32, 33, 34, 35, 36, 37, 38,
            41, 42, 43, 44, 45, 46, 47, 48,
        ];
    }

    /**
     * @return array<int, int>
     */
    public static function primary(): array
    {
        return [
            55, 54, 53, 52, 51,
            61, 62, 63, 64, 65,
            71, 72, 73, 74, 75,
            85, 84, 83, 82, 81,
        ];
    }

    /**
     * @return array<int, int>
     */
    public static function all(): array
    {
        return array_merge(self::permanent(), self::primary());
    }
}
