"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBox,
  faSpinner,
  faExclamationTriangle,
  faShoppingBag,
  faChevronLeft,
  faChevronRight,
  faCopy,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";

// Types
interface Product {
  id: number;
  name: string;
  image: string;
  category: string;
}

interface Payment {
  paymentMethod: string;
  paymentStatus: string;
}

interface PurchaseCode {
  code: {
    code: string;
  };
}

interface Purchase {
  id: number;
  productId: number;
  quantity: number;
  totalAmount: number;
  status: "PENDING" | "COMPLETED" | "CANCELED";
  createdAt: string;
  product: Product;
  payment: Payment;
  purchaseCodes: PurchaseCode[];
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/orders");
    }
  }, [status, router]);

  // Fetch purchases
  const fetchPurchases = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/v1/purchases?page=${page}&limit=${pagination.limit}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();

      if (data.success) {
        setPurchases(data.data);
        setPagination(data.pagination);
      } else {
        throw new Error(data.error || "Failed to fetch orders");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchPurchases();
    }
  }, [status]);

  // Copy code to clipboard
  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: Purchase["status"] }) => {
    const styles = {
      PENDING: "bg-yellow-100 text-yellow-800 border-yellow-300",
      COMPLETED: "bg-green-100 text-green-800 border-green-300",
      CANCELED: "bg-red-100 text-red-800 border-red-300",
    };

    const labels = {
      PENDING: "รอดำเนินการ",
      COMPLETED: "เสร็จสิ้น",
      CANCELED: "ยกเลิก",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  // Payment status badge
  const PaymentStatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      SUCCESS: "bg-green-100 text-green-800",
      FAILED: "bg-red-100 text-red-800",
    };

    const labels: Record<string, string> = {
      PENDING: "รอตรวจสอบ",
      SUCCESS: "ชำระแล้ว",
      FAILED: "ล้มเหลว",
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-800"}`}>
        {labels[status] || status}
      </span>
    );
  };

  // Loading state
  if (loading && purchases.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center">
          <FontAwesomeIcon
            icon={faSpinner}
            className="text-4xl text-blue-600 mb-4 animate-spin"
          />
          <p className="text-gray-600">กำลังโหลดคำสั่งซื้อ...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            className="text-3xl text-red-600 mb-3"
          />
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            เกิดข้อผิดพลาด
          </h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => fetchPurchases(pagination.page)}
            className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            ลองอีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (purchases.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <FontAwesomeIcon
            icon={faShoppingBag}
            className="text-gray-300 text-6xl mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            ยังไม่มีคำสั่งซื้อ
          </h1>
          <p className="text-gray-600 mb-6">
            คุณยังไม่มีประวัติการสั่งซื้อ เริ่มช้อปปิ้งเลย!
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 text-white rounded"
            style={{ backgroundColor: "#0B264C" }}
          >
            เริ่มช้อปปิ้ง
          </Link>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ประวัติการสั่งซื้อ
        </h1>
        <p className="text-gray-600">
          จำนวนคำสั่งซื้อทั้งหมด: {pagination.total} รายการ
        </p>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {purchases.map((purchase) => (
          <div
            key={purchase.id}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Order Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs text-gray-500">หมายเลขคำสั่งซื้อ</p>
                    <p className="font-semibold text-gray-900">#{purchase.id}</p>
                  </div>
                  <div className="h-8 w-px bg-gray-300"></div>
                  <div>
                    <p className="text-xs text-gray-500">วันที่สั่งซื้อ</p>
                    <p className="text-sm text-gray-700">
                      {new Date(purchase.createdAt).toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <PaymentStatusBadge status={purchase.payment.paymentStatus} />
                  <StatusBadge status={purchase.status} />
                </div>
              </div>
            </div>

            {/* Order Content */}
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Product Info */}
                <div className="flex gap-4 flex-1">
                  <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 rounded">
                    <Image
                      src={purchase.product.image || "/placeholder.png"}
                      alt={purchase.product.name}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {purchase.product.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {purchase.product.category}
                    </p>
                    <p className="text-sm text-gray-700">
                      จำนวน: <span className="font-medium">{purchase.quantity}</span> ชิ้น
                    </p>
                  </div>
                </div>

                {/* Price Info */}
                <div className="text-right md:text-left">
                  <p className="text-sm text-gray-500 mb-1">ยอดรวม</p>
                  <p className="text-2xl font-bold text-[#0B264C]">
                    ฿{purchase.totalAmount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {purchase.payment.paymentMethod === "manual"
                      ? "โอนเงิน"
                      : purchase.payment.paymentMethod}
                  </p>
                </div>
              </div>

              {/* Codes Display (Only for COMPLETED orders) */}
              {purchase.status === "COMPLETED" &&
                purchase.purchaseCodes &&
                purchase.purchaseCodes.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FontAwesomeIcon icon={faBox} className="text-green-600" />
                      โค้ดสินค้าของคุณ ({purchase.purchaseCodes.length} โค้ด)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {purchase.purchaseCodes.map((pc, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-green-50 border border-green-200 rounded px-4 py-3"
                        >
                          <code className="text-sm font-mono text-green-800 font-semibold">
                            {pc.code.code}
                          </code>
                          <button
                            onClick={() => handleCopyCode(pc.code.code)}
                            className="ml-3 px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition"
                            title="คัดลอก"
                          >
                            <FontAwesomeIcon
                              icon={
                                copiedCode === pc.code.code ? faCheck : faCopy
                              }
                            />
                            {copiedCode === pc.code.code ? " คัดลอกแล้ว" : " คัดลอก"}
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                      💡 เคล็ดลับ: คลิกปุ่ม "คัดลอก" เพื่อคัดลอกโค้ดไปใช้งาน
                    </p>
                  </div>
                )}

              {/* Pending Status Info */}
              {purchase.status === "PENDING" && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                    <p className="text-sm text-yellow-800">
                      ⏳ <strong>รอการตรวจสอบ:</strong> กรุณารอให้แอดมินตรวจสอบการชำระเงิน
                      คุณจะได้รับโค้ดสินค้าเมื่อการสั่งซื้อเสร็จสิ้น
                    </p>
                  </div>
                </div>
              )}

              {/* Canceled Status Info */}
              {purchase.status === "CANCELED" && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="bg-red-50 border border-red-200 rounded p-4">
                    <p className="text-sm text-red-800">
                      ❌ <strong>คำสั่งซื้อถูกยกเลิก:</strong> คำสั่งซื้อนี้ถูกยกเลิกแล้ว
                      หากมีข้อสงสัยกรุณาติดต่อแอดมิน
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            onClick={() => fetchPurchases(pagination.page - 1)}
            disabled={pagination.page === 1 || loading}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="mr-2" />
            ก่อนหน้า
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter(
                (page) =>
                  page === 1 ||
                  page === pagination.totalPages ||
                  (page >= pagination.page - 1 && page <= pagination.page + 1)
              )
              .map((page, index, array) => (
                <>
                  {index > 0 && array[index - 1] !== page - 1 && (
                    <span key={`ellipsis-${page}`} className="px-2 text-gray-400">
                      ...
                    </span>
                  )}
                  <button
                    key={page}
                    onClick={() => fetchPurchases(page)}
                    disabled={loading}
                    className={`w-10 h-10 rounded transition ${
                      page === pagination.page
                        ? "bg-[#0B264C] text-white"
                        : "border border-gray-300 hover:bg-gray-50"
                    } disabled:opacity-50`}
                  >
                    {page}
                  </button>
                </>
              ))}
          </div>

          <button
            onClick={() => fetchPurchases(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages || loading}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            ถัดไป
            <FontAwesomeIcon icon={faChevronRight} className="ml-2" />
          </button>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>
          แสดง {(pagination.page - 1) * pagination.limit + 1} -{" "}
          {Math.min(pagination.page * pagination.limit, pagination.total)} จาก{" "}
          {pagination.total} รายการ
        </p>
      </div>
    </div>
  );
}
