<?php

namespace Database\Seeders;

use App\Enums\AppointmentStatus;
use App\Enums\ConsultationStatus;
use App\Enums\TreatmentItemStatus;
use App\Enums\TreatmentPlanStatus;
use App\Models\Appointment;
use App\Models\Consultation;
use App\Models\Doctor;
use App\Models\DoctorSchedule;
use App\Models\OdontogramEntry;
use App\Models\Patient;
use App\Models\Prescription;
use App\Models\Specialty;
use App\Models\Treatment;
use App\Models\TreatmentPlan;
use App\Models\User;
use Illuminate\Database\Seeder;

class ClinicSeeder extends Seeder
{
    public function run(): void
    {
        $encargado = User::where('email', 'encargado@clinica.test')->firstOrFail();
        $doctorUser = User::where('email', 'doctor@clinica.test')->firstOrFail();
        $doctor2User = User::where('email', 'doctor2@clinica.test')->firstOrFail();
        $patientUser = User::where('email', 'paciente@clinica.test')->firstOrFail();

        $specialties = [
            ['name' => 'Odontología General', 'color' => '#0ea5e9', 'description' => 'Atención odontológica integral.'],
            ['name' => 'Ortodoncia', 'color' => '#8b5cf6', 'description' => 'Corrección de la posición dental.'],
            ['name' => 'Endodoncia', 'color' => '#f59e0b', 'description' => 'Tratamiento de conductos radiculares.'],
            ['name' => 'Cirugía Oral', 'color' => '#ef4444', 'description' => 'Extracciones y procedimientos quirúrgicos.'],
            ['name' => 'Periodoncia', 'color' => '#10b981', 'description' => 'Salud de encías y tejidos de soporte.'],
            ['name' => 'Odontopediatría', 'color' => '#ec4899', 'description' => 'Atención dental para niños.'],
        ];

        $specialtyModels = [];
        foreach ($specialties as $specialty) {
            $specialtyModels[$specialty['name']] = Specialty::updateOrCreate(
                ['name' => $specialty['name']],
                ['description' => $specialty['description'], 'color' => $specialty['color'], 'active' => true],
            );
        }

        $doctor = Doctor::updateOrCreate(
            ['user_id' => $doctorUser->id],
            [
                'specialty_id' => $specialtyModels['Odontología General']->id,
                'license_number' => 'MAT-0001',
                'hire_date' => now()->subYears(6)->toDateString(),
                'commission_rate' => 30,
                'color' => '#0ea5e9',
                'active' => true,
            ],
        );

        $doctor2 = Doctor::updateOrCreate(
            ['user_id' => $doctor2User->id],
            [
                'specialty_id' => $specialtyModels['Ortodoncia']->id,
                'license_number' => 'MAT-0002',
                'hire_date' => now()->subYears(3)->toDateString(),
                'commission_rate' => 35,
                'color' => '#8b5cf6',
                'active' => true,
            ],
        );

        foreach ([$doctor, $doctor2] as $index => $doctorModel) {
            foreach ([1, 2, 3, 4, 5] as $weekday) {
                foreach ([['08:00', '12:00'], ['14:00', '18:00']] as [$start, $end]) {
                    DoctorSchedule::updateOrCreate(
                        ['doctor_id' => $doctorModel->id, 'weekday' => $weekday, 'start_time' => $start],
                        [
                            'end_time' => $end,
                            'slot_minutes' => 30,
                            'room' => 'Consultorio '.($index + 1),
                            'active' => true,
                        ],
                    );
                }
            }
        }

        $patient = Patient::updateOrCreate(
            ['user_id' => $patientUser->id],
            [
                'code' => 'PAC-0001',
                'first_name' => 'María',
                'last_name' => 'López',
                'ci' => '12345678',
                'birth_date' => '1992-04-18',
                'gender' => 'Femenino',
                'phone' => '70000006',
                'email' => 'paciente@clinica.test',
                'address' => 'Av. Cristo Redentor #123',
                'blood_type' => 'O+',
                'allergies' => 'Penicilina',
                'medical_notes' => 'Paciente con sensibilidad dental.',
                'emergency_contact_name' => 'José López',
                'emergency_contact_phone' => '70000007',
                'active' => true,
                'created_by' => $encargado->id,
            ],
        );

        Patient::updateOrCreate(
            ['code' => 'PAC-0002'],
            [
                'first_name' => 'Luis',
                'last_name' => 'Mamani',
                'ci' => '87654321',
                'birth_date' => '1985-11-02',
                'gender' => 'Masculino',
                'phone' => '70000008',
                'address' => 'Barrio Equipetrol',
                'blood_type' => 'A+',
                'active' => true,
                'created_by' => $encargado->id,
            ],
        );

        Patient::updateOrCreate(
            ['code' => 'PAC-0003'],
            [
                'first_name' => 'Valentina',
                'last_name' => 'Suárez',
                'ci' => '11223344',
                'birth_date' => '2015-06-25',
                'gender' => 'Femenino',
                'phone' => '70000009',
                'address' => 'Barrio Las Palmas',
                'blood_type' => 'B+',
                'allergies' => 'Ninguna',
                'active' => true,
                'created_by' => $encargado->id,
            ],
        );

        $treatmentData = [
            ['code' => 'TR-001', 'name' => 'Consulta odontológica', 'category' => 'Diagnóstico', 'price' => 80, 'duration_minutes' => 30],
            ['code' => 'TR-002', 'name' => 'Limpieza dental', 'category' => 'Prevención', 'price' => 150, 'duration_minutes' => 45],
            ['code' => 'TR-003', 'name' => 'Obturación con resina', 'category' => 'Operatoria', 'price' => 350, 'duration_minutes' => 60],
            ['code' => 'TR-004', 'name' => 'Endodoncia unirradicular', 'category' => 'Endodoncia', 'price' => 900, 'duration_minutes' => 90],
            ['code' => 'TR-005', 'name' => 'Extracción simple', 'category' => 'Cirugía', 'price' => 250, 'duration_minutes' => 45],
            ['code' => 'TR-006', 'name' => 'Corona de porcelana', 'category' => 'Rehabilitación', 'price' => 1200, 'duration_minutes' => 90],
            ['code' => 'TR-007', 'name' => 'Control de ortodoncia', 'category' => 'Ortodoncia', 'price' => 200, 'duration_minutes' => 30],
            ['code' => 'TR-008', 'name' => 'Sellantes preventivos', 'category' => 'Odontopediatría', 'price' => 120, 'duration_minutes' => 30],
        ];

        $treatments = [];
        foreach ($treatmentData as $treatment) {
            $treatments[$treatment['code']] = Treatment::updateOrCreate(
                ['code' => $treatment['code']],
                [
                    'name' => $treatment['name'],
                    'category' => $treatment['category'],
                    'price' => $treatment['price'],
                    'duration_minutes' => $treatment['duration_minutes'],
                    'active' => true,
                ],
            );
        }

        $appointment = Appointment::updateOrCreate(
            ['patient_id' => $patient->id, 'doctor_id' => $doctor->id, 'scheduled_at' => now()->setTime(9, 0)],
            [
                'created_by' => $encargado->id,
                'duration_minutes' => 30,
                'status' => AppointmentStatus::Programada,
                'reason' => 'Dolor en molar inferior derecho',
            ],
        );

        Appointment::updateOrCreate(
            ['patient_id' => $patient->id, 'doctor_id' => $doctor2->id, 'scheduled_at' => now()->addDay()->setTime(10, 0)],
            [
                'created_by' => $encargado->id,
                'duration_minutes' => 30,
                'status' => AppointmentStatus::Confirmada,
                'reason' => 'Control de ortodoncia',
            ],
        );

        $consultation = Consultation::updateOrCreate(
            ['code' => 'CON-0001'],
            [
                'patient_id' => $patient->id,
                'doctor_id' => $doctor->id,
                'appointment_id' => $appointment->id,
                'consulted_at' => now()->setTime(9, 15),
                'reason' => 'Dolor en molar inferior derecho',
                'diagnosis' => 'Caries oclusal en pieza 46',
                'observations' => 'Se realiza obturación con resina.',
                'status' => ConsultationStatus::Cerrada,
            ],
        );

        $odontogram = [
            ['tooth' => 46, 'surface' => 'oclusal', 'condition' => 'caries', 'notes' => 'Caries profunda'],
            ['tooth' => 16, 'surface' => 'mesial', 'condition' => 'obturado', 'notes' => null],
            ['tooth' => 36, 'surface' => null, 'condition' => 'sano', 'notes' => null],
        ];

        foreach ($odontogram as $entry) {
            OdontogramEntry::updateOrCreate(
                [
                    'consultation_id' => $consultation->id,
                    'patient_id' => $patient->id,
                    'tooth' => $entry['tooth'],
                    'surface' => $entry['surface'],
                ],
                [
                    'condition' => $entry['condition'],
                    'notes' => $entry['notes'],
                    'recorded_by' => $doctorUser->id,
                    'recorded_at' => now()->setTime(9, 20),
                ],
            );
        }

        $plan = TreatmentPlan::updateOrCreate(
            ['code' => 'TP-0001'],
            [
                'patient_id' => $patient->id,
                'doctor_id' => $doctor->id,
                'consultation_id' => $consultation->id,
                'status' => TreatmentPlanStatus::Aprobado,
                'start_date' => now()->toDateString(),
                'end_date' => now()->addMonth()->toDateString(),
                'notes' => 'Plan de rehabilitación oral.',
                'created_by' => $doctorUser->id,
            ],
        );

        $plan->items()->delete();
        $planItems = [
            ['treatment_id' => $treatments['TR-003']->id, 'tooth' => 46, 'unit_price' => 350, 'subtotal' => 350],
            ['treatment_id' => $treatments['TR-002']->id, 'tooth' => null, 'unit_price' => 150, 'subtotal' => 150],
            ['treatment_id' => $treatments['TR-006']->id, 'tooth' => 16, 'unit_price' => 1200, 'subtotal' => 1200],
        ];

        foreach ($planItems as $item) {
            $plan->items()->create([
                'treatment_id' => $item['treatment_id'],
                'tooth' => $item['tooth'],
                'quantity' => 1,
                'unit_price' => $item['unit_price'],
                'subtotal' => $item['subtotal'],
                'status' => TreatmentItemStatus::Pendiente,
                'sessions_planned' => 1,
                'sessions_done' => 0,
            ]);
        }

        $plan->update(['total' => collect($planItems)->sum('subtotal')]);

        $prescription = Prescription::updateOrCreate(
            ['code' => 'RX-0001'],
            [
                'consultation_id' => $consultation->id,
                'patient_id' => $patient->id,
                'doctor_id' => $doctor->id,
                'issued_at' => now()->setTime(9, 45),
                'notes' => 'Tomar según indicaciones.',
            ],
        );

        $prescription->items()->delete();
        $prescription->items()->createMany([
            [
                'medication' => 'Ibuprofeno',
                'presentation' => 'Tabletas 400 mg',
                'dose' => '1 tableta',
                'frequency' => 'Cada 8 horas',
                'duration' => '3 días',
                'quantity' => 9,
                'instructions' => 'Tomar después de las comidas.',
            ],
            [
                'medication' => 'Amoxicilina',
                'presentation' => 'Cápsulas 500 mg',
                'dose' => '1 cápsula',
                'frequency' => 'Cada 8 horas',
                'duration' => '7 días',
                'quantity' => 21,
                'instructions' => 'Completar el tratamiento antibiótico.',
            ],
        ]);
    }
}
