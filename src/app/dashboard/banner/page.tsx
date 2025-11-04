"use client";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEdit, faTrash, faToggleOn, faToggleOff, faFileImage, faGripVertical } from "@fortawesome/free-solid-svg-icons";
import { showToastSuccess, showToastError } from "@/lib/utils/toast";
import { Bounce, ToastContainer } from "react-toastify";
import Image from "next/image";

interface Banner {
  id: string;
  title: string;
  description?: string;
  image: string;
  imageId?: string;
  link?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export default function BannerManagement() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [uploading, setUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("/uploads/no_image_available.svg");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBanners, setTotalBanners] = useState(0);
  const itemsPerPage = 10;

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "/uploads/no_image_available.svg",
    imageId: "",
    link: "",
    isActive: true,
    order: 0,
  });

  useEffect(() => {
    fetchBanners();
  }, [currentPage]);

  const fetchBanners = async () => {
    try {
      const response = await fetch(`/api/v1/banners?page=${currentPage}&limit=${itemsPerPage}`);
      if (!response.ok) throw new Error("Failed to fetch banners");
      const result = await response.json();
      setBanners(result.data || []);
      if (result.pagination) {
        setTotalPages(result.pagination.totalPages);
        setTotalBanners(result.pagination.total);
      }
    } catch (error) {
      showToastError("ไม่สามารถโหลดข้อมูล Banner ได้");
    } finally {
      setIsLoading(false);
    }
  };

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
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const uploadImage = async (file: File) => {
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    const res = await fetch("/api/v1/upload", {
      method: "POST",
      body: formDataUpload,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "อัปโหลดไม่สำเร็จ");
    }

    return data.file;
  };

  const handleImageUploadForEdit = async (file: File) => {
    // สำหรับ editing mode ให้อัพโหลดทันที
    const maxSize = 5 * 1024 * 1024;
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      showToastError("รองรับเฉพาะไฟล์ JPG, PNG, WEBP เท่านั้น");
      return;
    }

    if (file.size > maxSize) {
      showToastError("ขนาดไฟล์ต้องไม่เกิน 5MB");
      return;
    }

    setUploading(true);
    try {
      const uploadedFile = await uploadImage(file);
      setFormData(prev => ({
        ...prev,
        image: uploadedFile.path,
        imageId: String(uploadedFile.id),
      }));
      showToastSuccess(`อัปโหลด ${file.name} สำเร็จ`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "อัปโหลดรูปภาพไม่สำเร็จ";
      showToastError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    // Validation
    if (!formData.title.trim()) {
      showToastError("กรุณากรอกชื่อ Banner");
      setUploading(false);
      return;
    }

    let uploadedImageId = formData.imageId;
    let uploadedImagePath = formData.image;

    try {
      // สำหรับ CREATE mode: อัพโหลดรูปก่อน
      if (!editingBanner && selectedFile) {
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

      // สำหรับ CREATE mode: ต้องมีรูป
      if (!editingBanner && uploadedImagePath === "/uploads/no_image_available.svg") {
        showToastError("กรุณาอัปโหลดรูปภาพ Banner");
        setUploading(false);
        return;
      }

      const url = editingBanner
        ? `/api/v1/banners/${editingBanner.id}`
        : "/api/v1/banners";
      const method = editingBanner ? "PUT" : "POST";

      // Auto-set order for new banners
      const dataToSend = {
        ...formData,
        image: uploadedImagePath,
        imageId: uploadedImageId,
        order: editingBanner ? formData.order : banners.length
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "บันทึกข้อมูลไม่สำเร็จ");
      }

      showToastSuccess(editingBanner ? "อัปเดต Banner สำเร็จ" : "สร้าง Banner สำเร็จ");
      fetchBanners();
      closeModal();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง";
      showToastError(errorMessage);

      // ถ้าอัพโหลดรูปสำเร็จแล้วแต่สร้าง Banner ไม่สำเร็จ ให้ลบรูปออก (เฉพาะ CREATE mode)
      if (!editingBanner && uploadedImageId && uploadedImageId !== formData.imageId) {
        try {
          await fetch(`/api/v1/upload/${uploadedImageId}`, {
            method: 'DELETE',
          });
        } catch (deleteError) {
          // Error: Failed to delete uploaded image
        }
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, imageId?: string) => {
    if (!confirm("คุณต้องการลบ Banner นี้หรือไม่?")) return;

    try {
      const response = await fetch(`/api/v1/banners/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete banner");

      showToastSuccess("ลบ Banner สำเร็จ");
      fetchBanners();
    } catch (error) {
      showToastError("ลบ Banner ไม่สำเร็จ");
    }
  };

  const toggleActive = async (banner: Banner) => {
    try {
      const response = await fetch(`/api/v1/banners/${banner.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...banner, isActive: !banner.isActive }),
      });

      if (!response.ok) throw new Error("Failed to toggle banner");

      showToastSuccess("เปลี่ยนสถานะสำเร็จ");
      fetchBanners();
    } catch (error) {
      showToastError("เปลี่ยนสถานะไม่สำเร็จ");
    }
  };

  const openModal = (banner?: Banner) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        title: banner.title,
        description: banner.description || "",
        image: banner.image,
        imageId: banner.imageId || "",
        link: banner.link || "",
        isActive: banner.isActive,
        order: banner.order,
      });
    } else {
      setEditingBanner(null);
      setFormData({
        title: "",
        description: "",
        image: "/uploads/no_image_available.svg",
        imageId: "",
        link: "",
        isActive: true,
        order: banners.length,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBanner(null);
    setUploading(false);
    setSelectedFile(null);
    setPreviewUrl("/uploads/no_image_available.svg");
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newBanners = [...banners];
    const draggedBanner = newBanners[draggedIndex];
    newBanners.splice(draggedIndex, 1);
    newBanners.splice(index, 0, draggedBanner);

    setBanners(newBanners);
    setDraggedIndex(index);
  };

  const handleDragEnd = async () => {
    if (draggedIndex === null) return;

    // Update order in database
    try {
      const updatePromises = banners.map((banner, index) =>
        fetch(`/api/v1/banners/${banner.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...banner, order: index }),
        })
      );

      await Promise.all(updatePromises);
      showToastSuccess("อัปเดตลำดับสำเร็จ");
      fetchBanners();
    } catch (error) {
      showToastError("อัปเดตลำดับไม่สำเร็จ");
    }

    setDraggedIndex(null);
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="-mx-6 px-6 flex flex-row items-center mb-6">
        <div className="flex-grow">
          <h3 className="text-2xl font-bold text-gray-700">Banner</h3>
          <p className="text-sm text-gray-500 mt-1">จัดการ Banner ทั้งหมด ({totalBanners} รายการ)</p>
        </div>
        <button
          onClick={() => openModal()}
          className="text-white bg-[#134A9B] hover:bg-blue-600 font-medium rounded-full text-sm px-5 py-2.5 text-center uppercase"
          type="button"
        >
          <FontAwesomeIcon icon={faPlus} /> Add New Banner
        </button>
      </div>

      {/* Banners Grid */}
      <div className="grid grid-cols-1 gap-4">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`bg-white rounded-lg shadow-md overflow-hidden flex flex-col md:flex-row cursor-move transition-all ${
              draggedIndex === index ? "opacity-50" : "opacity-100"
            }`}
          >
            {/* Drag Handle */}
            <div className="flex items-center justify-center p-4 bg-gray-50 cursor-grab active:cursor-grabbing">
              <FontAwesomeIcon icon={faGripVertical} className="text-gray-400 text-xl" />
            </div>

            {/* Image */}
            <div className="relative w-full md:w-64 h-48">
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                sizes="(max-width: 768px) 100vw, 256px"
                className="object-cover"
              />
            </div>

            {/* Content */}
            <div className="flex-1 p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{banner.title}</h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleActive(banner)}
                    className={`px-3 py-1 rounded ${
                      banner.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    <FontAwesomeIcon
                      icon={banner.isActive ? faToggleOn : faToggleOff}
                    />{" "}
                    {banner.isActive ? "Active" : "Inactive"}
                  </button>
                </div>
              </div>

              {banner.description && (
                <p className="text-gray-700 mb-2">{banner.description}</p>
              )}

              {banner.link && (
                <p className="text-sm text-blue-600 mb-2">Link: {banner.link}</p>
              )}

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => openModal(banner)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                >
                  <FontAwesomeIcon icon={faEdit} /> แก้ไข
                </button>
                <button
                  onClick={() => handleDelete(banner.id, banner.imageId)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                >
                  <FontAwesomeIcon icon={faTrash} /> ลบ
                </button>
              </div>
            </div>
          </div>
        ))}

        {banners.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            ยังไม่มี Banner กรุณาเพิ่ม Banner ใหม่
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            แสดง {banners.length} จาก {totalBanners} รายการ (หน้า {currentPage} / {totalPages})
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded ${
                currentPage === 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              ← ก่อนหน้า
            </button>

            {/* Page numbers */}
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded ${
                    currentPage === page
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded ${
                currentPage === totalPages
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              ถัดไป →
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingBanner ? "แก้ไข Banner" : "เพิ่ม Banner"}
                </h2>
                <button
                  type="button"
                  onClick={closeModal}
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
                >
                  <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium mb-2">ชื่อ Banner *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">คำอธิบาย</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    rows={3}
                  />
                </div>

                {/* Link */}
                <div>
                  <label className="block text-sm font-medium mb-2">ลิงก์ (URL)</label>
                  <input
                    type="url"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="https://example.com"
                  />
                </div>

                {/* Active Status */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium">
                    เปิดใช้งาน
                  </label>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    รูปภาพ Banner *
                    <span className="text-xs text-gray-500 ml-2">(JPG, PNG, WEBP | Max 5MB | แนะนำ 1920x500px)</span>
                  </label>

                  {/* Preview หรือ Upload Area */}
                  {(editingBanner ? formData.image : previewUrl) !== "/uploads/no_image_available.svg" ? (
                    <div className="space-y-2">
                      {/* Image Preview */}
                      <div className="relative w-full h-64 border-2 border-gray-300 rounded-lg overflow-hidden">
                        <Image
                          src={editingBanner ? formData.image : previewUrl}
                          alt="Banner Preview"
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover"
                        />
                        {/* Overlay with change button */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center group">
                          <label
                            htmlFor="bannerImage"
                            className="opacity-0 group-hover:opacity-100 cursor-pointer bg-white text-gray-800 px-4 py-2 rounded-lg font-medium transition-opacity"
                          >
                            เปลี่ยนรูปภาพ
                          </label>
                        </div>
                      </div>
                      <input
                        type="file"
                        id="bannerImage"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            editingBanner ? handleImageUploadForEdit(file) : handleImageSelect(file);
                          }
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
                        if (file) {
                          editingBanner ? handleImageUploadForEdit(file) : handleImageSelect(file);
                        }
                      }}
                    >
                      <input
                        type="file"
                        id="bannerImageNew"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            editingBanner ? handleImageUploadForEdit(file) : handleImageSelect(file);
                          }
                        }}
                      />
                      <label htmlFor="bannerImageNew" className="cursor-pointer">
                        <FontAwesomeIcon icon={faFileImage} size="3x" className="text-gray-400 mb-3" />
                        <p className="text-base font-medium text-gray-700 mb-1">
                          คลิกเพื่ออัปโหลด หรือ ลากไฟล์มาวางที่นี่
                        </p>
                        <p className="text-sm text-gray-500">
                          รองรับ JPG, PNG, WEBP (ขนาดไม่เกิน 5MB)
                        </p>
                        <p className="text-xs text-blue-600 mt-2">
                          แนะนำขนาด 1920 x 500 pixels สำหรับผลลัพธ์ที่ดีที่สุด
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
                    onClick={closeModal}
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
    </div>
  );
}
