<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_methods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type', 30);
            $table->string('provider', 40)->nullable();
            $table->string('alias')->nullable();
            $table->string('last4', 4)->nullable();
            $table->string('card_brand', 20)->nullable();
            $table->string('token')->nullable();
            $table->boolean('is_default')->default(false);
            $table->string('status', 20)->default('activo');
            $table->date('expires_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'is_default']);
        });

        Schema::create('payment_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('patient_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('treatment_plan_id')->nullable()->constrained()->nullOnDelete();
            $table->string('concept');
            $table->decimal('total', 12, 2);
            $table->unsignedSmallInteger('installments_count');
            $table->string('frequency', 20)->default('mensual');
            $table->date('start_date');
            $table->string('status', 20)->default('activo');
            $table->decimal('paid_amount', 12, 2)->default(0);
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['user_id', 'status']);
        });

        Schema::create('payment_plan_installments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_plan_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('number');
            $table->date('due_date');
            $table->decimal('amount', 12, 2);
            $table->decimal('paid_amount', 12, 2)->default(0);
            $table->string('status', 20)->default('pendiente');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->unique(['payment_plan_id', 'number']);
            $table->index(['status', 'due_date']);
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('patient_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('payment_method_id')->nullable()->constrained()->nullOnDelete();
            $table->nullableMorphs('payable');
            $table->string('type', 30)->default('otro');
            $table->decimal('amount', 12, 2);
            $table->char('currency', 3)->default('BOB');
            $table->string('status', 20)->default('pendiente');
            $table->string('reference')->nullable()->unique();
            $table->string('gateway', 40)->nullable();
            $table->string('gateway_reference')->nullable();
            $table->jsonb('gateway_response')->nullable();
            $table->text('qr_payload')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['status', 'paid_at']);
            $table->index('type');
        });

        Schema::create('gateway_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_id')->constrained()->cascadeOnDelete();
            $table->string('gateway', 40);
            $table->string('transaction_id')->unique();
            $table->string('status', 20);
            $table->jsonb('request')->nullable();
            $table->jsonb('response')->nullable();
            $table->decimal('amount', 12, 2);
            $table->timestamps();
        });

        Schema::create('pharmacy_sales', function (Blueprint $table) {
            $table->id();
            $table->string('sale_number', 30)->unique();
            $table->foreignId('patient_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('total', 12, 2)->default(0);
            $table->string('status', 20)->default('completada');
            $table->foreignId('sold_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('sold_at');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['sold_at', 'status']);
        });

        Schema::create('pharmacy_sale_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pharmacy_sale_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('batch_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedInteger('quantity');
            $table->decimal('unit_price', 12, 2)->default(0);
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('receipts', function (Blueprint $table) {
            $table->id();
            $table->string('number', 30)->unique();
            $table->foreignId('payment_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('pharmacy_sale_id')->nullable()->constrained()->nullOnDelete();
            $table->string('document_type', 20)->default('recibo');
            $table->string('customer_name');
            $table->string('customer_tax_id', 30)->nullable();
            $table->decimal('amount', 12, 2);
            $table->timestamp('issued_at');
            $table->text('qr_data')->nullable();
            $table->string('status', 20)->default('emitido');
            $table->timestamps();

            $table->index('issued_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('receipts');
        Schema::dropIfExists('pharmacy_sale_items');
        Schema::dropIfExists('pharmacy_sales');
        Schema::dropIfExists('gateway_transactions');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('payment_plan_installments');
        Schema::dropIfExists('payment_plans');
        Schema::dropIfExists('payment_methods');
    }
};
