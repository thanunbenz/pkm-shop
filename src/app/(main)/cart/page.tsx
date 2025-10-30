"use client";

import { useCartStore } from "@/store/useCartStore";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faMinus, faPlus, faShoppingCart } from "@fortawesome/free-solid-svg-icons";

export default function CartPage() {
  const { data: session } = useSession();
  const { items, updateQuantity, removeItem, getTotalPrice, getTotalItems, loadFromServer } = useCartStore();

  useEffect(() => {
    // Load cart from server if logged in
    if (session?.user?.id) {
      loadFromServer(Number(session.user.id));
    }
  }, [session, loadFromServer]);

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    updateQuantity(productId, newQuantity);

    // Sync with server if logged in
    if (session?.user?.id) {
      fetch("/api/v1/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          productId,
          quantity: newQuantity,
        }),
      });
    }
  };

  const handleRemove = (productId: number) => {
    removeItem(productId);

    // Sync with server if logged in
    if (session?.user?.id) {
      fetch("/api/v1/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          productId,
        }),
      });
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <FontAwesomeIcon icon={faShoppingCart} className="text-gray-300 text-6xl mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">ตะกร้าสินค้าว่างเปล่า</h1>
          <p className="text-gray-600 mb-6">ยังไม่มีสินค้าในตะกร้า เริ่มช้อปปิ้งเลย!</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 text-white rounded"
            style={{ backgroundColor: '#0B264C' }}
          >
            เริ่มช้อปปิ้ง
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">ตะกร้าสินค้า</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const currentPrice = item.issale ? item.discountprice : item.price;

            return (
              <div
                key={item.productId}
                className="bg-white rounded-lg shadow p-4 flex gap-4"
              >
                {/* Product Image */}
                <Link href={`/products/${item.productId}`}>
                  <div className="relative w-24 h-24 flex-shrink-0 bg-gray-100 rounded cursor-pointer hover:opacity-80">
                    <Image
                      src={item.image || "/uploads/no_image_available.svg"}
                      alt={item.name}
                      fill
                      className="object-cover rounded"
                      sizes="96px"
                    />
                  </div>
                </Link>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.productId}`}>
                    <h3 className="font-semibold text-gray-800 hover:text-blue-600 cursor-pointer truncate">
                      {item.name}
                    </h3>
                  </Link>

                  <p className="text-sm text-gray-600 mt-1">
                    {item.issale && item.price !== item.discountprice ? (
                      <>
                        <span className="line-through mr-2">฿{item.price.toFixed(2)}</span>
                        <span className="text-red-600 font-semibold">
                          ฿{item.discountprice.toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className="font-semibold">฿{item.price.toFixed(2)}</span>
                    )}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    คงเหลือ: {item.availableStock} ชิ้น
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center border border-gray-300 rounded">
                      <button
                        onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                        className="px-2 py-1 text-gray-700 hover:bg-gray-100 text-sm"
                        disabled={item.quantity <= 1}
                      >
                        <FontAwesomeIcon icon={faMinus} className="text-xs" />
                      </button>
                      <span className="px-3 py-1 text-sm font-medium border-x border-gray-300">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                        className="px-2 py-1 text-gray-700 hover:bg-gray-100 text-sm"
                        disabled={item.quantity >= item.availableStock}
                      >
                        <FontAwesomeIcon icon={faPlus} className="text-xs" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemove(item.productId)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      <FontAwesomeIcon icon={faTrash} className="mr-1" />
                      ลบ
                    </button>
                  </div>
                </div>

                {/* Item Total */}
                <div className="text-right">
                  <p className="font-semibold text-lg">
                    ฿{(currentPrice * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4">สรุปคำสั่งซื้อ</h2>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-gray-700">
                <span>จำนวนสินค้า:</span>
                <span>{getTotalItems()} ชิ้น</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>ยอดรวม:</span>
                <span>฿{getTotalPrice().toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t pt-4 mb-4">
              <div className="flex justify-between text-lg font-bold">
                <span>รวมทั้งหมด:</span>
                <span>฿{getTotalPrice().toFixed(2)}</span>
              </div>
            </div>

            <button
              className="w-full text-white py-3 rounded font-semibold hover:opacity-90 transition-colors"
              style={{ backgroundColor: '#0B264C' }}
            >
              ดำเนินการชำระเงิน
            </button>

            <Link href="/" className="block text-center text-sm text-gray-600 mt-4 hover:underline">
              ← เลือกซื้อสินค้าต่อ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
