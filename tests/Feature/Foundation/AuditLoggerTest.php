<?php

namespace Tests\Feature\Foundation;

use App\Models\Patient;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuditLoggerTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_records_the_subject_causer_and_properties(): void
    {
        $user = User::factory()->create();
        $patient = Patient::factory()->create();

        $this->actingAs($user);

        app(AuditLogger::class)->log('Paciente actualizado', $patient, [
            'campo' => 'teléfono',
        ]);

        $this->assertDatabaseHas('activity_log', [
            'log_name' => 'clinica',
            'description' => 'Paciente actualizado',
            'subject_type' => $patient->getMorphClass(),
            'subject_id' => $patient->id,
            'causer_type' => $user->getMorphClass(),
            'causer_id' => $user->id,
        ]);
    }
}
