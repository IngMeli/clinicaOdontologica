<?php

namespace Database\Seeders;

use App\Enums\StockMovementType;
use App\Models\Batch;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Purchase;
use App\Models\StockMovement;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Database\Seeder;

class InventorySeeder extends Seeder
{
    public function run(): void
    {
        $encargado = User::where('email', 'encargado@clinica.test')->firstOrFail();

        $supplier = Supplier::updateOrCreate(
            ['name' => 'Dental Supply Bolivia'],
            [
                'tax_id' => '1020304050',
                'contact_name' => 'Roberto Vargas',
                'phone' => '33344455',
                'email' => 'ventas@dentalsupply.test',
                'address' => 'Av. América #456',
                'active' => true,
            ],
        );

        $categories = [];
        foreach (['Insumos', 'Medicamentos', 'Material dental'] as $name) {
            $categories[$name] = ProductCategory::updateOrCreate(['name' => $name], ['description' => null]);
        }

        $productData = [
            ['sku' => 'GLOVES-NIT', 'name' => 'Guantes de nitrilo', 'category' => 'Insumos', 'unit' => 'caja', 'min_stock' => 100, 'sale_price' => 1.5],
            ['sku' => 'ANEST-LIDO', 'name' => 'Anestesia lidocaína 2%', 'category' => 'Medicamentos', 'unit' => 'frasco', 'min_stock' => 20, 'sale_price' => 25],
            ['sku' => 'RESIN-A2', 'name' => 'Resina compuesta A2', 'category' => 'Material dental', 'unit' => 'jeringa', 'min_stock' => 10, 'sale_price' => 120],
            ['sku' => 'IBU-400', 'name' => 'Ibuprofeno 400 mg', 'category' => 'Medicamentos', 'unit' => 'tableta', 'min_stock' => 30, 'sale_price' => 5],
            ['sku' => 'GASAS-EST', 'name' => 'Gasas estériles', 'category' => 'Insumos', 'unit' => 'paquete', 'min_stock' => 50, 'sale_price' => 2],
        ];

        $products = [];
        foreach ($productData as $data) {
            $products[$data['sku']] = Product::updateOrCreate(
                ['sku' => $data['sku']],
                [
                    'category_id' => $categories[$data['category']]->id,
                    'name' => $data['name'],
                    'unit' => $data['unit'],
                    'min_stock' => $data['min_stock'],
                    'sale_price' => $data['sale_price'],
                    'active' => true,
                ],
            );
        }

        $batchData = [
            ['sku' => 'GLOVES-NIT', 'lot' => 'LOT-GLO-001', 'quantity' => 200, 'cost' => 0.8, 'expiry' => now()->addYear()->toDateString()],
            ['sku' => 'ANEST-LIDO', 'lot' => 'LOT-ANE-001', 'quantity' => 50, 'cost' => 15, 'expiry' => now()->addMonths(8)->toDateString()],
            ['sku' => 'RESIN-A2', 'lot' => 'LOT-RES-001', 'quantity' => 30, 'cost' => 70, 'expiry' => now()->addMonths(14)->toDateString()],
            ['sku' => 'IBU-400', 'lot' => 'LOT-IBU-001', 'quantity' => 120, 'cost' => 2, 'expiry' => now()->addMonths(18)->toDateString()],
            ['sku' => 'GASAS-EST', 'lot' => 'LOT-GAS-001', 'quantity' => 80, 'cost' => 1, 'expiry' => now()->addMonths(24)->toDateString()],
        ];

        $batches = [];
        foreach ($batchData as $data) {
            $batches[$data['sku']] = Batch::updateOrCreate(
                ['product_id' => $products[$data['sku']]->id, 'lot_number' => $data['lot']],
                [
                    'supplier_id' => $supplier->id,
                    'quantity' => $data['quantity'],
                    'unit_cost' => $data['cost'],
                    'expiry_date' => $data['expiry'],
                ],
            );
        }

        $purchase = Purchase::updateOrCreate(
            ['invoice_number' => 'FAC-0001'],
            [
                'supplier_id' => $supplier->id,
                'purchased_at' => now()->subDays(3)->toDateString(),
                'status' => 'recibida',
                'created_by' => $encargado->id,
            ],
        );

        $purchase->items()->delete();
        $purchaseItems = [
            ['sku' => 'GLOVES-NIT', 'quantity' => 200, 'unit_cost' => 0.8],
            ['sku' => 'ANEST-LIDO', 'quantity' => 50, 'unit_cost' => 15],
            ['sku' => 'RESIN-A2', 'quantity' => 30, 'unit_cost' => 70],
        ];

        foreach ($purchaseItems as $item) {
            $purchase->items()->create([
                'product_id' => $products[$item['sku']]->id,
                'lot_number' => $batches[$item['sku']]->lot_number,
                'expiry_date' => $batches[$item['sku']]->expiry_date,
                'quantity' => $item['quantity'],
                'unit_cost' => $item['unit_cost'],
                'subtotal' => $item['quantity'] * $item['unit_cost'],
            ]);
        }

        $subtotal = collect($purchaseItems)->sum(fn ($item) => $item['quantity'] * $item['unit_cost']);
        $purchase->update(['subtotal' => $subtotal, 'tax' => 0, 'total' => $subtotal]);

        foreach ($batchData as $data) {
            $exists = StockMovement::where('product_id', $products[$data['sku']]->id)
                ->where('reason', 'Carga inicial')
                ->exists();

            if ($exists) {
                continue;
            }

            StockMovement::create([
                'product_id' => $products[$data['sku']]->id,
                'batch_id' => $batches[$data['sku']]->id,
                'type' => StockMovementType::Compra,
                'quantity' => $data['quantity'],
                'unit_cost' => $data['cost'],
                'reference_type' => Purchase::class,
                'reference_id' => $purchase->id,
                'reason' => 'Carga inicial',
                'created_by' => $encargado->id,
            ]);
        }
    }
}
