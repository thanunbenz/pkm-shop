"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import { useCartStore } from "@/store/useCartStore";
import Link from "next/link";

export default function FloatingCart() {
  const [totalItems, setTotalItems] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const cartStore = useCartStore();

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Update total items (client-side only)
  useEffect(() => {
    if (!isMounted) return;

    const updateTotal = () => {
      setTotalItems(cartStore.getTotalItems());
    };

    // Initial count
    updateTotal();

    // Subscribe to changes
    const unsubscribe = useCartStore.subscribe(updateTotal);

    return () => unsubscribe();
  }, [isMounted, cartStore]);

  return (
    <Link
      href="/cart"
      className={`fixed right-6 bottom-24 z-40 bg-black text-white rounded-full w-16 h-16 flex items-center justify-center shadow-2xl hover:bg-gray-800 transition-all duration-300 hover:scale-110 ${isMounted ? 'group' : ''}`}
      aria-label="Shopping Cart"
    >
      {/* Cart Icon */}
      <div className="relative">
        <FontAwesomeIcon icon={faShoppingCart} className="text-2xl" />

        {/* Badge - only show after mount */}
        {isMounted && totalItems > 0 && (
          <div className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold rounded-full min-w-[24px] h-6 flex items-center justify-center px-1.5 shadow-lg">
            {totalItems}
          </div>
        )}
      </div>

      {/* Tooltip - only show after mount */}
      {isMounted && (
        <div className="absolute right-full mr-3 bg-gray-800 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          ตะกร้าสินค้า ({totalItems} ชิ้น)
          <div className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-full border-8 border-transparent border-l-gray-800"></div>
        </div>
      )}
    </Link>
  );
}
