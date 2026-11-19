import { Head } from '@inertiajs/react';
import { PageHeader } from '@/components/page-header';
import type { ProductCategoryRef, SupplierRef } from '@/types';
import { ProductForm } from './product-form';

type Props = {
    categories: ProductCategoryRef[];
    suppliers: SupplierRef[];
    units: string[];
};

export default function InventoryCreate({
    categories,
    suppliers,
    units,
}: Props) {
    return (
        <>
            <Head title="Nuevo producto" />
            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <PageHeader
                    eyebrow="Inventario"
                    title="Nuevo producto"
                    description="Registra un insumo o medicamento con su stock mínimo y precio."
                />
                <ProductForm
                    categories={categories}
                    suppliers={suppliers}
                    units={units}
                />
            </div>
        </>
    );
}
