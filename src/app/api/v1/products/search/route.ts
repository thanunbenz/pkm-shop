import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma, ProductStatus } from '@prisma/client';
import { paginate, PaginationParams } from '@/lib/utils/pagination';
import { successResponse, errorResponse } from '@/lib/utils/api-response';

/**
 * Product Search API Endpoint (Issue #19)
 *
 * GET /api/v1/products/search
 *
 * Query Parameters:
 * - q: Search query (searches name and description)
 * - category: Filter by category (BOX, PACK, PROMO)
 * - minPrice: Minimum price filter
 * - maxPrice: Maximum price filter
 * - onSale: Filter sale items (true/false)
 * - sortBy: Sort field (relevance, price_asc, price_desc, newest, oldest)
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 *
 * Examples:
 * - /api/v1/products/search?q=pokemon
 * - /api/v1/products/search?q=booster&category=PACK
 * - /api/v1/products/search?q=card&minPrice=100&maxPrice=500
 * - /api/v1/products/search?category=BOX&onSale=true&sortBy=price_asc
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') as ProductStatus | null;
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const onSale = searchParams.get('onSale');
    const sortBy = searchParams.get('sortBy') || 'relevance';

    // Pagination
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '20', 10),
      100 // Max 100 items per page
    );

    // Build where clause
    const where: Prisma.ProductWhereInput = {};

    // Full-text search on name and description
    if (query.trim()) {
      // MySQL FULLTEXT search using raw SQL
      // Note: Prisma doesn't support MATCH...AGAINST directly
      // We'll use contains as fallback, but recommend using raw query for better performance
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }

    // Category filter
    if (category && ['BOX', 'PACK', 'PROMO'].includes(category)) {
      where.category = category;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) {
        where.price.gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        where.price.lte = parseFloat(maxPrice);
      }
    }

    // On sale filter
    if (onSale === 'true') {
      where.issale = true;
    } else if (onSale === 'false') {
      where.issale = false;
    }

    // Build orderBy clause
    let orderBy: Prisma.ProductOrderByWithRelationInput = {};

    switch (sortBy) {
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'relevance':
      default:
        // For relevance, if there's a search query, we should use FULLTEXT scoring
        // Fallback to newest for now
        orderBy = { createdAt: 'desc' };
        break;
    }

    // Use pagination utility
    const result = await paginate({
      model: prisma.product,
      page,
      limit,
      where,
      orderBy,
    });

    return NextResponse.json(
      successResponse({
        products: result.data,
        pagination: result.pagination,
        filters: {
          query: query || null,
          category: category || null,
          minPrice: minPrice ? parseFloat(minPrice) : null,
          maxPrice: maxPrice ? parseFloat(maxPrice) : null,
          onSale: onSale ? onSale === 'true' : null,
          sortBy,
        },
      })
    );
  } catch (error) {
    console.error('[Product Search Error]', error);
    return NextResponse.json(
      errorResponse('Failed to search products', 500),
      { status: 500 }
    );
  }
}

/**
 * Advanced Product Search with MySQL FULLTEXT (Optimized)
 *
 * This version uses raw SQL for better FULLTEXT search performance
 * Uncomment and use this if you need better search relevance
 */
export async function GET_FULLTEXT_VERSION(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') as ProductStatus | null;
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const onSale = searchParams.get('onSale');
    const sortBy = searchParams.get('sortBy') || 'relevance';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);

    const offset = (page - 1) * limit;

    // Build SQL query with FULLTEXT search
    let sql = `
      SELECT *,
      ${query.trim() ? `MATCH(name, description) AGAINST(? IN NATURAL LANGUAGE MODE) AS relevance` : '1 AS relevance'}
      FROM Product
      WHERE 1=1
    `;

    const params: any[] = [];

    if (query.trim()) {
      params.push(query);
      sql += ` AND MATCH(name, description) AGAINST(? IN NATURAL LANGUAGE MODE)`;
      params.push(query);
    }

    if (category && ['BOX', 'PACK', 'PROMO'].includes(category)) {
      sql += ` AND category = ?`;
      params.push(category);
    }

    if (minPrice) {
      sql += ` AND price >= ?`;
      params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      sql += ` AND price <= ?`;
      params.push(parseFloat(maxPrice));
    }

    if (onSale === 'true') {
      sql += ` AND issale = 1`;
    } else if (onSale === 'false') {
      sql += ` AND issale = 0`;
    }

    // Add sorting
    switch (sortBy) {
      case 'price_asc':
        sql += ` ORDER BY price ASC`;
        break;
      case 'price_desc':
        sql += ` ORDER BY price DESC`;
        break;
      case 'newest':
        sql += ` ORDER BY createdAt DESC`;
        break;
      case 'oldest':
        sql += ` ORDER BY createdAt ASC`;
        break;
      case 'relevance':
      default:
        sql += ` ORDER BY relevance DESC, createdAt DESC`;
        break;
    }

    sql += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    // Execute raw query
    const products = await prisma.$queryRawUnsafe(sql, ...params);

    // Get total count
    let countSql = `SELECT COUNT(*) as total FROM Product WHERE 1=1`;
    const countParams: any[] = [];

    if (query.trim()) {
      countSql += ` AND MATCH(name, description) AGAINST(? IN NATURAL LANGUAGE MODE)`;
      countParams.push(query);
    }

    if (category && ['BOX', 'PACK', 'PROMO'].includes(category)) {
      countSql += ` AND category = ?`;
      countParams.push(category);
    }

    if (minPrice) {
      countSql += ` AND price >= ?`;
      countParams.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      countSql += ` AND price <= ?`;
      countParams.push(parseFloat(maxPrice));
    }

    if (onSale === 'true') {
      countSql += ` AND issale = 1`;
    } else if (onSale === 'false') {
      countSql += ` AND issale = 0`;
    }

    const [{ total }]: any = await prisma.$queryRawUnsafe(countSql, ...countParams);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      successResponse({
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        filters: {
          query: query || null,
          category: category || null,
          minPrice: minPrice ? parseFloat(minPrice) : null,
          maxPrice: maxPrice ? parseFloat(maxPrice) : null,
          onSale: onSale ? onSale === 'true' : null,
          sortBy,
        },
      })
    );
  } catch (error) {
    console.error('[Product Search Error]', error);
    return NextResponse.json(
      errorResponse('Failed to search products', 500),
      { status: 500 }
    );
  }
}
