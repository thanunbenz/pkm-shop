/* eslint-disable react-hooks/exhaustive-deps */
"use client"
import { useEffect, useRef, useState } from "react";

// DataTable type from datatables.net
declare const DataTable: any;

interface Code {
    id: number;
    code: string;
    isUsed: boolean;
    createdAt: string | Date;
    productId: number;
}

interface CodeDataTableProps {
    productId: string;
    refreshTrigger: number;
    onEditCode?: (code: Code) => void;
}

export default function CodeDataTable({ productId, refreshTrigger, onEditCode }: CodeDataTableProps) {
    const [codes, setCodes] = useState<Code[]>([]);
    const [isClient, setIsClient] = useState(false);
    const tableRef = useRef<HTMLTableElement>(null);
    const dataTableRef = useRef<typeof DataTable | null>(null);

    // Ensure component runs only on client
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Fetch codes
    const fetchCodes = async () => {
        try {
            const response = await fetch(`/api/v1/products/${productId}`);
            if (!response.ok) throw new Error("Failed to fetch codes");
            const result = await response.json();
            setCodes(result.data.code || []);
        } catch (error) {
            // Error handled - empty codes state will be shown
            setCodes([]);
        }
    };

    useEffect(() => {
        fetchCodes();
    }, [productId, refreshTrigger]);

    const handleDelete = async (id: number) => {
        if (!confirm('คุณแน่ใจหรือไม่ที่จะลบ Code นี้?')) return;

        try {
            const response = await fetch(`/api/v1/codes/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete code");

            fetchCodes();
        } catch (error) {
            // Error deleting code - user already confirmed action
        }
    };

    useEffect(() => {
        if (!isClient || !tableRef.current) return;

        // Dynamic import DataTables only on client side
        const initDataTable = async () => {
            try {
                // Check if table is already initialized
                if (dataTableRef.current) {
                    try {
                        // Update data instead of reinitializing
                        dataTableRef.current.clear();
                        dataTableRef.current.rows.add(codes);
                        dataTableRef.current.draw();
                        return;
                    } catch (e) {
                        // If update fails, destroy completely and reinit
                        try {
                            dataTableRef.current.destroy(true);
                        } catch (err) {
                            console.error("Error destroying:", err);
                        }
                        dataTableRef.current = null;
                        // Clear tbody
                        const tbody = tableRef.current?.querySelector('tbody');
                        if (tbody) tbody.innerHTML = '';
                    }
                }

                // Dynamically import DataTables
                const DataTable = (await import('datatables.net-dt')).default;
                await import('datatables.net-responsive-dt');

                if (!tableRef.current) return;

                // Initialize DataTable
                dataTableRef.current = new DataTable(tableRef.current, {
                    data: codes,
                    responsive: true,
                    pageLength: 10,
                    lengthMenu: [[5, 10, 25, 50, -1], [5, 10, 25, 50, "All"]],
                    order: [[0, 'asc']], // Sort by No. column
                    destroy: true,
                    columns: [
                        {
                            title: 'No.',
                            data: 'id',
                            render: (_data, type, _row, meta) => {
                                if (type === 'display') {
                                    return meta.row + meta.settings._iDisplayStart + 1;
                                }
                                return _data;
                            },
                            orderable: true,
                            searchable: false,
                            width: '50px'
                        },
                        {
                            title: 'Code',
                            data: 'code',
                            render: (data, type) => {
                                if (type === 'display') {
                                    return `<div class="text-sm font-medium text-gray-900">${data}</div>`;
                                }
                                return data;
                            }
                        },
                        {
                            title: 'Status',
                            data: 'isUsed',
                            render: (data, type) => {
                                if (type === 'display') {
                                    return data
                                        ? '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Used</span>'
                                        : '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Available</span>';
                                }
                                return data ? 'Used' : 'Available';
                            },
                            width: '100px'
                        },
                        {
                            title: 'Created',
                            data: 'createdAt',
                            render: (data, type) => {
                                if (type === 'display') {
                                    const date = new Date(data);
                                    return `<div class="text-sm text-gray-700">${date.toLocaleDateString('th-TH')}</div>`;
                                }
                                return data;
                            },
                            width: '120px'
                        },
                        {
                            title: 'Actions',
                            data: null,
                            render: (_data, type, row) => {
                                if (type === 'display') {
                                    return `
                                        <div class="flex items-center gap-3">
                                            <button class="edit-code-btn text-indigo-600 hover:text-indigo-900 font-medium text-sm" data-id="${row.id}" data-code="${row.code}" data-isused="${row.isUsed}">Edit</button>
                                            <button class="delete-code-btn text-red-600 hover:text-red-900 font-medium text-sm" data-id="${row.id}">Delete</button>
                                        </div>
                                    `;
                                }
                                return '';
                            },
                            orderable: false,
                            searchable: false,
                            width: '120px'
                        }
                    ],
                    language: {
                        search: "ค้นหา Code:",
                        lengthMenu: "แสดง _MENU_ รายการต่อหน้า",
                        info: "แสดง _START_ ถึง _END_ จาก _TOTAL_ รายการ",
                        infoEmpty: "ไม่มีข้อมูล",
                        infoFiltered: "(กรองจากทั้งหมด _MAX_ รายการ)",
                        zeroRecords: "ไม่พบข้อมูลที่ค้นหา",
                        emptyTable: "ไม่มี Code ในตาราง",
                        paginate: {
                            first: "หน้าแรก",
                            last: "หน้าสุดท้าย",
                            next: "ถัดไป →",
                            previous: "← ก่อนหน้า"
                        }
                    },
                    dom: '<"flex flex-col md:flex-row justify-between items-center mb-4 gap-3"lf>rt<"flex flex-col md:flex-row justify-between items-center mt-4 gap-3"ip>',
                    drawCallback: function() {
                        // Add event listeners to edit buttons
                        document.querySelectorAll('.edit-code-btn').forEach(btn => {
                            btn.removeEventListener('click', handleEditClick);
                            btn.addEventListener('click', handleEditClick);
                        });

                        // Add event listeners to delete buttons
                        document.querySelectorAll('.delete-code-btn').forEach(btn => {
                            btn.removeEventListener('click', handleDeleteClick);
                            btn.addEventListener('click', handleDeleteClick);
                        });
                    }
                });

            } catch (error) {
                console.error("Error initializing DataTable:", error);
            }
        };

        const handleEditClick = (e: Event) => {
            const target = e.target as HTMLButtonElement;
            const id = target.getAttribute('data-id');
            const code = target.getAttribute('data-code');
            const isUsed = target.getAttribute('data-isused') === 'true';

            if (id && code && onEditCode) {
                const codeData: Code = {
                    id: Number(id),
                    code: code,
                    isUsed: isUsed,
                    createdAt: new Date(),
                    productId: Number(productId)
                };
                onEditCode(codeData);
            }
        };

        const handleDeleteClick = async (e: Event) => {
            const target = e.target as HTMLButtonElement;
            const id = target.getAttribute('data-id');
            if (id) {
                await handleDelete(Number(id));
            }
        };

        initDataTable();

        // Cleanup on unmount
        return () => {
            if (dataTableRef.current) {
                try {
                    dataTableRef.current.destroy();
                } catch (e) {
                    console.error("Error destroying DataTable:", e);
                }
                dataTableRef.current = null;
            }
        };
    }, [isClient, codes]);

    if (!isClient) {
        return (
            <div className="mt-4 md:mt-8 text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <p className="mt-2 text-gray-600">กำลังโหลดข้อมูล...</p>
            </div>
        );
    }

    return (
        <div className="mt-4 md:mt-8">
            <div className="flex flex-col">
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                        <div className="overflow-hidden border border-gray-200 shadow rounded-lg">
                            <table ref={tableRef} className="min-w-full divide-y divide-gray-200 display nowrap" style={{ width: '100%' }}>
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase">No.</th>
                                        <th className="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase">Code</th>
                                        <th className="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase">Created</th>
                                        <th className="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {/* DataTables will populate this */}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
