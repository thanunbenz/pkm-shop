"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingCart,
  faUsers,
  faBoxOpen,
  faDollarSign,
  faArrowUp,
  faArrowDown,
} from "@fortawesome/free-solid-svg-icons";

export default function DashboardPage() {
  // Mock data - จะเอามาจาก API ในอนาคต
  const stats = [
    {
      title: "Total Sales",
      value: "฿45,231",
      change: "+12.5%",
      isPositive: true,
      icon: faDollarSign,
      bgColor: "bg-blue-500",
    },
    {
      title: "Total Orders",
      value: "1,234",
      change: "+8.2%",
      isPositive: true,
      icon: faShoppingCart,
      bgColor: "bg-green-500",
    },
    {
      title: "Total Users",
      value: "856",
      change: "+15.3%",
      isPositive: true,
      icon: faUsers,
      bgColor: "bg-purple-500",
    },
    {
      title: "Total Products",
      value: "142",
      change: "-2.4%",
      isPositive: false,
      icon: faBoxOpen,
      bgColor: "bg-orange-500",
    },
  ];

  const recentOrders = [
    { id: "ORD-001", customer: "John Doe", product: "Pokemon Pack", amount: "฿1,299", status: "Completed" },
    { id: "ORD-002", customer: "Jane Smith", product: "Booster Box", amount: "฿3,999", status: "Pending" },
    { id: "ORD-003", customer: "Bob Johnson", product: "Promo Card", amount: "฿599", status: "Completed" },
    { id: "ORD-004", customer: "Alice Williams", product: "Elite Trainer Box", amount: "฿2,499", status: "Processing" },
    { id: "ORD-005", customer: "Charlie Brown", product: "Pokemon Pack", amount: "฿1,299", status: "Completed" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your store today.</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-2">{stat.value}</h3>
                <div className="flex items-center mt-2">
                  <FontAwesomeIcon
                    icon={stat.isPositive ? faArrowUp : faArrowDown}
                    className={`w-3 h-3 mr-1 ${
                      stat.isPositive ? "text-green-500" : "text-red-500"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      stat.isPositive ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {stat.change}
                  </span>
                  <span className="text-gray-500 text-sm ml-1">vs last month</span>
                </div>
              </div>
              <div className={`${stat.bgColor} rounded-full p-4`}>
                <FontAwesomeIcon icon={stat.icon} className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Sales Overview</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            <p className="text-gray-500">Chart will be implemented with Chart.js or Recharts</p>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Trend</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            <p className="text-gray-500">Chart will be implemented with Chart.js or Recharts</p>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {order.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {order.product}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {order.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : order.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white hover:shadow-lg transition-shadow cursor-pointer">
          <h4 className="text-lg font-semibold mb-2">Add New Product</h4>
          <p className="text-blue-100 text-sm">Quickly add a new product to your inventory</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white hover:shadow-lg transition-shadow cursor-pointer">
          <h4 className="text-lg font-semibold mb-2">View All Orders</h4>
          <p className="text-green-100 text-sm">Manage and process customer orders</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white hover:shadow-lg transition-shadow cursor-pointer">
          <h4 className="text-lg font-semibold mb-2">User Management</h4>
          <p className="text-purple-100 text-sm">Manage users and permissions</p>
        </div>
      </div>
    </div>
  );
}