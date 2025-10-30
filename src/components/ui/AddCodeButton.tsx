"use client";
import { faPlus, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect } from "react";
import { showToastSuccess, showToastError } from "@/lib/utils/toast";

interface Code {
    id: number;
    code: string;
    isUsed: boolean;
    createdAt: Date;
    productId: number;
}

interface AddCodeButtonProps {
    productId: string;
    onCodeAdded: () => void;
    editingCode?: Code | null;
    onCloseEdit?: () => void;
}

export default function AddCodeButton({ productId, onCodeAdded, editingCode, onCloseEdit }: AddCodeButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [code, setCode] = useState("");
    const [isUsed, setIsUsed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    useEffect(() => {
        if (editingCode) {
            setIsOpen(true);
            setCode(editingCode.code);
            setIsUsed(editingCode.isUsed);
            setEditMode(true);
            setEditingId(editingCode.id);
        }
    }, [editingCode]);

    const toggleModal = () => {
        setIsOpen(!isOpen);
        setCode("");
        setIsUsed(false);
        setEditMode(false);
        setEditingId(null);
        if (onCloseEdit) onCloseEdit();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!code.trim()) {
            showToastError("กรุณากรอก Code");
            return;
        }

        setIsSubmitting(true);

        try {
            if (editMode && editingId) {
                // Update existing code
                const response = await fetch(`/api/v1/codes/${editingId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        code: code.trim(),
                        isUsed: isUsed,
                    }),
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || "Failed to update code");
                }

                showToastSuccess("อัพเดต Code สำเร็จ!");
            } else {
                // Create new code
                const response = await fetch("/api/v1/codes", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        code: code.trim(),
                        productId: Number(productId),
                        isUsed: false,
                    }),
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || "Failed to create code");
                }

                showToastSuccess("เพิ่ม Code สำเร็จ!");
            }

            toggleModal();
            onCodeAdded();
        } catch (error) {
            console.error("Error saving code:", error);
            const errorMessage = error instanceof Error ? error.message : "บันทึก Code ไม่สำเร็จ";
            showToastError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <button
                onClick={toggleModal}
                className="text-white bg-[#134A9B] hover:bg-blue-600 font-medium rounded-full text-sm px-5 py-2.5 text-center uppercase"
                type="button"
            >
                <FontAwesomeIcon icon={faPlus} /> Add Code
            </button>

            {isOpen && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center w-full h-full bg-black bg-opacity-50"
                    onClick={toggleModal}
                >
                    <div
                        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {editMode ? "Edit Code" : "Add New Code"}
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
                                {/* Code Input */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Code *</label>
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        className="w-full border rounded px-3 py-2"
                                        placeholder="Enter code"
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>

                                {/* Status Checkbox (only show in edit mode) */}
                                {editMode && (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="isUsed"
                                            checked={isUsed}
                                            onChange={(e) => setIsUsed(e.target.checked)}
                                            className="w-4 h-4"
                                            disabled={isSubmitting}
                                        />
                                        <label htmlFor="isUsed" className="text-sm font-medium">
                                            ใช้งานแล้ว
                                        </label>
                                    </div>
                                )}

                                {/* Buttons */}
                                <div className="flex gap-2 pt-4">
                                    <button
                                        type="submit"
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded disabled:bg-gray-400"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "กำลังบันทึก..." : "บันทึก"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={toggleModal}
                                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded"
                                        disabled={isSubmitting}
                                    >
                                        ยกเลิก
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
