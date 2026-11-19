<?php

namespace Tests\Feature\Pharmacy;

use App\Enums\RoleName;
use App\Models\Patient;
use App\Models\PharmacySale;
use App\Models\Product;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PharmacySaleManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_secretary_can_sell_products_and_cancel_the_sale(): void
    {
        $secretary = $this->userWithRole(RoleName::Secretaria);
        $patient = Patient::factory()->create();
        $product = Product::factory()->create([
            'stock' => 10,
            'sale_price' => 20,
            'active' => true,
        ]);

        $this->actingAs($secretary)
            ->get(route('pharmacy-sales.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('pharmacy-sales/index')
                ->has('sales.data')
                ->has('metrics'));

        $this->actingAs($secretary)
            ->post(route('pharmacy-sales.store'), [
                'patient_id' => $patient->id,
                'discount' => 5,
                'items' => [
                    ['product_id' => $product->id, 'quantity' => 2],
                ],
            ])
            ->assertRedirect();

        $sale = PharmacySale::query()->firstOrFail();

        $this->assertSame('completada', $sale->status);
        $this->assertSame('40.00', $sale->subtotal);
        $this->assertSame('35.00', $sale->total);
        $this->assertSame(8, $product->fresh()->stock);
        $this->assertDatabaseHas('stock_movements', [
            'product_id' => $product->id,
            'type' => 'venta',
            'quantity' => -2,
        ]);
        $this->assertDatabaseHas('payments', [
            'payable_type' => 'pharmacy_sale',
            'payable_id' => $sale->id,
            'type' => 'farmacia',
            'amount' => 35,
            'status' => 'pagado',
        ]);
        $this->assertDatabaseHas('receipts', [
            'pharmacy_sale_id' => $sale->id,
            'amount' => 35,
        ]);

        $this->actingAs($secretary)
            ->get(route('pharmacy-sales.show', $sale))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('pharmacy-sales/show')
                ->where('sale.id', $sale->id)
                ->where('canCancel', false));

        $this->actingAs($this->userWithRole(RoleName::Encargado))
            ->patch(route('pharmacy-sales.cancel', $sale))
            ->assertRedirect();

        $this->assertSame('anulada', $sale->fresh()->status);
        $this->assertSame(10, $product->fresh()->stock);
        $this->assertDatabaseHas('payments', [
            'payable_id' => $sale->id,
            'status' => 'anulado',
        ]);
    }

    public function test_sale_is_rejected_when_stock_is_insufficient(): void
    {
        $secretary = $this->userWithRole(RoleName::Secretaria);
        $product = Product::factory()->create(['stock' => 1, 'active' => true]);

        $this->actingAs($secretary)
            ->post(route('pharmacy-sales.store'), [
                'items' => [
                    ['product_id' => $product->id, 'quantity' => 2],
                ],
            ])
            ->assertSessionHasErrors('items');

        $this->assertSame(1, $product->fresh()->stock);
        $this->assertSame(0, PharmacySale::query()->count());
    }

    public function test_doctor_cannot_access_pharmacy_sales(): void
    {
        $doctor = $this->userWithRole(RoleName::Doctor);

        $this->actingAs($doctor)
            ->get(route('pharmacy-sales.index'))
            ->assertForbidden();
    }

    private function userWithRole(RoleName $role): User
    {
        $user = User::factory()->create(['active' => true]);
        $user->assignRole($role->value);

        return $user;
    }
}
