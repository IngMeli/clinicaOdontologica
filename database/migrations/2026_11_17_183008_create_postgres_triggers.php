<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        DB::unprepared(<<<'SQL'
            CREATE OR REPLACE FUNCTION increment_page_visit_counter() RETURNS TRIGGER AS $$
            BEGIN
                INSERT INTO page_visit_counters (path, route_name, count, last_visited_at, updated_at)
                VALUES (NEW.path, NEW.route_name, 1, NOW(), NOW())
                ON CONFLICT (path) DO UPDATE
                SET count = page_visit_counters.count + 1,
                    last_visited_at = NOW(),
                    updated_at = NOW(),
                    route_name = COALESCE(EXCLUDED.route_name, page_visit_counters.route_name);
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            DROP TRIGGER IF EXISTS trg_visits_counter ON visits;
            CREATE TRIGGER trg_visits_counter
                AFTER INSERT ON visits
                FOR EACH ROW EXECUTE FUNCTION increment_page_visit_counter();

            CREATE OR REPLACE FUNCTION update_product_stock() RETURNS TRIGGER AS $$
            BEGIN
                UPDATE products
                SET stock = stock + NEW.quantity,
                    updated_at = NOW()
                WHERE id = NEW.product_id;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            DROP TRIGGER IF EXISTS trg_stock_movements_after_insert ON stock_movements;
            CREATE TRIGGER trg_stock_movements_after_insert
                AFTER INSERT ON stock_movements
                FOR EACH ROW EXECUTE FUNCTION update_product_stock();

            CREATE OR REPLACE FUNCTION apply_payment_to_installment() RETURNS TRIGGER AS $$
            DECLARE
                should_apply BOOLEAN;
                target_plan_id BIGINT;
            BEGIN
                IF TG_OP = 'INSERT' THEN
                    should_apply := NEW.status = 'pagado';
                ELSE
                    should_apply := NEW.status = 'pagado' AND OLD.status IS DISTINCT FROM 'pagado';
                END IF;

                IF should_apply AND (NEW.payable_type LIKE '%PaymentPlanInstallment' OR NEW.payable_type = 'installment') THEN
                    UPDATE payment_plan_installments
                    SET paid_amount = paid_amount + NEW.amount,
                        status = 'pagado',
                        paid_at = COALESCE(NEW.paid_at, NOW()),
                        updated_at = NOW()
                    WHERE id = NEW.payable_id
                    RETURNING payment_plan_id INTO target_plan_id;

                    IF target_plan_id IS NOT NULL THEN
                        UPDATE payment_plans
                        SET paid_amount = paid_amount + NEW.amount,
                            status = CASE WHEN paid_amount + NEW.amount >= total THEN 'pagado' ELSE status END,
                            updated_at = NOW()
                        WHERE id = target_plan_id;
                    END IF;
                END IF;

                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            DROP TRIGGER IF EXISTS trg_payments_apply ON payments;
            CREATE TRIGGER trg_payments_apply
                AFTER INSERT OR UPDATE ON payments
                FOR EACH ROW EXECUTE FUNCTION apply_payment_to_installment();
            SQL);
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        DB::unprepared(<<<'SQL'
            DROP TRIGGER IF EXISTS trg_visits_counter ON visits;
            DROP FUNCTION IF EXISTS increment_page_visit_counter();
            DROP TRIGGER IF EXISTS trg_stock_movements_after_insert ON stock_movements;
            DROP FUNCTION IF EXISTS update_product_stock();
            DROP TRIGGER IF EXISTS trg_payments_apply ON payments;
            DROP FUNCTION IF EXISTS apply_payment_to_installment();
            SQL);
    }
};
