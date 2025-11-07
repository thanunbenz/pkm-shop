import { ProductSearch } from '@/components/ProductSearch';
import { ProductStatus } from '@prisma/client';

export const metadata = {
  title: 'Search Products | PKM Shop',
  description: 'Search for Pokemon TCG products - Booster Boxes, Packs, and Promo items',
};

interface SearchPageProps {
  searchParams: {
    q?: string;
    category?: ProductStatus;
  };
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ProductSearch
        initialQuery={searchParams.q}
        initialCategory={searchParams.category}
      />
    </div>
  );
}
