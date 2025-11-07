# Product Search Implementation Guide (Issue #19)

**Date:** 2025-11-07
**Issue:** #19 - Product Search Functionality
**Status:** 🚧 IN PROGRESS (API Ready, UI Pending)
**Estimated Time:** 3-4 hours total

---

## 📋 Overview

Comprehensive product search system with full-text search, filtering, sorting, and pagination.

### Features

✅ **Completed:**
- Full-text search (name + description)
- Category filtering (BOX, PACK, PROMO)
- Price range filtering
- Sale items filtering
- Multiple sort options (relevance, price, newest)
- Pagination support
- Database indexes for performance

⏳ **Pending:**
- Search UI component
- Autocomplete/suggestions
- Search history
- Frontend integration

---

## 🎯 Search Strategy

### MySQL FULLTEXT Search

**Why FULLTEXT:**
- ✅ Fast native MySQL search
- ✅ No external dependencies
- ✅ Supports Thai + English
- ✅ Relevance scoring
- ✅ Simple to implement

**Alternative Considered:**
- ❌ ElasticSearch: Overkill for small-medium projects
- ❌ Algolia: External service, costs money
- ⚠️ LIKE queries: Slower, no relevance scoring

---

## 🔧 Implementation

### 1. Database Indexes

**File:** `docs/03-development/PRODUCT_SEARCH_MIGRATION.sql`

```sql
-- Add FULLTEXT index for search
ALTER TABLE `Product` ADD FULLTEXT INDEX `product_search_idx` (`name`, `description`);

-- Add regular indexes for filtering/sorting
ALTER TABLE `Product` ADD INDEX `Product_price_idx` (`price`);
ALTER TABLE `Product` ADD INDEX `Product_createdAt_idx` (`createdAt`);
```

**Run Migration:**
```bash
# Connect to MySQL
mysql -u root -p pkm_shop < docs/03-development/PRODUCT_SEARCH_MIGRATION.sql

# Or using Prisma (after creating migration)
npx prisma db push
```

---

### 2. Search API Endpoint

**File:** `src/app/api/v1/products/search/route.ts`

#### Endpoint

```
GET /api/v1/products/search
```

#### Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `q` | string | Search query | `pokemon` |
| `category` | enum | BOX, PACK, PROMO | `PACK` |
| `minPrice` | number | Minimum price | `100` |
| `maxPrice` | number | Maximum price | `500` |
| `onSale` | boolean | Filter sale items | `true` |
| `sortBy` | enum | relevance, price_asc, price_desc, newest, oldest | `price_asc` |
| `page` | number | Page number (default: 1) | `2` |
| `limit` | number | Items per page (default: 20, max: 100) | `50` |

#### Examples

```bash
# Basic search
GET /api/v1/products/search?q=pokemon

# Search with category filter
GET /api/v1/products/search?q=booster&category=PACK

# Price range filter
GET /api/v1/products/search?q=card&minPrice=100&maxPrice=500

# Sale items sorted by price
GET /api/v1/products/search?category=BOX&onSale=true&sortBy=price_asc

# Pagination
GET /api/v1/products/search?q=pokemon&page=2&limit=50
```

#### Response Format

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "name": "Pokemon Booster Pack",
        "description": "...",
        "price": 150,
        "discountprice": 120,
        "issale": true,
        "category": "PACK",
        "image": "...",
        "createdAt": "2025-11-07T..."
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    },
    "filters": {
      "query": "pokemon",
      "category": "PACK",
      "minPrice": null,
      "maxPrice": null,
      "onSale": true,
      "sortBy": "relevance"
    }
  }
}
```

---

### 3. Search UI Component (TODO)

**File:** `src/components/ProductSearch.tsx` (to be created)

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

export function ProductSearch() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [onSale, setOnSale] = useState<boolean | null>(null);
  const [sortBy, setSortBy] = useState('relevance');
  const [page, setPage] = useState(1);

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    searchProducts();
  }, [debouncedQuery, category, minPrice, maxPrice, onSale, sortBy, page]);

  const searchProducts = async () => {
    setLoading(true);

    const params = new URLSearchParams();
    if (debouncedQuery) params.set('q', debouncedQuery);
    if (category) params.set('category', category);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (onSale !== null) params.set('onSale', String(onSale));
    params.set('sortBy', sortBy);
    params.set('page', String(page));

    const response = await fetch(`/api/v1/products/search?${params}`);
    const data = await response.json();

    if (data.success) {
      setProducts(data.data.products);
      setPagination(data.data.pagination);
    }

    setLoading(false);
  };

  return (
    <div className="container mx-auto p-4">
      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="w-full p-3 border rounded-lg"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="md:col-span-1">
          <div className="space-y-4">
            {/* Category Filter */}
            <div>
              <label className="font-semibold">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">All Categories</option>
                <option value="BOX">Booster Box</option>
                <option value="PACK">Booster Pack</option>
                <option value="PROMO">Promo</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="font-semibold">Price Range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min"
                  className="w-1/2 p-2 border rounded"
                />
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max"
                  className="w-1/2 p-2 border rounded"
                />
              </div>
            </div>

            {/* On Sale Filter */}
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={onSale === true}
                  onChange={(e) => setOnSale(e.target.checked ? true : null)}
                />
                <span>On Sale Only</span>
              </label>
            </div>

            {/* Sort By */}
            <div>
              <label className="font-semibold">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="relevance">Relevance</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Search Results */}
        <div className="md:col-span-3">
          {loading ? (
            <div>Loading...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {pagination && (
                <div className="mt-6 flex justify-center gap-2">
                  <button
                    disabled={!pagination.hasPrev}
                    onClick={() => setPage(page - 1)}
                    className="px-4 py-2 border rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    disabled={!pagination.hasNext}
                    onClick={() => setPage(page + 1)}
                    className="px-4 py-2 border rounded disabled:opacity-50"
                  >
                    Next
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
```

---

### 4. Autocomplete (TODO)

**File:** `src/app/api/v1/products/autocomplete/route.ts` (to be created)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';

  if (!query.trim()) {
    return NextResponse.json({ suggestions: [] });
  }

  // Get top 10 matching product names
  const products = await prisma.product.findMany({
    where: {
      name: {
        contains: query,
        mode: 'insensitive',
      },
    },
    select: {
      id: true,
      name: true,
    },
    take: 10,
    orderBy: {
      name: 'asc',
    },
  });

  return NextResponse.json({
    suggestions: products.map((p) => ({
      id: p.id,
      name: p.name,
    })),
  });
}
```

---

## 🧪 Testing

### Manual Testing

```bash
# Test basic search
curl "http://localhost:3000/api/v1/products/search?q=pokemon"

# Test with filters
curl "http://localhost:3000/api/v1/products/search?q=booster&category=PACK&minPrice=100&maxPrice=500"

# Test pagination
curl "http://localhost:3000/api/v1/products/search?q=card&page=2&limit=10"

# Test autocomplete
curl "http://localhost:3000/api/v1/products/autocomplete?q=poke"
```

### Performance Testing

```sql
-- Test FULLTEXT search performance
EXPLAIN SELECT * FROM Product
WHERE MATCH(name, description) AGAINST('pokemon' IN NATURAL LANGUAGE MODE);

-- Should use product_search_idx index
```

---

## 📊 Performance Considerations

### Indexes Created

- ✅ FULLTEXT `product_search_idx` (name, description)
- ✅ Regular index on `price`
- ✅ Regular index on `createdAt`
- ✅ Existing indexes: `issale`, `isrecommend`, `category`

### Expected Performance

- **Search Query:** < 50ms (with FULLTEXT)
- **Filtered Search:** < 100ms
- **Pagination:** < 50ms
- **Autocomplete:** < 30ms

### Optimization Tips

1. **Use FULLTEXT for relevance:** Better than LIKE queries
2. **Limit results:** Max 100 items per page
3. **Cache popular searches:** Consider Redis caching
4. **Debounce search input:** 300ms delay
5. **Index all filterable columns:** Already done ✅

---

## 🔐 Security Considerations

- ✅ Input validation (limit, page numbers)
- ✅ SQL injection prevention (Prisma ORM)
- ✅ Max limit enforcement (100 items)
- ✅ Rate limiting (apply same as other endpoints)

---

## 📚 Related Files

**Created:**
- `src/app/api/v1/products/search/route.ts` - Search API
- `docs/03-development/PRODUCT_SEARCH_MIGRATION.sql` - Database migration
- `docs/03-development/PRODUCT_SEARCH_IMPLEMENTATION.md` - This file

**To Create:**
- `src/components/ProductSearch.tsx` - Search UI component
- `src/app/api/v1/products/autocomplete/route.ts` - Autocomplete API
- `src/hooks/useDebounce.ts` - Debounce hook

**Modified:**
- `prisma/schema.prisma` - Added index comments

---

## ✅ Implementation Checklist

### Phase 1: Backend (✅ COMPLETE)
- [x] Design search architecture
- [x] Create FULLTEXT index migration
- [x] Add price and createdAt indexes
- [x] Create search API endpoint
- [x] Add pagination support
- [x] Add filtering (category, price, sale)
- [x] Add sorting options
- [x] Test API endpoints

### Phase 2: Frontend (⏳ TODO)
- [ ] Create ProductSearch component
- [ ] Add search bar UI
- [ ] Add filters sidebar
- [ ] Add results grid
- [ ] Add pagination UI
- [ ] Create autocomplete API
- [ ] Add autocomplete UI
- [ ] Test search UX
- [ ] Mobile responsive design

### Phase 3: Polish (⏳ TODO)
- [ ] Add loading states
- [ ] Add empty states
- [ ] Add error handling
- [ ] Performance optimization
- [ ] SEO optimization (search results page)
- [ ] Analytics tracking

---

## 🚀 Deployment

### Before Deploy

1. **Run Migration:**
   ```bash
   mysql -u root -p pkm_shop < docs/03-development/PRODUCT_SEARCH_MIGRATION.sql
   ```

2. **Verify Indexes:**
   ```sql
   SHOW INDEXES FROM Product;
   ```

3. **Test Search:**
   ```bash
   curl "http://localhost:3000/api/v1/products/search?q=test"
   ```

### Production Checklist

- [ ] FULLTEXT index created
- [ ] Regular indexes created
- [ ] API tested with real data
- [ ] Performance tested (< 100ms)
- [ ] Rate limiting applied
- [ ] Monitoring enabled
- [ ] Error tracking setup

---

**Last Updated:** 2025-11-07
**Status:** Backend Complete, Frontend Pending
**Next Steps:** Create UI components and autocomplete
