<?php

namespace Tests\Feature\Foundation;

use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class ConfigurationTest extends TestCase
{
    public function test_the_clinic_uses_the_bolivian_timezone(): void
    {
        $this->assertSame('America/La_Paz', config('app.timezone'));
    }

    public function test_validation_messages_are_available_in_spanish(): void
    {
        $validator = Validator::make([], [
            'name' => ['required'],
        ]);

        $this->assertSame(
            'El campo nombre es obligatorio.',
            $validator->errors()->first('name'),
        );
    }
}
