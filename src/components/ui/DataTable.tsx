/* eslint-disable react-hooks/exhaustive-deps */
"use client"
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/store/useStore";

// Use a default image path
const NO_IMAGE_PATH = "/uploads/no_image_available.svg";

interface Code {
    id: number;
    code: string;
    isUsed: boolean;
    createdAt: Date;
    productId: number;
}

interface Product {
    id: number;
    name: string;
    description: string | null;
    price: number;
    discountprice: number;
    issale: boolean;
    isrecommend: boolean;
    category: string;
    image: string | null;
    code?: Code[];
}

interface DataTableProps {
    initialProducts: Product[];
}

export default function DataTableComponent({ initialProducts }: DataTableProps) {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [isClient, setIsClient] = useState(false);
    const tableRef = useRef<HTMLTableElement>(null);
    const dataTableRef = useRef<any>(null);
    const { listProducts, retrieveProductCount } = useStore();

    // Ensure component runs only on client
    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        // Refresh products when listProducts changes
        const fetchProducts = async () => {
            // Fetch all products
            const response = await fetch("/api/v1/products?limit=1000");
            const data = await response.json();
            if (data.success) {
                setProducts(data.data);
            } else {
                setProducts(data);
            }
        };

        if (listProducts > 0) {
            fetchProducts();
        }
        retrieveProductCount();
    }, [listProducts]);

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`/api/v1/products/${id}`, {
                method: "DELETE"
            });

            if (!response.ok) throw new Error("Failed to delete product");

            const result = await response.json();
            // Product deleted successfully
        } catch (error) {
            // Error deleting product - user already confirmed action
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
                        dataTableRef.current.rows.add(products);
                        dataTableRef.current.draw();
                        return;
                    } catch (e) {
                        // If update fails, destroy completely and reinit
                        try {
                            dataTableRef.current.destroy(true); // true = remove all events
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
                    data: products,
                    responsive: true,
                    pageLength: 10,
                    lengthMenu: [[5, 10, 25, 50, -1], [5, 10, 25, 50, "All"]],
                    order: [[2, 'asc']], // Sort by name column
                    destroy: true, // Allow reinitialization
                    columns: [
                        {
                            title: 'No.',
                            data: 'id',
                            render: (_data, type, _row, meta) => {
                                if (type === 'display') {
                                    return meta.row + meta.settings._iDisplayStart + 1;
                                }
                                return _data; // Return id for sorting
                            },
                            orderable: true,
                            searchable: false,
                            width: '50px'
                        },
                        {
                            title: 'Image',
                            data: 'image',
                            render: (data, type, row) => {
                                if (type === 'display') {
                                    const imgSrc = data || NO_IMAGE_PATH;
                                    return `<img src="${imgSrc}" alt="${row.name}" class="w-20 h-20 rounded-lg object-cover" onerror="this.src='${NO_IMAGE_PATH}'" />`;
                                }
                                return data;
                            },
                            orderable: false,
                            searchable: false,
                            width: '100px'
                        },
                        {
                            title: 'Name',
                            data: 'name',
                            render: (data, type) => {
                                if (type === 'display') {
                                    return `<div class="text-sm font-medium text-gray-900">${data}</div>`;
                                }
                                return data;
                            }
                        },
                        {
                            title: 'Price',
                            data: 'discountprice',
                            render: (data, type) => {
                                if (type === 'display') {
                                    return `<div class="text-sm font-medium text-gray-900">฿${Number(data).toFixed(2)}</div>`;
                                }
                                return data;
                            }
                        },
                        {
                            title: 'Sale',
                            data: 'issale',
                            render: (data, type) => {
                                if (type === 'display') {
                                    return data
                                        ? '<span class="text-green-500 text-xl">✓</span>'
                                        : '<span class="text-red-500 text-xl">✗</span>';
                                }
                                return data ? 'Yes' : 'No';
                            },
                            width: '80px'
                        },
                        {
                            title: 'Recommend',
                            data: 'isrecommend',
                            render: (data, type) => {
                                if (type === 'display') {
                                    return data
                                        ? '<span class="text-green-500 text-xl">✓</span>'
                                        : '<span class="text-red-500 text-xl">✗</span>';
                                }
                                return data ? 'Yes' : 'No';
                            },
                            width: '100px'
                        },
                        {
                            title: 'Category',
                            data: 'category',
                            render: (data, type) => {
                                if (type === 'display') {
                                    let badge = '';
                                    switch(data) {
                                        case 'PACK':
                                            badge = '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Booster Pack</span>';
                                            break;
                                        case 'BOX':
                                            badge = '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">Booster Box</span>';
                                            break;
                                        case 'PROMO':
                                            badge = '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Promo/Special</span>';
                                            break;
                                        default:
                                            badge = `<span class="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">${data}</span>`;
                                    }
                                    return badge;
                                }
                                return data;
                            }
                        },
                        {
                            title: 'Stock',
                            data: 'code',
                            render: (data, type) => {
                                const count = data?.length || 0;
                                if (type === 'display') {
                                    const colorClass = count > 0 ? 'text-green-600' : 'text-red-600';
                                    return `<div class="text-sm font-bold ${colorClass}">${count}</div>`;
                                }
                                return count;
                            },
                            width: '80px'
                        },
                        {
                            title: 'Actions',
                            data: null,
                            render: (_data, type, row) => {
                                if (type === 'display') {
                                    return `
                                        <div class="flex items-center gap-3">
                                            <a href="/product/${row.id}" class="text-indigo-600 hover:text-indigo-900 font-medium text-sm">Edit</a>
                                            <button class="delete-btn text-red-600 hover:text-red-900 font-medium text-sm" data-id="${row.id}">Delete</button>
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
                        search: "ค้นหาสินค้า:",
                        lengthMenu: "แสดง _MENU_ รายการต่อหน้า",
                        info: "แสดง _START_ ถึง _END_ จาก _TOTAL_ รายการ",
                        infoEmpty: "ไม่มีข้อมูล",
                        infoFiltered: "(กรองจากทั้งหมด _MAX_ รายการ)",
                        zeroRecords: "ไม่พบข้อมูลที่ค้นหา",
                        emptyTable: "ไม่มีข้อมูลในตาราง",
                        paginate: {
                            first: "หน้าแรก",
                            last: "หน้าสุดท้าย",
                            next: "ถัดไป →",
                            previous: "← ก่อนหน้า"
                        }
                    },
                    dom: '<"flex flex-col md:flex-row justify-between items-center mb-4 gap-3"lf>rt<"flex flex-col md:flex-row justify-between items-center mt-4 gap-3"ip>',
                    drawCallback: function() {
                        // Add event listeners to delete buttons after table is drawn
                        document.querySelectorAll('.delete-btn').forEach(btn => {
                            btn.removeEventListener('click', handleDeleteClick);
                            btn.addEventListener('click', handleDeleteClick);
                        });
                    }
                });

            } catch (error) {
                console.error("Error initializing DataTable:", error);
            }
        };

        const handleDeleteClick = async (e: Event) => {
            const target = e.target as HTMLButtonElement;
            const id = target.getAttribute('data-id');
            if (id && confirm('คุณแน่ใจหรือไม่ที่จะลบสินค้านี้?')) {
                await handleDelete(id);
                // Refresh table data
                const response = await fetch("/api/v1/products?limit=1000");
                const data = await response.json();
                if (data.success) {
                    setProducts(data.data);
                }
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
    }, [isClient, products]);

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
                                        <th className="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase">Image</th>
                                        <th className="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase">Name</th>
                                        <th className="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase">Price</th>
                                        <th className="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase">Sale</th>
                                        <th className="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase">Recommend</th>
                                        <th className="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase">Category</th>
                                        <th className="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase">Stock</th>
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
