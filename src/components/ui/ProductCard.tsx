"use client";
import Image from "next/image";
import { useState } from "react";

interface Product {
  id: number;
  name: string;
  price: number;
  discountprice: number;
  issale: boolean;
  image: string | null;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);

  const handleIncrease = () => {
    setQuantity(prev => prev + 1);
  };

  const handleDecrease = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };

  const handleAddToCart = () => {
    // TODO: Implement add to cart functionality
    console.log(`Adding ${quantity} of ${product.name} to cart`);
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 relative">
      {/* Sale Badge */}
      {product.issale && (
        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
          SALE
        </div>
      )}

      {/* Product Image */}
      <div className="relative w-full h-64 bg-gray-100">
        <Image
          src={product.image || "/uploads/no_image_available.svg"}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 20vw"
        />
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Product Name */}
        <h3 className="text-base font-medium text-gray-800 mb-2 truncate">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          {product.issale && product.price !== product.discountprice ? (
            <>
              <span className="text-gray-400 line-through text-sm">
                ฿{product.price.toFixed(2)}
              </span>
              <span className="text-red-600 font-bold text-lg">
                ฿{product.discountprice.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-gray-800 font-bold text-lg">
              ฿{product.price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div className="text-sm text-green-600 mb-3">
          49 - In Stock.
        </div>

        {/* Quantity Selector & Add to Cart */}
        <div className="flex items-center gap-2">
          {/* Quantity Controls */}
          <div className="flex items-center border border-gray-300 rounded">
            <button
              onClick={handleDecrease}
              className="px-2 py-1 text-gray-600 hover:bg-gray-100 transition-colors text-sm"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <input
              type="text"
              value={quantity}
              readOnly
              className="w-10 text-center border-x border-gray-300 py-1 text-xs"
            />
            <button
              onClick={handleIncrease}
              className="px-2 py-1 text-gray-600 hover:bg-gray-100 transition-colors text-sm"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="flex-1 text-white text-xs font-medium py-1.5 px-3 rounded transition-colors"
            style={{ backgroundColor: '#0B264C' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0d3461'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0B264C'}
          >
            เพิ่มใส่ตะกร้า
          </button>
        </div>
      </div>
    </div>
  );
}
