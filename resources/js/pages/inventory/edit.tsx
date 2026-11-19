import { Head } from '@inertiajs/react';
import { PageHeader } from '@/components/page-header';
import type { Product, ProductCategoryRef, SupplierRef } from '@/types';
import { ProductForm } from './product-form';

type Props = {
    product: Product;
    categories: ProductCategoryRef[];
    suppliers: SupplierRef[];
    units: string[];
};

export default function InventoryEdit({
    product,
    categories,
    suppliers,
    units,
}: Props) {
    return (
        <>
            <Head title={`Editar ${product.name}`} />
            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <PageHeader
                    eyebrow="Inventario"
                    title={product.name}
                    description={`${product.sku} · Stock actual ${product.stock}`}
                />
                <ProductForm
                    product={product}
                    categories={categories}
                    suppliers={suppliers}
                    units={units}
                />
            </div>
        </>
    );
}
