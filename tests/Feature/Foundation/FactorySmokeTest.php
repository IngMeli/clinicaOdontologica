<?php

namespace Tests\Feature\Foundation;

use App\Models\AccessLog;
use App\Models\Appointment;
use App\Models\Batch;
use App\Models\Consultation;
use App\Models\Dispensation;
use App\Models\DispensationItem;
use App\Models\Doctor;
use App\Models\DoctorSchedule;
use App\Models\GatewayTransaction;
use App\Models\LoginAttempt;
use App\Models\MenuItem;
use App\Models\OdontogramEntry;
use App\Models\PageVisitCounter;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\PaymentMethod;
use App\Models\PaymentPlan;
use App\Models\PaymentPlanInstallment;
use App\Models\PharmacySale;
use App\Models\PharmacySaleItem;
use App\Models\Prescription;
use App\Models\PrescriptionItem;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\Receipt;
use App\Models\Specialty;
use App\Models\StockMovement;
use App\Models\Supplier;
use App\Models\Treatment;
use App\Models\TreatmentPlan;
use App\Models\TreatmentPlanItem;
use App\Models\User;
use App\Models\UserPreference;
use App\Models\Visit;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FactorySmokeTest extends TestCase
{
    use RefreshDatabase;

    public function test_all_model_factories_can_create_records(): void
    {
        foreach ($this->factories() as $name => $factory) {
            $this->assertNotNull($factory->create(), "La factory {$name} no creó un registro.");
        }
    }

    /**
     * @return array<string, Factory>
     */
    private function factories(): array
    {
        return [
            'AccessLog' => AccessLog::factory(),
            'Appointment' => Appointment::factory(),
            'Batch' => Batch::factory(),
            'Consultation' => Consultation::factory(),
            'Dispensation' => Dispensation::factory(),
            'DispensationItem' => DispensationItem::factory(),
            'Doctor' => Doctor::factory(),
            'DoctorSchedule' => DoctorSchedule::factory(),
            'GatewayTransaction' => GatewayTransaction::factory(),
            'LoginAttempt' => LoginAttempt::factory(),
            'MenuItem' => MenuItem::factory(),
            'OdontogramEntry' => OdontogramEntry::factory(),
            'PageVisitCounter' => PageVisitCounter::factory(),
            'Patient' => Patient::factory(),
            'Payment' => Payment::factory(),
            'PaymentMethod' => PaymentMethod::factory(),
            'PaymentPlan' => PaymentPlan::factory(),
            'PaymentPlanInstallment' => PaymentPlanInstallment::factory(),
            'PharmacySale' => PharmacySale::factory(),
            'PharmacySaleItem' => PharmacySaleItem::factory(),
            'Prescription' => Prescription::factory(),
            'PrescriptionItem' => PrescriptionItem::factory(),
            'Product' => Product::factory(),
            'ProductCategory' => ProductCategory::factory(),
            'Purchase' => Purchase::factory(),
            'PurchaseItem' => PurchaseItem::factory(),
            'Receipt' => Receipt::factory(),
            'Specialty' => Specialty::factory(),
            'StockMovement' => StockMovement::factory(),
            'Supplier' => Supplier::factory(),
            'Treatment' => Treatment::factory(),
            'TreatmentPlan' => TreatmentPlan::factory(),
            'TreatmentPlanItem' => TreatmentPlanItem::factory(),
            'User' => User::factory(),
            'UserPreference' => UserPreference::factory(),
            'Visit' => Visit::factory(),
        ];
    }
}
