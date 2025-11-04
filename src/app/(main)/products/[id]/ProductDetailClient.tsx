"use client";

import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/store/useCartStore";
import { useState } from "react";
import { Product } from "@/types/models/product";

interface ProductDetailClientProps {
  product: Product & { availableStock: number };
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { data: session } = useSession();
  const { addItem } = useCartStore();
  const [quantity, setQuantity] = useState(1);

  const handleIncrease = () => {
    if (quantity < product.availableStock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrease = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleAddToCart = async () => {
    // Add to local cart store
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      discountprice: product.discountprice,
      issale: product.issale,
      image: product.image,
      quantity,
      availableStock: product.availableStock,
    });

    // Sync with server if logged in
    if (session?.user?.id) {
      try {
        await fetch("/api/v1/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: session.user.id,
            productId: product.id,
            quantity,
          }),
        });
      } catch (error) {
        console.error("Failed to sync cart with server:", error);
      }
    }

    toast.success(`เพิ่ม ${product.name} ลงตะกร้าแล้ว!`);
  };

  const currentPrice = product.issale ? product.discountprice : product.price;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left Side - Product Info */}
        <div className="space-y-6">
          {/* Product Name */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            {product.name}
          </h1>

          {/* Price */}
          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-sm text-gray-600">Your Price:</span>
              <span className="text-3xl font-bold text-red-600">
                ฿{currentPrice.toFixed(2)}
              </span>
            </div>
            {product.issale && product.price !== product.discountprice && (
              <div className="text-sm text-gray-500">
                <span className="line-through">฿{product.price.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Availability */}
          <div className="text-base">
            <span className="font-semibold">Availability: </span>
            <span
              className={
                product.availableStock > 0 ? "text-green-600" : "text-red-600"
              }
            >
              {product.availableStock > 0
                ? `${product.availableStock} In Stock.`
                : "Out of Stock"}
            </span>
          </div>

          {/* Quantity & Add to Cart */}
          {product.availableStock > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Quantity</span>

                {/* Quantity Selector */}
                <div className="flex items-center border border-gray-300 rounded">
                  <button
                    onClick={handleDecrease}
                    className="px-3 py-1 text-gray-700 hover:bg-gray-100 transition-colors text-lg font-semibold"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <input
                    type="text"
                    value={quantity}
                    readOnly
                    className="w-12 text-center border-x border-gray-300 py-1 text-sm font-medium"
                  />
                  <button
                    onClick={handleIncrease}
                    className="px-3 py-1 text-gray-700 hover:bg-gray-100 transition-colors text-lg font-semibold"
                    aria-label="Increase quantity"
                    disabled={quantity >= product.availableStock}
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  className="text-white px-6 py-2 rounded text-sm font-medium transition-colors"
                  style={{ backgroundColor: '#0B264C' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0d3461'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0B264C'}
                >
                  เพิ่มใส่ตะกร้า
                </button>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-gray-50 border-l-4 border-orange-400 p-3 rounded">
            <div className="flex gap-2">
              <FontAwesomeIcon
                icon={faExclamationCircle}
                className="text-orange-500 text-base flex-shrink-0 mt-0.5"
              />
              <div className="text-xs text-gray-700 leading-relaxed">
                <p>
                  <strong className="text-gray-800">คุณจะได้รับโค้ดทาง Email ทันทีหลังชำระเงิน</strong>
                  {" "}หากไม่พบในกล่องข้อความ กรุณาตรวจสอบใน <strong>Spam</strong> หรือ{" "}
                  <strong>Promotional</strong> หากมีปัญหา ติดต่อ:{" "}
                  <a
                    href="mailto:support@pkmshop.com"
                    className="text-blue-600 hover:underline font-medium"
                  >
                    support@pkmshop.com
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="pt-6 border-t border-gray-200">
              <h2 className="text-xl font-bold mb-3">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
            </div>
          )}
        </div>

        {/* Right Side - Product Image */}
        <div className="lg:sticky lg:top-8">
          <div className="relative aspect-square w-full max-w-2xl mx-auto bg-gray-100 rounded-lg overflow-hidden shadow-lg">
            <Image
              src={product.image || "/uploads/no_image_available.svg"}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>
          {/* Product Name Below Image */}
          <p className="text-center text-gray-600 mt-4 font-medium">
            {product.name}
          </p>
        </div>
      </div>
    </div>
  );
}
