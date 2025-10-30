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
import CodeDataTable from "@/components/ui/CodeDataTable";
import AddCodeButton from "@/components/ui/AddCodeButton";

interface Code {
    id: number;
    code: string;
    isUsed: boolean;
    createdAt: string;
    productId: number;
}

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
    code: Code[];
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
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [editingCode, setEditingCode] = useState<any>(null);

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
                setImageId(String(data.file.id));
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
                setImageId(String(data.file.id));
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
            imageId: String(imageId) || "-",
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
            setIsOpen(false);
        } else {
            const errorData = await response.json().catch(() => ({}));
            console.error('Update failed:', errorData);
            toast.error(errorData.error || 'Failed to update product');
        }
        setUploading(false);
    };

    const toggleModal = () => {
        setIsOpen(!isOpen);
    };

    const handleCodeAdded = () => {
        setRefreshTrigger(prev => prev + 1);
        fetchProduct();
    };

    const handleEditCode = (code: any) => {
        setEditingCode(code);
    };

    const handleCloseEdit = () => {
        setEditingCode(null);
    };

    return (
        <>
            {isLoading && <><Loading /></>}
            <div className="flex mb-4 justify-between items-center">
                <button className="inline-flex items-center px-4 py-2 bg-[#134A9B] hover:bg-blue-600 text-white text-sm font-medium rounded-full">
                    <Link href="/product"><FontAwesomeIcon icon={faArrowLeft} className="mr-2" /> Product List</Link>
                </button>
                <AddCodeButton
                    productId={id as string}
                    onCodeAdded={handleCodeAdded}
                    editingCode={editingCode}
                    onCloseEdit={handleCloseEdit}
                />
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
                    <div className="text-sm text-green-600 mb-3">
                        {product.code.filter((c) => !c.isUsed).length} - In Stock.
                    </div>
                    <button
                        className="block text-white bg-[#134A9B] hover:bg-blue-600 font-medium rounded-full text-sm px-5 py-2.5 text-center uppercase w-32 h-10"
                        type="button"
                        onClick={toggleModal}
                    >
                        <FontAwesomeIcon icon={faPenToSquare} /> Edit Pack
                    </button>
                </div>
            </div>

            {/* Code List Section */}
            <div className="mt-8">
                <hr className="border-gray-300 mb-4 border" />
                <h3 className="text-2xl font-bold text-gray-700 mb-4">Code List</h3>
                <CodeDataTable
                    productId={id as string}
                    refreshTrigger={refreshTrigger}
                    onEditCode={handleEditCode}
                />
            </div>

            {/* Modal */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                    onClick={() => {setUploading(false); toggleModal();}}
                >
                    <div
                        className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            {/* Modal header */}
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Edit Product
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => {setUploading(false); toggleModal();}}
                                    className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
                                >
                                    <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                                    </svg>
                                    <span className="sr-only">Close modal</span>
                                </button>
                            </div>

                        {/* Modal body */}
                        <form className="space-y-4" onSubmit={handleUpdateProduct}>
                                {/* Name */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                                        ชื่อสินค้า *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        className="w-full border rounded px-3 py-2"
                                        placeholder="Product name"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium mb-2">
                                        คำอธิบาย
                                    </label>
                                    <textarea
                                        id="description"
                                        rows={3}
                                        className="w-full border rounded px-3 py-2"
                                        placeholder="Write product description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        required
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label htmlFor="category" className="block text-sm font-medium mb-2">
                                        หมวดหมู่
                                    </label>
                                    <select
                                        id="category"
                                        className="w-full border rounded px-3 py-2"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                    >
                                        <option value="PACK">Pack</option>
                                        <option value="BOX">Box</option>
                                        <option value="PROMO">Promo</option>
                                    </select>
                                </div>

                                {/* Price and Discount Price */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="price" className="block text-sm font-medium mb-2">
                                            ราคา *
                                        </label>
                                        <input
                                            type="number"
                                            name="price"
                                            id="price"
                                            className="w-full border rounded px-3 py-2"
                                            placeholder={price.toString()}
                                            required
                                            value={price}
                                            onChange={(e) => setPrice(() => Math.max(Number(e.target.value), 1))}
                                        />
                                    </div>

                                    {issale && (
                                        <div>
                                            <label htmlFor="discountPrice" className="block text-sm font-medium mb-2">
                                                ราคาลด
                                            </label>
                                            <input
                                                type="number"
                                                name="discountPrice"
                                                id="discountPrice"
                                                className="w-full border rounded px-3 py-2"
                                                placeholder="2499"
                                                value={discountprice}
                                                onChange={(e) => setDiscountprice(() => Math.max(Number(e.target.value), 1))}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Checkboxes */}
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="isRecommend"
                                            className="w-4 h-4"
                                            checked={isrecommend}
                                            onChange={(e) => setIsrecommend(e.target.checked)}
                                        />
                                        <label htmlFor="isRecommend" className="text-sm font-medium">
                                            สินค้าแนะนำ
                                        </label>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="isSale"
                                            className="w-4 h-4"
                                            checked={issale}
                                            onChange={(e) => setIssale(e.target.checked)}
                                        />
                                        <label htmlFor="isSale" className="text-sm font-medium">
                                            ลดราคา
                                        </label>
                                    </div>
                                </div>

                                {/* Image Upload */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        รูปภาพสินค้า
                                        <span className="text-xs text-gray-500 ml-2">(JPG, PNG, WEBP | Max 5MB)</span>
                                    </label>

                                    {/* Preview หรือ Upload Area */}
                                    {image && image !== "/uploads/no_image_available.svg" ? (
                                        <div className="space-y-2">
                                            {/* Image Preview */}
                                            <div className="relative w-full h-64 border-2 border-gray-300 rounded-lg overflow-hidden">
                                                <Image
                                                    src={image}
                                                    alt="Product Preview"
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    className="object-cover"
                                                />
                                                {/* Overlay with change button */}
                                                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center group">
                                                    <label
                                                        htmlFor="productImage"
                                                        className="opacity-0 group-hover:opacity-100 cursor-pointer bg-white text-gray-800 px-4 py-2 rounded-lg font-medium transition-opacity"
                                                    >
                                                        เปลี่ยนรูปภาพ
                                                    </label>
                                                </div>
                                            </div>
                                            <input
                                                type="file"
                                                id="productImage"
                                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleImageUpload(file);
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        // Upload Area
                                        <div
                                            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                                                uploading
                                                    ? "border-blue-400 bg-blue-50"
                                                    : "border-gray-300 hover:border-blue-400 hover:bg-gray-50 cursor-pointer"
                                            }`}
                                            onDragOver={(e) => {
                                                e.preventDefault();
                                                e.currentTarget.classList.add("border-blue-400", "bg-blue-50");
                                            }}
                                            onDragLeave={(e) => {
                                                e.currentTarget.classList.remove("border-blue-400", "bg-blue-50");
                                            }}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                e.currentTarget.classList.remove("border-blue-400", "bg-blue-50");
                                                const file = e.dataTransfer.files?.[0];
                                                if (file) handleImageUpload(file);
                                            }}
                                        >
                                            {uploading ? (
                                                <div className="py-4">
                                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
                                                    <p className="text-blue-600 font-medium">กำลังอัปโหลด...</p>
                                                    <p className="text-xs text-gray-500 mt-1">กรุณารอสักครู่</p>
                                                </div>
                                            ) : (
                                                <>
                                                    <input
                                                        type="file"
                                                        id="productImageNew"
                                                        accept="image/jpeg,image/jpg,image/png,image/webp"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) handleImageUpload(file);
                                                        }}
                                                    />
                                                    <label htmlFor="productImageNew" className="cursor-pointer">
                                                        <FontAwesomeIcon icon={faFileImage} size="3x" className="text-gray-400 mb-3" />
                                                        <p className="text-base font-medium text-gray-700 mb-1">
                                                            คลิกเพื่ออัปโหลด หรือ ลากไฟล์มาวางที่นี่
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            รองรับ JPG, PNG, WEBP (ขนาดไม่เกิน 5MB)
                                                        </p>
                                                    </label>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-2 pt-4">
                                    <button
                                        type="submit"
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
                                    >
                                        บันทึก
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {setUploading(false); toggleModal();}}
                                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded"
                                    >
                                        ยกเลิก
                                    </button>
                                </div>
                            </form>
                        </div>
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