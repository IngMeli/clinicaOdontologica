<?php

namespace Tests\Feature\Foundation;

use App\Models\Patient;
use App\Services\DocumentNumberService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DocumentNumberServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_generates_the_next_sequential_number(): void
    {
        Patient::factory()->create(['code' => 'PAC-0001']);
        Patient::factory()->create(['code' => 'PAC-0002']);

        $number = app(DocumentNumberService::class)
            ->next(Patient::class, 'code', 'PAC');

        $this->assertSame('PAC-0003', $number);
    }

    public function test_it_starts_at_one_when_no_records_exist(): void
    {
        $number = app(DocumentNumberService::class)
            ->next(Patient::class, 'code', 'PAC');

        $this->assertSame('PAC-0001', $number);
    }
}
