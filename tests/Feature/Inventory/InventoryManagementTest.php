<?php

namespace Tests\Feature\Inventory;

use App\Enums\RoleName;
use App\Models\Batch;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class InventoryManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_manager_can_register_a_product_with_initial_stock(): void
    {
        $manager = $this->userWithRole(RoleName::Encargado);

        $this->actingAs($manager)
            ->get(route('inventory.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('inventory/index')
                ->has('products.data')
                ->has('metrics')
                ->has('filters'));

        $this->actingAs($manager)
            ->post(route('inventory.store'), [
                'sku' => 'GUANTE-001',
                'name' => 'Guantes de nitrilo',
                'unit' => 'caja',
                'min_stock' => 5,
                'sale_price' => 45,
                'initial_stock' => 12,
                'initial_lot' => 'LOT-GUANTE',
                'initial_expiry_date' => now()->addYear()->toDateString(),
                'initial_unit_cost' => 30,
            ])
            ->assertRedirect(route('inventory.index'));

        $product = Product::query()->where('sku', 'GUANTE-001')->firstOrFail();

        $this->assertSame(12, $product->stock);
        $this->assertDatabaseHas('batches', [
            'product_id' => $product->id,
            'lot_number' => 'LOT-GUANTE',
            'quantity' => 12,
        ]);
        $this->assertDatabaseHas('stock_movements', [
            'product_id' => $product->id,
            'type' => 'compra',
            'quantity' => 12,
            'created_by' => $manager->id,
        ]);
        $this->assertDatabaseHas('activity_log', [
            'description' => 'Producto creado',
            'subject_id' => $product->id,
        ]);
    }

    public function test_manager_can_adjust_stock_and_view_movements(): void
    {
        $manager = $this->userWithRole(RoleName::Encargado);
        $product = Product::factory()->create(['stock' => 10, 'active' => true]);

        $this->actingAs($manager)
            ->post(route('inventory.adjust.store', $product), [
                'type' => 'ajuste_negativo',
                'quantity' => 4,
                'reason' => 'Merma',
            ])
            ->assertRedirect(route('inventory.index'));

        $this->assertSame(6, $product->fresh()->stock);
        $this->assertDatabaseHas('stock_movements', [
            'product_id' => $product->id,
            'type' => 'ajuste_negativo',
            'quantity' => -4,
        ]);

        $this->actingAs($manager)
            ->post(route('inventory.adjust.store', $product), [
                'type' => 'ajuste_negativo',
                'quantity' => 99,
            ])
            ->assertSessionHasErrors('quantity');

        $this->assertSame(6, $product->fresh()->stock);

        $this->actingAs($manager)
            ->get(route('inventory.movements'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('inventory/movements')
                ->has('movements.data', 1)
                ->has('types'));
    }

    public function test_secretary_can_view_inventory_but_cannot_manage_it(): void
    {
        $secretary = $this->userWithRole(RoleName::Secretaria);
        $product = Product::factory()->create(['stock' => 3]);

        $this->actingAs($secretary)
            ->get(route('inventory.index'))
            ->assertOk();

        $this->actingAs($secretary)
            ->post(route('inventory.store'), [
                'sku' => 'NO-AUTORIZADO',
                'name' => 'Producto no autorizado',
                'unit' => 'unidad',
                'min_stock' => 1,
                'sale_price' => 10,
            ])
            ->assertForbidden();

        $this->actingAs($secretary)
            ->post(route('inventory.adjust.store', $product), [
                'type' => 'ajuste_positivo',
                'quantity' => 1,
            ])
            ->assertForbidden();

        $this->assertSame(0, StockMovement::query()->count());
    }

    public function test_batches_with_stock_are_exposed_on_the_adjust_form(): void
    {
        $manager = $this->userWithRole(RoleName::Encargado);
        $batch = Batch::factory()->create(['quantity' => 8]);

        $this->actingAs($manager)
            ->get(route('inventory.adjust', $batch->product))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('inventory/adjust')
                ->has('product')
                ->has('batches', 1)
                ->has('suppliers'));
    }

    private function userWithRole(RoleName $role): User
    {
        $user = User::factory()->create(['active' => true]);
        $user->assignRole($role->value);

        return $user;
    }
}
