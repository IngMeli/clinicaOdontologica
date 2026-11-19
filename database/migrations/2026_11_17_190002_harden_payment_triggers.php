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
            CREATE OR REPLACE FUNCTION apply_payment_to_installment() RETURNS TRIGGER AS $$
            DECLARE
                should_apply BOOLEAN := FALSE;
                should_reverse BOOLEAN := FALSE;
                target_installment_id BIGINT;
                target_plan_id BIGINT;
                applied_amount NUMERIC;
            BEGIN
                IF TG_OP = 'DELETE' THEN
                    should_reverse := OLD.status = 'pagado';
                    applied_amount := OLD.amount;
                    target_installment_id := OLD.payable_id;
                ELSE
                    should_apply := (TG_OP = 'INSERT' AND NEW.status = 'pagado')
                        OR (TG_OP = 'UPDATE' AND NEW.status = 'pagado' AND OLD.status IS DISTINCT FROM 'pagado');
                    should_reverse := TG_OP = 'UPDATE'
                        AND OLD.status = 'pagado'
                        AND NEW.status IS DISTINCT FROM 'pagado';
                    applied_amount := NEW.amount;
                    target_installment_id := NEW.payable_id;
                END IF;

                IF TG_OP = 'DELETE' THEN
                    IF should_reverse AND (OLD.payable_type LIKE '%PaymentPlanInstallment' OR OLD.payable_type = 'installment') THEN
                        UPDATE payment_plan_installments
                        SET paid_amount = GREATEST(paid_amount - applied_amount, 0),
                            status = CASE
                                WHEN GREATEST(paid_amount - applied_amount, 0) >= amount THEN 'pagado'
                                ELSE 'pendiente'
                            END,
                            paid_at = CASE
                                WHEN GREATEST(paid_amount - applied_amount, 0) >= amount THEN paid_at
                                ELSE NULL
                            END,
                            updated_at = NOW()
                        WHERE id = target_installment_id
                        RETURNING payment_plan_id INTO target_plan_id;

                        IF target_plan_id IS NOT NULL THEN
                            UPDATE payment_plans
                            SET paid_amount = GREATEST(paid_amount - applied_amount, 0),
                                status = CASE WHEN status = 'pagado' THEN 'activo' ELSE status END,
                                updated_at = NOW()
                            WHERE id = target_plan_id;
                        END IF;
                    END IF;

                    RETURN OLD;
                END IF;

                IF should_apply AND (NEW.payable_type LIKE '%PaymentPlanInstallment' OR NEW.payable_type = 'installment') THEN
                    UPDATE payment_plan_installments
                    SET paid_amount = paid_amount + applied_amount,
                        status = 'pagado',
                        paid_at = COALESCE(NEW.paid_at, NOW()),
                        updated_at = NOW()
                    WHERE id = target_installment_id
                    RETURNING payment_plan_id INTO target_plan_id;

                    IF target_plan_id IS NOT NULL THEN
                        UPDATE payment_plans
                        SET paid_amount = paid_amount + applied_amount,
                            status = CASE WHEN paid_amount + applied_amount >= total THEN 'pagado' ELSE status END,
                            updated_at = NOW()
                        WHERE id = target_plan_id;
                    END IF;
                ELSIF should_reverse AND (NEW.payable_type LIKE '%PaymentPlanInstallment' OR NEW.payable_type = 'installment') THEN
                    UPDATE payment_plan_installments
                    SET paid_amount = GREATEST(paid_amount - applied_amount, 0),
                        status = CASE
                            WHEN GREATEST(paid_amount - applied_amount, 0) >= amount THEN 'pagado'
                            ELSE 'pendiente'
                        END,
                        paid_at = CASE
                            WHEN GREATEST(paid_amount - applied_amount, 0) >= amount THEN paid_at
                            ELSE NULL
                        END,
                        updated_at = NOW()
                    WHERE id = target_installment_id
                    RETURNING payment_plan_id INTO target_plan_id;

                    IF target_plan_id IS NOT NULL THEN
                        UPDATE payment_plans
                        SET paid_amount = GREATEST(paid_amount - applied_amount, 0),
                            status = CASE WHEN status = 'pagado' THEN 'activo' ELSE status END,
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

            DROP TRIGGER IF EXISTS trg_payments_reverse_on_delete ON payments;
            CREATE TRIGGER trg_payments_reverse_on_delete
                AFTER DELETE ON payments
                FOR EACH ROW EXECUTE FUNCTION apply_payment_to_installment();
            SQL);
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        DB::unprepared(<<<'SQL'
            DROP TRIGGER IF EXISTS trg_payments_reverse_on_delete ON payments;

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
};
