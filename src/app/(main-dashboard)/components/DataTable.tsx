/* eslint-disable react-hooks/exhaustive-deps */
"use client"
import { faCheck, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import ProductItem from "./ProductItem";
import pack from "../../../../public/uploads/no_image_available.png";

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    discountprice: number;
    issale: boolean;
    isrecommend: boolean;
    category: string;
    image: string;
    code: [];
}

export default function DataTable() {
    const [products, setProducts] = useState<Product[]>([]);
    const { listProducts, retrieveProductCount } = useStore();

    useEffect(() => {
        const fetchProducts = async () => {
            const response = await fetch("/api/products");
            const data = await response.json();
            setProducts(data.data);
        };
        fetchProducts();
        retrieveProductCount();
    }, [listProducts]);

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`/api/products/${id}`);
            if (!response.ok) throw new Error("Failed to fetch product");

            const { imageId } = await response.json();
            const imageID = imageId || "-";

            const deleteProduct = fetch(`/api/products/${id}`, { method: "DELETE" });

            const deleteImage = imageID !== "-"
                ? fetch(`/api/upload/${imageID}`, { method: "DELETE" })
                : Promise.resolve();

            const [imageResponse, productResponse] = await Promise.all([deleteImage, deleteProduct]);

            if (imageResponse && !imageResponse.ok) throw new Error("Failed to delete image");
            if (!productResponse.ok) throw new Error("Failed to delete product");

            console.log("Deleted product:", await productResponse.json());
        } catch (error) {
            console.error("Error deleting:", error);
        }
    };


    return (
        <div className="mt-8">

            <div className="flex flex-col mt-6">
                <div className="py-2 -my-2 overflow-x-auto sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">

                    <div className="inline-block min-w-full overflow-hidden align-middle border-b border-gray-200 shadow sm:rounded-lg">
                        <table className="min-w-full">
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
                                {products.map((product, index) => (
                                    <tr key={product.id}>
                                        <td className="px-6 py-4 border-b border-gray-200 whitespace-nowrap">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4 border-b border-gray-200 whitespace-nowrap">
                                            <div className="h-20 w-20">
                                                <Image
                                                    src={product.image || pack}
                                                    alt={product.name}
                                                    className="rounded-lg"
                                                    width={100}
                                                    height={100}
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
                                                {product.code.length}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium leading-5 text-right border-b border-gray-200 whitespace-nowrap space-x-4">

                                            <Link
                                                href={`/product/` + product.id}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                Edit
                                            </Link>

                                            {/* <button className="text-red-600 hover:text-red-900" onClick={() => handleDelete(product.id)}>Delete</button>
                                            <button className="text-red-600 hover:text-red-900" onClick={() => setIsModalOpen(true)}>Delete</button> */}
                                            <ProductItem product={product} handleDelete={handleDelete} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* <div className="flex justify-between mt-4">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-white bg-[#134A9B] hover:bg-blue-600 disabled:bg-gray-300 rounded-2xl"
                    >
                        Previous
                    </button>
                    <span>
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() =>
                            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                        }
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 text-white bg-[#134A9B] hover:bg-blue-600 disabled:bg-gray-300 rounded-2xl"
                    >
                        Next
                    </button>
                </div> */}
            </div>

        </div>
    );
}