import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/utils/api-response';

/**
 * Product Autocomplete API Endpoint
 *
 * GET /api/v1/products/autocomplete
 *
 * Query Parameters:
 * - q: Search query (minimum 2 characters)
 * - limit: Maximum number of suggestions (default: 10, max: 20)
 *
 * Returns top matching product names for autocomplete suggestions
 *
 * Examples:
 * - /api/v1/products/autocomplete?q=poke
 * - /api/v1/products/autocomplete?q=booster&limit=5
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 20);

    // Require minimum 2 characters for autocomplete
    if (query.trim().length < 2) {
      return NextResponse.json(
        successResponse({
          suggestions: [],
          query: query.trim(),
        })
      );
    }

    // Search for matching products
    const products = await prisma.product.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        category: true,
        image: true,
        price: true,
        discountprice: true,
        issale: true,
      },
      take: limit,
      orderBy: [
        // Prioritize exact name matches
        { name: 'asc' },
        // Then by creation date
        { createdAt: 'desc' },
      ],
    });

    // Format suggestions
    const suggestions = products.map((product) => ({
      id: product.id,
      name: product.name,
      category: product.category,
      image: product.image,
      price: product.issale ? product.discountprice : product.price,
      isOnSale: product.issale,
    }));

    return NextResponse.json(
      successResponse({
        suggestions,
        query: query.trim(),
        count: suggestions.length,
      })
    );
  } catch (error) {
    console.error('[Autocomplete Error]', error);
    return NextResponse.json(
      errorResponse('Failed to fetch autocomplete suggestions', 500),
      { status: 500 }
    );
  }
}
