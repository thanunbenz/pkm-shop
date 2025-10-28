/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { faFileImage, faPlus, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Bounce, ToastContainer } from "react-toastify";
import { showToastSuccess, showToastError } from "@/lib/utils/toast";
import { useStore } from "@/store/useStore";

export default function AddProductButton() {
    const { retrieveProductCount } = useStore();
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState("");
    const [price, setPrice] = useState(1);
    const [discountPrice, setDiscountPrice] = useState(0);
    const [description, setDescription] = useState("");
    const [isSale, setIsSale] = useState(false);
    const [uploading, setUploading] = useState(false)
    const [imageName, setImageName] = useState("");
    const [isRecommend, setIsRecommend] = useState(false);
    const [category, setCategory] = useState("PACK");
    const [imagePath, setImagePath] = useState("/uploads/no_image_available.svg");
    const [imageId, setImageId] = useState("-");


    const toggleModal = () => {
        console.log("Toggle modal clicked, current isOpen:", isOpen);
        setIsOpen((prev) => !prev);
        retrieveProductCount();
    };

    useEffect(() => {
        console.log("isOpen changed to:", isOpen);
    }, [isOpen]);

    useEffect(() => {
        if (!isSale) {
            setDiscountPrice(price);
        }
    }, [isSale, price]);

    const handleImageUpload = async (file: File) => {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/v1/upload', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Server error: ${errorText}`);
            }

            const data = await res.json();
            setImagePath(data.file.path);
            setImageId(data.file.id);
            setImageName(file.name);
            retrieveProductCount();
            showToastSuccess('Upload successful');
        } catch (error) {
            console.error('Upload failed:', error);
            showToastError('Upload failed');
        }

    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch("/api/v1/products", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: name,
                    description: description || "No description available.",
                    price: Number(discountPrice),
                    discountprice: Number(discountPrice),
                    issale: isSale,
                    image: imagePath || "/uploads/no_image_available.svg",
                    imageId: imageId || "-",
                    isrecommend: isRecommend,
                    category: category,
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to create product: ${await response.text()}`);
            }

            setName("");
            setPrice(1);
            setDiscountPrice(1);
            setDescription("");
            setIsSale(false);
            setIsRecommend(false);
            setCategory("PACK");
            setImagePath("");
            setImageId("");
            setImageName("");
            toggleModal();
            setUploading(false);
            showToastSuccess("Product created successfully!");
        } catch (error) {
            console.error("Error occurred:", error);
            showToastError("Failed to create product");

            if (imageId) {
                try {
                    await fetch(`/api/v1/upload/${imageId}`, {
                        method: 'DELETE',
                    });
                    setImagePath("");
                    setImageId("");
                    setImageName("");
                    showToastSuccess("Uploaded image deleted");
                    setUploading(false);
                } catch (deleteError) {
                    console.error("Failed to delete image:", deleteError);
                    showToastError("Failed to delete image");
                }
            }
        }
    };



    return (
        <>
            <button
                onClick={toggleModal}
                className="text-white bg-[#134A9B] hover:bg-blue-600 font-medium rounded-full text-sm px-5 py-2.5 text-center uppercase"
                type="button"
            >
                <FontAwesomeIcon icon={faPlus} /> Add New Product
            </button>

                {isOpen && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center w-full h-full bg-black bg-opacity-50">
                        <div
                            className="relative bg-white rounded-lg shadow dark:bg-gray-700 max-w-md w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Create New Product
                                </h3>
                                <button
                                    type="button"
                                    onClick={toggleModal}
                                    className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                                >
                                    <FontAwesomeIcon icon={faX} size="lg" />
                                    <span className="sr-only">Close modal</span>
                                </button>
                            </div>


                            <form className="p-4 md:p-5" onSubmit={handleSubmit}>
                                <div className="grid gap-4 mb-4 grid-cols-2">

                                    <div className="col-span-2">
                                        <label
                                            htmlFor="name"
                                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                        >
                                            Name
                                        </label>
                                        <input
                                            type="text"

                                            name="name"
                                            id="name"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                            placeholder="Product name"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label
                                            htmlFor="description"
                                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                        >
                                            Description
                                        </label>
                                        <textarea
                                            id="description"
                                            rows={4}
                                            className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                            placeholder="Write product description"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label
                                            htmlFor="isRecommend"
                                            className="flex items-center gap-3 mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                        >
                                            <input
                                                type="checkbox"
                                                id="isRecommend"
                                                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded"
                                                checked={isRecommend}
                                                onChange={(e) => setIsRecommend(e.target.checked)}
                                            />
                                            <span>Recommend this product</span>
                                        </label>
                                    </div>

                                    <div className="col-span-2">
                                        <label
                                            htmlFor="isSale"
                                            className="flex items-center gap-3 mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                        >
                                            <input
                                                type="checkbox"
                                                id="isSale"
                                                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                                                checked={isSale}
                                                onChange={(e) => setIsSale(e.target.checked)}
                                            />
                                            <span>On Sale</span>
                                        </label>
                                    </div>

                                    <div className="col-span-2 sm:col-span-1">
                                        <label
                                            htmlFor="price"
                                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                        >
                                            Price
                                        </label>
                                        <input
                                            type="number"
                                            name="price"
                                            id="price"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                            placeholder="2999"
                                            required
                                            value={price}
                                            onChange={(e) =>
                                                setPrice(() => Math.max(Number(e.target.value), 1))
                                            }
                                        />
                                    </div>

                                    {isSale && (
                                        <div className="col-span-2 sm:col-span-1">
                                            <label
                                                htmlFor="discountPrice"
                                                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                            >
                                                Discount Price
                                            </label>
                                            <input
                                                type="number"
                                                name="discountPrice"
                                                id="discountPrice"
                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                                placeholder="2499"
                                                value={discountPrice}
                                                onChange={(e) =>
                                                    setDiscountPrice(() =>
                                                        price === 1 ? 1 : Math.min(Math.max(Number(e.target.value), 1), price - 1)
                                                    )
                                                }
                                            />
                                        </div>
                                    )}
                                    <div className="col-span-2">
                                        <label
                                            htmlFor="category"
                                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                        >
                                            Category
                                        </label>
                                        <select
                                            id="category"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                        >
                                            <option value="PACK">Pack</option>
                                            <option value="BOX">Box</option>
                                            <option value="PROMO">Promo</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label
                                            htmlFor="image"
                                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                        >
                                            Upload Image
                                        </label>
                                        <div className="flex items-center justify-center w-full"
                                            onDragOver={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                const file = e.dataTransfer.files?.[0];
                                                if (file) {
                                                    handleImageUpload(file);
                                                }
                                            }}
                                        >
                                            <label
                                                htmlFor="image"
                                                className="flex flex-col items-center justify-center w-full h-32 bg-gray-50 border-2 border-dashed rounded-lg cursor-pointer dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                                            >
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <FontAwesomeIcon
                                                        icon={faFileImage}
                                                        size="xl"
                                                        style={{ color: "#9ca3af" }}
                                                    />
                                                    <p className="mt-3 mb-2 text-sm text-gray-500 dark:text-gray-400">
                                                        {uploading ?
                                                            <>
                                                                <span className="font-semibold">
                                                                    Uploading...  {imageName}
                                                                </span>
                                                            </> : (
                                                                <>
                                                                    <span className="font-semibold">
                                                                        Click to upload

                                                                    </span>{" "}
                                                                    or drag and drop
                                                                </>
                                                            )}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">

                                                        PNG, JPG, GIF (Max: 10MB)
                                                    </p>
                                                </div>
                                                <input
                                                    id="image"
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            handleImageUpload(file);
                                                        }
                                                    }}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                >
                                    Add new product
                                </button>
                            </form>
                        </div>
                    </div>
                )}

            <ToastContainer
                position="bottom-left"
                autoClose={5000}
                hideProgressBar={false}
                closeOnClick={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                transition={Bounce}
            />
        </>
    );
}
