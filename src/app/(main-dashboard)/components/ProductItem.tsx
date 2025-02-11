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

const ProductItem = ({ product, handleDelete }: { product: Product, handleDelete: (id: string) => void }) => {
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
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="relative p-4 w-full max-w-md bg-white rounded-lg shadow dark:bg-gray-800">
                        <button
                            type="button"
                            className="absolute top-2.5 right-2.5 text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 dark:hover:bg-gray-600 dark:hover:text-white"
                            onClick={() => setIsModalOpen(false)}
                        >
                        <FontAwesomeIcon icon={faX} size="lg" />
                        </button>

                        <div className="text-center">
                            <FontAwesomeIcon icon={faTrash} size="2xl" className="text-gray-400 m-3"/>
                            <p className="mb-4 text-gray-500 dark:text-gray-300">
                                Are you sure you want to delete this item?
                            </p>
                        </div>

                        <div className="flex justify-center items-center space-x-4">
                            <button
                                className="py-2 px-3 text-sm font-medium text-gray-500 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600"
                                onClick={() => setIsModalOpen(false)}
                            >
                                No, cancel
                            </button>
                            <button
                                className="py-2 px-3 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                                onClick={() => {
                                    handleDelete(product.id);
                                    setIsModalOpen(false);
                                }}
                            >
                                Yes, I&apos;m sure
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProductItem;
