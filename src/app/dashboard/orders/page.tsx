"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faExclamationTriangle,
  faSearch,
  faEye,
  faCheck,
  faTimes,
  faFilter,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import { toast } from "react-toastify";

// Types
interface Product {
  id: number;
  name: string;
  image: string;
  category: string;
}

interface User {
  id: number;
  fname: string;
  lname: string;
  email: string;
}

interface Payment {
  paymentMethod: string;
  paymentStatus: string;
  paymentProof?: string;
}

interface PurchaseCode {
  code: {
    code: string;
  };
}

interface Purchase {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  totalAmount: number;
  status: "PENDING" | "COMPLETED" | "CANCELED";
  createdAt: string;
  product: Product;
  user?: User;
  payment: Payment;
  purchaseCodes: PurchaseCode[];
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminOrdersPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal state
  const [selectedOrder, setSelectedOrder] = useState<Purchase | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Fetch orders
  const fetchOrders = async (page: number = 1, status: string = "", search: string = "") => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });

      if (status) params.append("status", status);
      if (search) params.append("search", search);

      const response = await fetch(`/api/v1/purchases?${params.toString()}`);

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
    fetchOrders(1, statusFilter, searchQuery);
  }, [statusFilter]);

  // Handle search
  const handleSearch = () => {
    fetchOrders(1, statusFilter, searchQuery);
  };

  // Update order status
  const handleUpdateStatus = async (orderId: number, newStatus: "COMPLETED" | "CANCELED") => {
    try {
      setUpdating(true);

      const response = await fetch(`/api/v1/purchases/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order");
      }

      const data = await response.json();

      if (data.success) {
        toast.success(`อัปเดตสถานะเป็น ${newStatus} สำเร็จ`);
        setShowModal(false);
        setSelectedOrder(null);
        fetchOrders(pagination.page, statusFilter, searchQuery);
      } else {
        throw new Error(data.error || "Failed to update order");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setUpdating(false);
    }
  };

  // Status badge
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
      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
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

  // Order Detail Modal
  const OrderDetailModal = () => {
    if (!selectedOrder) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setShowModal(false)}>
        <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">รายละเอียดคำสั่งซื้อ #{selectedOrder.id}</h2>
              <p className="text-sm text-gray-600 mt-1">
                {new Date(selectedOrder.createdAt).toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Status */}
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">สถานะคำสั่งซื้อ</p>
                <StatusBadge status={selectedOrder.status} />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">สถานะการชำระเงิน</p>
                <PaymentStatusBadge status={selectedOrder.payment.paymentStatus} />
              </div>
            </div>

            {/* Customer Info */}
            {selectedOrder.user && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">ข้อมูลลูกค้า</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-600">ชื่อ:</span> {selectedOrder.user.fname} {selectedOrder.user.lname}</p>
                  <p><span className="text-gray-600">อีเมล:</span> {selectedOrder.user.email}</p>
                </div>
              </div>
            )}

            {/* Product Info */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">รายละเอียดสินค้า</h3>
              <div className="flex gap-4">
                <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 rounded">
                  <Image
                    src={selectedOrder.product.image || "/placeholder.png"}
                    alt={selectedOrder.product.name}
                    fill
                    className="object-cover rounded"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{selectedOrder.product.name}</h4>
                  <p className="text-sm text-gray-500">{selectedOrder.product.category}</p>
                  <p className="text-sm text-gray-700 mt-2">
                    จำนวน: <span className="font-medium">{selectedOrder.quantity}</span> ชิ้น
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">ยอดรวม</p>
                  <p className="text-xl font-bold text-[#0B264C]">
                    ฿{selectedOrder.totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">ข้อมูลการชำระเงิน</h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-600">วิธีการ:</span> {selectedOrder.payment.paymentMethod === "manual" ? "โอนเงิน" : selectedOrder.payment.paymentMethod}</p>
                {selectedOrder.payment.paymentProof && (
                  <div className="mt-2">
                    <p className="text-gray-600 mb-1">หลักฐานการโอน:</p>
                    <a
                      href={selectedOrder.payment.paymentProof}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      ดูหลักฐาน →
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Product Codes */}
            {selectedOrder.status === "COMPLETED" && selectedOrder.purchaseCodes.length > 0 && (
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">โค้ดสินค้า ({selectedOrder.purchaseCodes.length} โค้ด)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedOrder.purchaseCodes.map((pc, index) => (
                    <div key={index} className="bg-green-50 border border-green-200 rounded px-3 py-2">
                      <code className="text-sm font-mono text-green-800 font-semibold">
                        {pc.code.code}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            {selectedOrder.status === "PENDING" && (
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">อัปเดตสถานะ</h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, "COMPLETED")}
                    disabled={updating}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50"
                  >
                    <FontAwesomeIcon icon={faCheck} className="mr-2" />
                    อนุมัติ (COMPLETED)
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, "CANCELED")}
                    disabled={updating}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50"
                  >
                    <FontAwesomeIcon icon={faTimes} className="mr-2" />
                    ยกเลิก (CANCELED)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading && purchases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <FontAwesomeIcon icon={faSpinner} className="text-4xl text-blue-600 mb-4 animate-spin" />
        <p className="text-gray-600">กำลังโหลดคำสั่งซื้อ...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <FontAwesomeIcon icon={faExclamationTriangle} className="text-3xl text-red-600 mb-3" />
        <h2 className="text-xl font-semibold text-red-800 mb-2">เกิดข้อผิดพลาด</h2>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => fetchOrders(pagination.page, statusFilter, searchQuery)}
          className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          ลองอีกครั้ง
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">จัดการคำสั่งซื้อ</h1>
        <p className="text-gray-600 mt-1">
          ทั้งหมด {pagination.total} รายการ
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Status Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FontAwesomeIcon icon={faFilter} className="mr-2" />
              กรองตามสถานะ
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">ทั้งหมด</option>
              <option value="PENDING">รอดำเนินการ</option>
              <option value="COMPLETED">เสร็จสิ้น</option>
              <option value="CANCELED">ยกเลิก</option>
            </select>
          </div>

          {/* Search */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FontAwesomeIcon icon={faSearch} className="mr-2" />
              ค้นหา (Order ID, Email)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="กรอก Order ID หรือ Email..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                ค้นหา
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  สินค้า
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  จำนวน
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ยอดรวม
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  สถานะ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  การชำระเงิน
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  วันที่
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {purchases.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">#{order.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 flex-shrink-0 bg-gray-100 rounded">
                        <Image
                          src={order.product.image || "/placeholder.png"}
                          alt={order.product.name}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{order.product.name}</p>
                        <p className="text-xs text-gray-500">{order.product.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ฿{order.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <PaymentStatusBadge status={order.payment.paymentStatus} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString("th-TH", {
                      year: "2-digit",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 transition"
                      title="ดูรายละเอียด"
                    >
                      <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {purchases.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">ไม่พบคำสั่งซื้อ</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => fetchOrders(pagination.page - 1, statusFilter, searchQuery)}
            disabled={pagination.page === 1 || loading}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="mr-2" />
            ก่อนหน้า
          </button>

          <span className="px-4 py-2 text-sm text-gray-700">
            หน้า {pagination.page} / {pagination.totalPages}
          </span>

          <button
            onClick={() => fetchOrders(pagination.page + 1, statusFilter, searchQuery)}
            disabled={pagination.page === pagination.totalPages || loading}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            ถัดไป
            <FontAwesomeIcon icon={faChevronRight} className="ml-2" />
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && <OrderDetailModal />}
    </div>
  );
}
