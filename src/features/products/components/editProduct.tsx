/* eslint-disable react-hooks/exhaustive-deps */
"use client"
import { faArrowLeft, faFileImage, faPenToSquare, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Bounce, toast, ToastContainer } from "react-toastify";
import Image from "next/image";
import pack from "../../../../public/uploads/no_image_available.svg";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Loading from "@/components/ui/Loading";
import { showToastError, showToastSuccess } from "@/lib/utils/toast";

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
    imageId: string;
    code: [];
}

export default function Page() {
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [product, setProduct] = useState<Product>(
        {
            id: '',
            name: '',
            description: '',
            price: 1,
            discountprice: 1,
            issale: false,
            isrecommend: false,
            category: 'PACK',
            image: '/uploads/no_image_available.svg',
            imageId: '-',
            code: []
        });
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState(1);
    const [discountprice, setDiscountprice] = useState(1);
    const [issale, setIssale] = useState(false);
    const [isrecommend, setIsrecommend] = useState(false);
    const [category, setCategory] = useState("PACK");
    const [image, setImage] = useState("/uploads/no_image_available.svg");
    const [imageId, setImageId] = useState("-");
    const [uploading, setUploading] = useState(false)
    const [imageName, setImageName] = useState("");

    const fetchProduct = async () => {
        try {
            const response = await fetch(`/api/v1/products/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch product');
            }
            const result = await response.json();
            const data = result.data;
            setProduct(data);
            setName(data.name);
            setDescription(data.description);
            setPrice(data.price);
            setDiscountprice(data.discountprice);
            setIssale(data.issale);
            setIsrecommend(data.isrecommend);
            setCategory(data.category);
            setImage(data.image);
            setImageId(data.imageId);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching product:', error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProduct();
    }, []);

    const handleImageUpload = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        if (imageId === "-" || imageId === null || imageId === undefined || imageId === "") {
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
                setImage(data.file.path);
                setImageId(data.file.id);
                setImageName(file.name);
                showToastSuccess('Upload successful');
                setUploading(true);
            } catch (error) {
                console.error('Upload failed:', error);
                showToastError('Upload failed');
            }
        } else {
            try {
                const res = await fetch(`/api/v1/upload/${imageId}`, {
                    method: 'PUT',
                    body: formData,
                });

                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(`Server error: ${errorText}`);
                }

                const data = await res.json();
                setImage(data.file.path);
                setImageId(data.file.id);
                setImageName(file.name);
                showToastSuccess('Upload successful');
                setUploading(true);
            } catch (error) {
                console.error('Upload failed:', error);
                showToastError('Upload failed');
            }
        }

    };

    const handleUpdateProduct = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const data = {
            name,
            description,
            price: Number(price),
            discountprice: Number(discountprice),
            issale: issale,
            isrecommend: isrecommend,
            image: image || "/uploads/no_image_available.svg",
            imageId: imageId || "-",
            category: category
        }
        const response = await fetch(`/api/v1/products/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            toast.success('Product updated successfully');
            fetchProduct();
        } else {
            toast.error('Failed to update product');
        }
        setIsOpen(false);
        setUploading(false);
    };

    const toggleModal = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            {isLoading && <><Loading /></>}
            <div className="flex mb-4 ">
                <button className="inline-flex items-center px-4 py-2 bg-[#134A9B] hover:bg-blue-600 text-white text-sm font-medium rounded-full">
                    <Link href="/product"><FontAwesomeIcon icon={faArrowLeft} className="mr-2" /> Product List</Link>
                </button>


            </div>
            <div className="flex space-x-6">
                <div className="flex-shrink-0 w-72 h-72">
                    <Image src={product.image || pack} alt={description} className="rounded-lg object-cover" width={300} height={300} />
                </div>
                <div className="text flex flex-col space-y-4">

                    <h1 className="text font-medium text-4xl text-gray-600 bg-gray-200">
                        {product.name}
                    </h1>
                    <h2 className="text font-medium text-xl text-gray-500">
                        {product.category}
                    </h2>
                    <p className="text font-medium text-lg text-gray-500">
                        {product.description}
                    </p>
                    <p className="text font-medium text-lg text-gray-500">
                        Stock: {product.code.length}
                    </p>
                    <button
                        className="block text-white bg-[#134A9B] hover:bg-blue-600 font-medium rounded-full text-sm px-5 py-2.5 text-center uppercase w-32 h-10"
                        type="button"
                        onClick={toggleModal}
                    >
                        <FontAwesomeIcon icon={faPenToSquare} /> Edit Pack
                    </button>
                </div>
            </div>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
                    <div
                        className="relative bg-white rounded-lg shadow dark:bg-gray-700 max-w-md w-full"
                        onClick={(e) => e.stopPropagation()} // Prevent closing on modal content click
                    >
                        {/* Modal header */}
                        <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Edit Product
                            </h3>
                            <button
                                type="button"
                                onClick={() => {setUploading(false); toggleModal();}}
                                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                            >
                                <FontAwesomeIcon icon={faTimes} size="lg" />
                                <span className="sr-only">Close modal</span>
                            </button>
                        </div>

                        {/* Modal body */}
                        <form className="p-4 md:p-5" onSubmit={handleUpdateProduct}>
                            <div className="grid gap-4 mb-4 grid-cols-2">
                                {/* Name */}
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
                                {/* Description */}
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
                                        required
                                    />
                                </div>

                                {/* Is Recommend */}
                                <div className="col-span-2">
                                    <label
                                        htmlFor="isRecommend"
                                        className="flex items-center gap-3 mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                    >
                                        <input
                                            type="checkbox"
                                            id="isRecommend"
                                            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded"
                                            checked={isrecommend}
                                            onChange={(e) => setIsrecommend(e.target.checked)}
                                        />
                                        <span>Recommend this product</span>
                                    </label>
                                </div>

                                {/* Is Sale */}
                                <div className="col-span-2">
                                    <label
                                        htmlFor="isSale"
                                        className="flex items-center gap-3 mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                    >
                                        <input
                                            type="checkbox"
                                            id="isSale"
                                            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                                            checked={issale}
                                            onChange={(e) => setIssale(e.target.checked)}
                                        />
                                        <span>On Sale</span>
                                    </label>
                                </div>

                                {/* Price */}
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
                                        placeholder={price.toString()}
                                        required
                                        value={price}
                                        onChange={(e) =>
                                            setPrice(() => Math.max(Number(e.target.value), 1))
                                        }
                                    />
                                </div>

                                {/* Discount Price (conditionally rendered) */}
                                {issale && (
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
                                            value={discountprice}
                                            onChange={(e) =>
                                                setDiscountprice(() =>
                                                    Math.max(Number(e.target.value), 1)
                                                )
                                            }
                                        />
                                    </div>
                                )}

                                {/* Category */}
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
                                        value={category} // ค่าใน select คือค่าใน state
                                        onChange={(e) => setCategory(e.target.value)} // อัปเดต state เมื่อมีการเปลี่ยนแปลง
                                    >
                                        <option value="PACK">Pack</option>
                                        <option value="BOX">Box</option>
                                        <option value="PROMO">Promo</option>
                                    </select>
                                </div>

                                {!uploading && (
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
                                                        <span className="font-semibold">
                                                            Click to upload

                                                        </span>{" "}
                                                        or drag and drop
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
                                )}
                            </div>

                            {/* Submit button */}
                            <button
                                type="submit"
                                className="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                            >
                                update product
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