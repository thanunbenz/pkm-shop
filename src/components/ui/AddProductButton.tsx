/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { faFileImage, faPlus, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Bounce, ToastContainer } from "react-toastify";
import { showToastSuccess, showToastError } from "@/lib/utils/toast";
import { useStore } from "@/store/useStore";
import Image from "next/image";

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
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>("/uploads/no_image_available.svg");


    const toggleModal = () => {
        setIsOpen((prev) => !prev);
        retrieveProductCount();
    };

    useEffect(() => {
        if (!isSale) {
            setDiscountPrice(price);
        }
    }, [isSale, price]);

    const handleImageSelect = (file: File) => {
        // Validation
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

        if (!allowedTypes.includes(file.type)) {
            showToastError("รองรับเฉพาะไฟล์ JPG, PNG, WEBP เท่านั้น");
            return;
        }

        if (file.size > maxSize) {
            showToastError("ขนาดไฟล์ต้องไม่เกิน 5MB");
            return;
        }

        // เก็บไฟล์ไว้ใน state และสร้าง preview
        setSelectedFile(file);
        setImageName(file.name);
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
    };

    const uploadImage = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/v1/upload', {
            method: 'POST',
            body: formData,
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Server error: ${errorText}`);
        }

        const data = await res.json();
        return data.file;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);

        let uploadedImageId = "-";
        let uploadedImagePath = "/uploads/no_image_available.svg";

        try {
            // อัพโหลดรูปก่อน (ถ้ามี)
            if (selectedFile) {
                try {
                    const uploadedFile = await uploadImage(selectedFile);
                    uploadedImageId = String(uploadedFile.id);
                    uploadedImagePath = uploadedFile.path;
                } catch (uploadError) {
                    showToastError('อัปโหลดรูปภาพไม่สำเร็จ');
                    setUploading(false);
                    return;
                }
            }

            // สร้าง Product
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
                    image: uploadedImagePath,
                    imageId: uploadedImageId,
                    isrecommend: isRecommend,
                    category: category,
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to create product: ${await response.text()}`);
            }

            // Reset form
            setName("");
            setPrice(1);
            setDiscountPrice(1);
            setDescription("");
            setIsSale(false);
            setIsRecommend(false);
            setCategory("PACK");
            setImagePath("/uploads/no_image_available.svg");
            setImageId("-");
            setImageName("");
            setSelectedFile(null);
            setPreviewUrl("/uploads/no_image_available.svg");
            toggleModal();
            showToastSuccess("Product created successfully!");
        } catch (error) {
            showToastError("Failed to create product");

            // ถ้าอัพโหลดรูปสำเร็จแล้วแต่สร้าง Product ไม่สำเร็จ ให้ลบรูปออก
            if (uploadedImageId !== "-") {
                try {
                    await fetch(`/api/v1/upload/${uploadedImageId}`, {
                        method: 'DELETE',
                    });
                } catch (deleteError) {
                    // Failed to cleanup uploaded image
                }
            }
        } finally {
            setUploading(false);
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
                    <div
                        className="fixed inset-0 z-[9999] flex items-center justify-center w-full h-full bg-black bg-opacity-50"
                        onClick={toggleModal}
                    >
                        <div
                            className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        Create New Product
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={toggleModal}
                                        className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
                                    >
                                        <FontAwesomeIcon icon={faX} size="lg" />
                                        <span className="sr-only">Close modal</span>
                                    </button>
                                </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">ชื่อสินค้า *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full border rounded px-3 py-2"
                                        placeholder="Product name"
                                        required
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">คำอธิบาย</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full border rounded px-3 py-2"
                                        rows={3}
                                        placeholder="Write product description"
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">หมวดหมู่</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full border rounded px-3 py-2"
                                    >
                                        <option value="PACK">Booster Pack</option>
                                        <option value="BOX">Booster Box</option>
                                        <option value="PROMO">Promo/Special</option>
                                    </select>
                                </div>

                                {/* Price Fields */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">ราคาปกติ *</label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={price}
                                            onChange={(e) => setPrice(() => Math.max(Number(e.target.value), 1))}
                                            className="w-full border rounded px-3 py-2"
                                            placeholder="2999"
                                            required
                                        />
                                    </div>

                                    {isSale && (
                                        <div>
                                            <label className="block text-sm font-medium mb-2">ราคาลด</label>
                                            <input
                                                type="number"
                                                name="discountPrice"
                                                value={discountPrice}
                                                onChange={(e) =>
                                                    setDiscountPrice(() =>
                                                        price === 1 ? 1 : Math.min(Math.max(Number(e.target.value), 1), price - 1)
                                                    )
                                                }
                                                className="w-full border rounded px-3 py-2"
                                                placeholder="2499"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Checkboxes */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="isRecommend"
                                            checked={isRecommend}
                                            onChange={(e) => setIsRecommend(e.target.checked)}
                                            className="w-4 h-4"
                                        />
                                        <label htmlFor="isRecommend" className="text-sm font-medium">
                                            แนะนำสินค้านี้
                                        </label>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="isSale"
                                            checked={isSale}
                                            onChange={(e) => setIsSale(e.target.checked)}
                                            className="w-4 h-4"
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
                                    {previewUrl !== "/uploads/no_image_available.svg" ? (
                                        <div className="space-y-2">
                                            {/* Image Preview */}
                                            <div className="relative w-full h-64 border-2 border-gray-300 rounded-lg overflow-hidden">
                                                <Image
                                                    src={previewUrl}
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
                                                    if (file) handleImageSelect(file);
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
                                                if (file) handleImageSelect(file);
                                            }}
                                        >
                                            <input
                                                type="file"
                                                id="productImageNew"
                                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleImageSelect(file);
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
                                        onClick={toggleModal}
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
