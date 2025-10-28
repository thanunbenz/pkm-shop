/* eslint-disable react-hooks/exhaustive-deps */
"use client"
import { faCheck, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import ProductItem from "./ProductItem";

// Use a default image path
const NO_IMAGE_PATH = "/uploads/no_image_available.svg";

interface Code {
    id: number;
    code: string;
    isUsed: boolean;
    createdAt: Date;
    productId: number;
}

interface Product {
    id: number;
    name: string;
    description: string | null;
    price: number;
    discountprice: number;
    issale: boolean;
    isrecommend: boolean;
    category: string;
    image: string | null;
    code?: Code[];
}

interface DataTableProps {
    initialProducts: Product[];
}

export default function DataTable({ initialProducts }: DataTableProps) {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialProducts);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("ALL");
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const { listProducts, retrieveProductCount } = useStore();

    useEffect(() => {
        // Refresh products when listProducts changes
        const fetchProducts = async () => {
            const response = await fetch("/api/v1/products");
            const data = await response.json();
            if (data.success) {
                setProducts(data.data);
            } else {
                setProducts(data);
            }
        };

        if (listProducts > 0) {
            fetchProducts();
        }
        retrieveProductCount();
    }, [listProducts]);

    useEffect(() => {
        // Filter products based on search and category
        let filtered = products;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by category
        if (categoryFilter !== "ALL") {
            filtered = filtered.filter(product => product.category === categoryFilter);
        }

        setFilteredProducts(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    }, [products, searchTerm, categoryFilter]);

    useEffect(() => {
        // Calculate total pages when filtered products change
        setTotalPages(Math.ceil(filteredProducts.length / itemsPerPage));
    }, [filteredProducts, itemsPerPage]);

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`/api/v1/products/${id}`);
            if (!response.ok) throw new Error("Failed to fetch product");

            const { imageId } = await response.json();
            const imageID = imageId || "-";

            const deleteProduct = fetch(`/api/v1/products/${id}`, { method: "DELETE" });

            const deleteImage = imageID !== "-"
                ? fetch(`/api/v1/upload/${imageID}`, { method: "DELETE" })
                : Promise.resolve();

            const [imageResponse, productResponse] = await Promise.all([deleteImage, deleteProduct]);

            if (imageResponse && !imageResponse.ok) throw new Error("Failed to delete image");
            if (!productResponse.ok) throw new Error("Failed to delete product");

            console.log("Deleted product:", await productResponse.json());
        } catch (error) {
            console.error("Error deleting:", error);
        }
    };


    // Get current page items
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className="mt-4 md:mt-8">
            {/* Search and Filter Controls */}
            <div className="mb-4 md:mb-6 grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4">
                {/* Search Bar - 8 columns on desktop */}
                <div className="md:col-span-8">
                    <label className="block text-sm font-medium text-gray-700 mb-1 md:hidden">
                        Search
                    </label>
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-[40px] md:h-[36px] px-3 md:px-4 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Category Filter - 2 columns on desktop */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1 md:hidden">
                        Category
                    </label>
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full h-[40px] md:h-[36px] px-3 md:px-4 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="ALL">All Categories</option>
                        <option value="PACK">Booster Pack</option>
                        <option value="BOX">Booster Box</option>
                        <option value="PROMO">Promo/Special</option>
                    </select>
                </div>

                {/* Items Per Page - 2 columns on desktop */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1 md:hidden">
                        Show
                    </label>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                        className="w-full h-[40px] md:h-[36px] px-3 md:px-4 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value={5}>5 per page</option>
                        <option value={10}>10 per page</option>
                        <option value={25}>25 per page</option>
                        <option value={50}>50 per page</option>
                    </select>
                </div>
            </div>

            {/* Results Count & Clear Filter */}
            <div className="mb-3 md:mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="text-sm text-gray-600">
                    Showing <span className="font-semibold">{indexOfFirstItem + 1}</span> to <span className="font-semibold">{Math.min(indexOfLastItem, filteredProducts.length)}</span> of <span className="font-semibold">{filteredProducts.length}</span> products
                    {searchTerm || categoryFilter !== "ALL" ? ` (filtered from ${products.length} total)` : ""}
                </div>
                {(searchTerm || categoryFilter !== "ALL") && (
                    <button
                        onClick={() => {
                            setSearchTerm("");
                            setCategoryFilter("ALL");
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium underline"
                    >
                        Clear all filters
                    </button>
                )}
            </div>

            {/* Scroll Hint for Mobile */}
            <div className="mb-2 text-xs text-gray-500 md:hidden flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
                Scroll horizontally to see all columns
            </div>

            <div className="flex flex-col mt-4 md:mt-6">
                <div className="py-2 -my-2 overflow-x-auto sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 -webkit-overflow-scrolling-touch scrollbar-visible">

                    <div className="inline-block min-w-full overflow-hidden align-middle border border-gray-200 shadow rounded-lg">
                        <table className="min-w-full text-sm md:text-base">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase bg-gray-100 border-b border-gray-200">
                                        No.
                                    </th>
                                    <th className="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase bg-gray-100 border-b border-gray-200">
                                        Image
                                    </th>
                                    <th
                                        className="cursor-pointer px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase bg-gray-100 border-b border-gray-200"
                                    // onClick={() => handleSort("name")}
                                    >
                                        Name
                                    </th>
                                    <th
                                        className="cursor-pointer px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase bg-gray-100 border-b border-gray-200"
                                    // onClick={() => handleSort("discountprice")}
                                    >
                                        Price
                                    </th>
                                    <th
                                        className="cursor-pointer px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase bg-gray-100 border-b border-gray-200"
                                    // onClick={() => handleSort("issale")}
                                    >
                                        Sale
                                    </th>
                                    <th
                                        className="cursor-pointer px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase bg-gray-100 border-b border-gray-200"
                                    // onClick={() => handleSort("isrecommend")}
                                    >
                                        Recommend
                                    </th>
                                    <th
                                        className="cursor-pointer px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase bg-gray-100 border-b border-gray-200"
                                    // onClick={() => handleSort("category")}
                                    >
                                        Category
                                    </th>
                                    <th
                                        className="cursor-pointer px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase bg-gray-100 border-b border-gray-200"
                                    // onClick={() => handleSort("codes")}
                                    >
                                        Stock
                                    </th>
                                    <th className="px-6 py-3 bg-gray-100 border-b border-gray-200"></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                {currentProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-500">
                                                <svg className="w-16 h-16 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                </svg>
                                                <h3 className="text-lg font-medium mb-1">No products found</h3>
                                                <p className="text-sm">
                                                    {searchTerm || categoryFilter !== "ALL"
                                                        ? "Try adjusting your search or filter criteria"
                                                        : "No products available"}
                                                </p>
                                                {(searchTerm || categoryFilter !== "ALL") && (
                                                    <button
                                                        onClick={() => {
                                                            setSearchTerm("");
                                                            setCategoryFilter("ALL");
                                                        }}
                                                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                                    >
                                                        Clear Filters
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    currentProducts.map((product, index) => (
                                    <tr key={product.id}>
                                        <td className="px-6 py-4 border-b border-gray-200 whitespace-nowrap">
                                            {indexOfFirstItem + index + 1}
                                        </td>
                                        <td className="px-6 py-4 border-b border-gray-200 whitespace-nowrap">
                                            <div className="h-20 w-20">
                                                <Image
                                                    src={product.image || NO_IMAGE_PATH}
                                                    alt={product.name}
                                                    className="rounded-lg object-cover"
                                                    width={100}
                                                    height={100}
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.src = NO_IMAGE_PATH;
                                                    }}
                                                />
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 border-b border-gray-200 whitespace-nowrap">
                                            <div className="text-sm font-medium leading-5 text-gray-900">
                                                {product.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 border-b border-gray-200 whitespace-nowrap">
                                            <div className="text-sm font-medium leading-5 text-gray-900">
                                                {product.discountprice.toFixed(2)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 border-b border-gray-200 whitespace-nowrap">
                                            <div className="text-sm font-medium leading-5 text-gray-900">
                                                {product.issale ? (
                                                    <FontAwesomeIcon
                                                        icon={faCheck}
                                                        size="xl"
                                                        className="text-green-500"
                                                    />
                                                ) : (<FontAwesomeIcon
                                                    icon={faX}
                                                    size="xl"
                                                    className="text-red-500"
                                                />)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 border-b border-gray-200 whitespace-nowrap">
                                            <div className="text-sm font-medium leading-5 text-gray-900">
                                                {product.isrecommend ? (
                                                    <FontAwesomeIcon
                                                        icon={faCheck}
                                                        size="xl"
                                                        className="text-green-500"
                                                    />
                                                ) : (<FontAwesomeIcon
                                                    icon={faX}
                                                    size="xl"
                                                    className="text-red-500"
                                                />)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 border-b border-gray-200 whitespace-nowrap">
                                            <div className="text-sm font-medium leading-5 text-gray-900">
                                                {product.category}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 border-b border-gray-200 whitespace-nowrap">
                                            <div className="text-sm font-medium leading-5 text-gray-900">
                                                {product.code?.length || 0}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium leading-5 text-right border-b border-gray-200 whitespace-nowrap space-x-4">
                                            <Link
                                                href={`/product/` + product.id}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                Edit
                                            </Link>
                                            <ProductItem product={product} handleDelete={handleDelete} />
                                        </td>
                                    </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-3 md:gap-4">
                    {/* Previous Button */}
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="w-full md:w-auto px-6 py-2.5 md:py-2 text-white bg-[#134A9B] hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors font-medium text-base md:text-sm"
                    >
                        ← Previous
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1.5 md:gap-2 overflow-x-auto max-w-full px-2">
                        {/* First Page */}
                        {currentPage > 2 && (
                            <>
                                <button
                                    onClick={() => setCurrentPage(1)}
                                    className="min-w-[2.5rem] px-2.5 md:px-3 py-1.5 md:py-1 text-sm md:text-base rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
                                >
                                    1
                                </button>
                                {currentPage > 3 && <span className="text-gray-500 text-sm">...</span>}
                            </>
                        )}

                        {/* Current and Adjacent Pages */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(page =>
                                page === currentPage ||
                                page === currentPage - 1 ||
                                page === currentPage + 1
                            )
                            .map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`min-w-[2.5rem] px-2.5 md:px-3 py-1.5 md:py-1 text-sm md:text-base rounded-lg border transition-colors ${
                                        page === currentPage
                                            ? "bg-[#134A9B] text-white border-[#134A9B] font-semibold"
                                            : "border-gray-300 hover:bg-gray-100"
                                    }`}
                                >
                                    {page}
                                </button>
                            ))
                        }

                        {/* Last Page */}
                        {currentPage < totalPages - 1 && (
                            <>
                                {currentPage < totalPages - 2 && <span className="text-gray-500 text-sm">...</span>}
                                <button
                                    onClick={() => setCurrentPage(totalPages)}
                                    className="min-w-[2.5rem] px-2.5 md:px-3 py-1.5 md:py-1 text-sm md:text-base rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
                                >
                                    {totalPages}
                                </button>
                            </>
                        )}
                    </div>

                    {/* Next Button */}
                    <button
                        onClick={() =>
                            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                        }
                        disabled={currentPage === totalPages}
                        className="w-full md:w-auto px-6 py-2.5 md:py-2 text-white bg-[#134A9B] hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors font-medium text-base md:text-sm"
                    >
                        Next →
                    </button>
                </div>
            </div>

        </div>
    );
}