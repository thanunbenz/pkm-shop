'use client';

import { useState, useEffect, useRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { Product, ProductStatus } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface SearchFilters {
  query: string | null;
  category: ProductStatus | null;
  minPrice: number | null;
  maxPrice: number | null;
  onSale: boolean | null;
  sortBy: string;
}

interface SearchResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination: PaginationInfo;
    filters: SearchFilters;
  };
}

interface AutocompleteSuggestion {
  id: number;
  name: string;
  category: string;
  image: string;
  price: number;
  isOnSale: boolean;
}

interface ProductSearchProps {
  initialQuery?: string;
  initialCategory?: ProductStatus;
}

export function ProductSearch({ initialQuery = '', initialCategory }: ProductSearchProps) {
  const t = useTranslations();

  // Search state
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<string>(initialCategory || '');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [onSale, setOnSale] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [page, setPage] = useState(1);

  // Results state
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Autocomplete state
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounce search query to avoid excessive API calls
  const debouncedQuery = useDebounce(query, 300);
  const debouncedAutocomplete = useDebounce(query, 200); // Faster for autocomplete

  // Fetch products when search parameters change
  useEffect(() => {
    searchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, category, minPrice, maxPrice, onSale, sortBy, page]);

  // Fetch autocomplete suggestions
  useEffect(() => {
    if (debouncedAutocomplete.length >= 2) {
      fetchSuggestions();
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedAutocomplete]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (debouncedQuery) params.set('q', debouncedQuery);
      if (category) params.set('category', category);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      if (onSale) params.set('onSale', 'true');
      params.set('sortBy', sortBy);
      params.set('page', String(page));
      params.set('limit', '20');

      const response = await fetch(`/api/v1/products/search?${params}`);
      const data: SearchResponse = await response.json();

      if (data.success) {
        setProducts(data.data.products);
        setPagination(data.data.pagination);
      } else {
        setError('Failed to search products');
      }
    } catch (err) {
      setError('An error occurred while searching');
      console.error('[Product Search Error]', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    setLoadingSuggestions(true);

    try {
      const response = await fetch(`/api/v1/products/autocomplete?q=${encodeURIComponent(debouncedAutocomplete)}`);
      const data = await response.json();

      if (data.success) {
        setSuggestions(data.data.suggestions);
        setShowSuggestions(true);
      }
    } catch (err) {
      console.error('[Autocomplete Error]', err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleSelectSuggestion = (suggestion: AutocompleteSuggestion) => {
    setQuery(suggestion.name);
    setShowSuggestions(false);
    setPage(1);
  };

  const handleClearFilters = () => {
    setQuery('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setOnSale(false);
    setSortBy('relevance');
    setPage(1);
  };

  const hasActiveFilters = query || category || minPrice || maxPrice || onSale;

  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('search.title', { default: 'Search Products' })}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('search.subtitle', { default: 'Find your favorite Pokemon TCG products' })}
        </p>
      </div>

      {/* Search Bar with Autocomplete */}
      <div className="mb-6" ref={searchRef}>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1); // Reset to page 1 on new search
            }}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            placeholder={t('search.placeholder', { default: 'Search products by name or description...' })}
            className="w-full px-4 py-3 pl-12 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            autoComplete="off"
          />
          <svg
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>

          {/* Clear button */}
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setSuggestions([]);
                setShowSuggestions(false);
                setPage(1);
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Autocomplete Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
              {loadingSuggestions && (
                <div className="flex items-center justify-center p-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              )}

              {!loadingSuggestions && (
                <ul className="py-2">
                  {suggestions.map((suggestion) => (
                    <li key={suggestion.id}>
                      <button
                        onClick={() => handleSelectSuggestion(suggestion)}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
                      >
                        {/* Product Image */}
                        <div className="relative w-12 h-12 flex-shrink-0 rounded overflow-hidden bg-gray-100 dark:bg-gray-700">
                          {suggestion.image ? (
                            <Image
                              src={suggestion.image}
                              alt={suggestion.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {suggestion.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                              {suggestion.category}
                            </span>
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              ฿{suggestion.price.toLocaleString()}
                            </span>
                            {suggestion.isOnSale && (
                              <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                                SALE
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Arrow icon */}
                        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {/* View all results footer */}
              {!loadingSuggestions && suggestions.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2">
                  <button
                    onClick={() => {
                      setShowSuggestions(false);
                      searchProducts();
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
                  >
                    {t('search.viewAllResults', { default: 'View all results' })} →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-4 sticky top-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('search.filters', { default: 'Filters' })}
              </h2>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  {t('search.clearAll', { default: 'Clear All' })}
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('search.category', { default: 'Category' })}
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">{t('search.allCategories', { default: 'All Categories' })}</option>
                <option value="BOX">{t('category.box', { default: 'Booster Box' })}</option>
                <option value="PACK">{t('category.pack', { default: 'Booster Pack' })}</option>
                <option value="PROMO">{t('category.promo', { default: 'Promo' })}</option>
              </select>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('search.priceRange', { default: 'Price Range' })}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    setPage(1);
                  }}
                  placeholder={t('search.min', { default: 'Min' })}
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  min="0"
                />
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    setPage(1);
                  }}
                  placeholder={t('search.max', { default: 'Max' })}
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  min="0"
                />
              </div>
            </div>

            {/* On Sale Filter */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onSale}
                  onChange={(e) => {
                    setOnSale(e.target.checked);
                    setPage(1);
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('search.onSale', { default: 'On Sale Only' })}
                </span>
              </label>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('search.sortBy', { default: 'Sort By' })}
              </label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="relevance">{t('search.sort.relevance', { default: 'Relevance' })}</option>
                <option value="price_asc">{t('search.sort.priceLowHigh', { default: 'Price: Low to High' })}</option>
                <option value="price_desc">{t('search.sort.priceHighLow', { default: 'Price: High to Low' })}</option>
                <option value="newest">{t('search.sort.newest', { default: 'Newest First' })}</option>
                <option value="oldest">{t('search.sort.oldest', { default: 'Oldest First' })}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Search Results */}
        <div className="md:col-span-3">
          {/* Results Header */}
          {pagination && (
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              {t('search.showing', {
                default: 'Showing {start}-{end} of {total} results',
                start: (pagination.page - 1) * pagination.limit + 1,
                end: Math.min(pagination.page * pagination.limit, pagination.total),
                total: pagination.total,
              })}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p className="text-red-800 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && products.length === 0 && (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                {t('search.noResults', { default: 'No products found' })}
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {t('search.tryAdjusting', { default: 'Try adjusting your search or filters' })}
              </p>
            </div>
          )}

          {/* Products Grid */}
          {!loading && !error && products.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    disabled={!pagination.hasPrev}
                    onClick={() => setPage(page - 1)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    {t('search.previous', { default: 'Previous' })}
                  </button>

                  <div className="flex items-center gap-1">
                    {/* Show page numbers */}
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                      .filter((pageNum) => {
                        // Show first, last, current, and adjacent pages
                        return (
                          pageNum === 1 ||
                          pageNum === pagination.totalPages ||
                          Math.abs(pageNum - page) <= 1
                        );
                      })
                      .map((pageNum, idx, arr) => {
                        // Add ellipsis between non-consecutive pages
                        const showEllipsis = idx > 0 && pageNum - arr[idx - 1] > 1;
                        return (
                          <div key={pageNum} className="flex items-center">
                            {showEllipsis && (
                              <span className="px-2 text-gray-400">...</span>
                            )}
                            <button
                              onClick={() => setPage(pageNum)}
                              className={`px-3 py-1 rounded ${
                                pageNum === page
                                  ? 'bg-blue-600 text-white'
                                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                              }`}
                            >
                              {pageNum}
                            </button>
                          </div>
                        );
                      })}
                  </div>

                  <button
                    disabled={!pagination.hasNext}
                    onClick={() => setPage(page + 1)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    {t('search.next', { default: 'Next' })}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Product Card Component
function ProductCard({ product }: { product: Product }) {
  const t = useTranslations();

  const displayPrice = product.issale ? product.discountprice : product.price;
  const hasDiscount = product.issale && product.discountprice < product.price;

  return (
    <Link href={`/product/${product.id}`} className="group">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
        {/* Product Image */}
        <div className="relative aspect-square">
          <Image
            src={product.image || '/placeholder-product.png'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {product.issale && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
              {t('common.sale', { default: 'SALE' })}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
            {product.name}
          </h3>

          <div className="flex items-center justify-between">
            <div>
              {hasDiscount ? (
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-red-600">
                    ฿{displayPrice.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    ฿{product.price.toLocaleString()}
                  </span>
                </div>
              ) : (
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  ฿{displayPrice.toLocaleString()}
                </span>
              )}
            </div>

            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              {product.category}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
