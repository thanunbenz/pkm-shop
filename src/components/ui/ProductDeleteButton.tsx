import { faTrash, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

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

const ProductDeleteButton = ({ product, handleDelete }: { product: Product, handleDelete: (id: string) => void }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <button
                className="text-red-600 hover:text-red-900"
                onClick={() => setIsModalOpen(true)}
            >
                Delete
            </button>

            {isModalOpen && (
                <div
                    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div
                        className="relative p-6 w-full max-w-md bg-white rounded-lg shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="absolute top-3 right-3 text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-2 transition-colors active:bg-gray-300"
                            onClick={() => setIsModalOpen(false)}
                        >
                            <FontAwesomeIcon icon={faX} size="lg" />
                        </button>

                        <div className="text-center pt-2">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                                <FontAwesomeIcon icon={faTrash} size="2x" className="text-red-600"/>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Delete Product
                            </h3>
                            <p className="mb-6 text-gray-600 text-base">
                                Are you sure you want to delete &quot;{product.name}&quot;? This action cannot be undone.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            <button
                                className="flex-1 py-3 px-4 text-base font-medium text-gray-700 bg-white rounded-lg border-2 border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="flex-1 py-3 px-4 text-base font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 active:bg-red-800 transition-colors"
                                onClick={() => {
                                    handleDelete(product.id);
                                    setIsModalOpen(false);
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProductDeleteButton;
