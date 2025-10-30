# 🐛 รายการ Issues ทั้งหมดที่ตรวจพบ - PKM Shop

**วันที่วิเคราะห์:** 31 ตุลาคม 2025
**ระดับการตรวจสอบ:** Very Thorough
**จำนวน Issues ทั้งหมด:** 40 รายการ

---

## 📊 สรุปภาพรวม

| ระดับความสำคัญ | จำนวน | เปอร์เซ็นต์ |
|----------------|-------|------------|
| 🔴 Critical | 7 | 17.5% |
| 🟠 High | 10 | 25% |
| 🟡 Medium | 13 | 32.5% |
| 🟢 Low | 10 | 25% |
| **รวม** | **40** | **100%** |

---

## 🔴 CRITICAL ISSUES (ต้องแก้ไขทันที)

### 1. ⚠️ ระบบ Purchase/Order/Payment ยังไม่ได้ทำ
**ระดับ:** CRITICAL
**ไฟล์:** ไม่มี (ยังไม่ได้สร้าง)
**ผลกระทบ:** ระบบไม่สามารถขายของได้เลย

**ปัญหา:**
- ไม่มี API สำหรับสร้างคำสั่งซื้อ
- ไม่มีระบบชำระเงิน
- ไม่มีการส่งมอบโค้ดหลังซื้อ
- ตะกร้ามีปุ่ม "ดำเนินการชำระเงิน" แต่ไม่ทำงาน
- Database มี Model Purchase, Payment, PurchaseCode แต่ไม่มีโค้ดใช้งาน

**วิธีแก้:**
สร้างระบบสั่งซื้อครบชุด:
```
/src/app/api/v1/purchases/route.ts          - สร้างคำสั่งซื้อ
/src/app/api/v1/purchases/[id]/route.ts     - ดูรายละเอียด/อัพเดท
/src/app/api/v1/payments/route.ts           - ประมวลผลการชำระเงิน
/src/app/(main)/checkout/page.tsx           - หน้าชำระเงิน
/src/app/(main)/orders/page.tsx             - ประวัติการสั่งซื้อ
/src/app/(main)/orders/[id]/page.tsx        - ดูโค้ดที่ซื้อ
```

**Priority:** 🔴 สูงสุด - ต้องทำก่อนเปิดใช้งานจริง

---

### 2. ⚠️ Race Condition ในการ Sync ตะกร้า
**ระดับ:** CRITICAL
**ไฟล์:** [/src/app/api/v1/cart/sync/route.ts](../src/app/api/v1/cart/sync/route.ts) (บรรทัด 23-50)
**ผลกระทบ:** สต็อกถูกตรวจสอบไม่ถูกต้อง, โค้ดซ้ำกันได้

**โค้ดปัจจุบัน:**
```typescript
for (const item of items) {
    const existingCartItem = await prisma.cart.findUnique({...});
    if (existingCartItem) {
        await prisma.cart.update({
            data: { quantity: existingCartItem.quantity + item.quantity }
        });
    }
}
```

**ปัญหา:**
- ไม่มีการตรวจสอบสต็อกก่อนเพิ่มลงตะกร้า
- ไม่มี Transaction - ถ้าบางรายการล้มเหลว ข้อมูลจะไม่สมบูรณ์
- Request พร้อมกันหลายครั้งอาจทำให้เกิด Race Condition

**วิธีแก้:**
```typescript
export async function POST(request: NextRequest) {
    const body = await request.json();
    const { userId, items } = body as { userId: number; items: CartItem[] };

    try {
        await prisma.$transaction(async (tx) => {
            for (const item of items) {
                // ตรวจสอบสต็อกก่อน
                const product = await tx.product.findUnique({
                    where: { id: item.productId },
                    include: { code: { where: { isUsed: false } } }
                });

                if (!product) {
                    throw new Error(`สินค้า ID ${item.productId} ไม่พบ`);
                }

                const availableStock = product.code.length;

                const existingCartItem = await tx.cart.findUnique({
                    where: {
                        userId_productId: {
                            userId,
                            productId: item.productId,
                        },
                    },
                });

                const newQuantity = existingCartItem
                    ? existingCartItem.quantity + item.quantity
                    : item.quantity;

                if (newQuantity > availableStock) {
                    throw new Error(`สต็อกไม่เพียงพอ (เหลือ ${availableStock} ชิ้น)`);
                }

                await tx.cart.upsert({
                    where: {
                        userId_productId: {
                            userId,
                            productId: item.productId,
                        },
                    },
                    create: {
                        userId,
                        productId: item.productId,
                        quantity: item.quantity,
                    },
                    update: {
                        quantity: newQuantity,
                    },
                });
            }
        });

        return NextResponse.json({
            success: true,
            message: "ซิงค์ตะกร้าสำเร็จ",
        });
    } catch (error) {
        console.error("Cart sync error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "เกิดข้อผิดพลาด"
            },
            { status: 400 }
        );
    }
}
```

**Priority:** 🔴 สูงมาก

---

### 3. ⚠️ ไม่มีการตรวจสอบสต็อกในการเพิ่มสินค้าลงตะกร้า
**ระดับ:** CRITICAL
**ไฟล์:**
- [/src/app/api/v1/cart/route.ts](../src/app/api/v1/cart/route.ts) (ทุก method)
- [/src/components/ui/ProductCard.tsx](../src/components/ui/ProductCard.tsx) (บรรทัด 45-79)

**ผลกระทบ:** ผู้ใช้สามารถเพิ่มสินค้าเกินสต็อกได้

**โค้ดปัจจุบัน (POST):**
```typescript
const created = await prisma.cart.create({
    data: {
        userId: parseInt(userId),
        productId: parseInt(productId),
        quantity: quantity || 1,  // ❌ ไม่ตรวจสอบสต็อก
    }
});
```

**วิธีแก้:**
เพิ่มการตรวจสอบสต็อกในทุก method:
```typescript
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, productId, quantity = 1 } = body;

        // Validate input
        const userIdNum = parseInt(userId);
        const productIdNum = parseInt(productId);
        const quantityNum = parseInt(quantity);

        if (isNaN(userIdNum) || isNaN(productIdNum) || isNaN(quantityNum)) {
            return NextResponse.json(
                { error: "ข้อมูลไม่ถูกต้อง" },
                { status: 400 }
            );
        }

        if (quantityNum <= 0) {
            return NextResponse.json(
                { error: "จำนวนต้องมากกว่า 0" },
                { status: 400 }
            );
        }

        // ตรวจสอบสต็อก
        const product = await prisma.product.findUnique({
            where: { id: productIdNum },
            include: { code: { where: { isUsed: false } } }
        });

        if (!product) {
            return NextResponse.json(
                { error: "ไม่พบสินค้า" },
                { status: 404 }
            );
        }

        const availableStock = product.code.length;

        const existingCartItem = await prisma.cart.findUnique({
            where: {
                userId_productId: {
                    userId: userIdNum,
                    productId: productIdNum,
                },
            },
        });

        const currentQuantity = existingCartItem?.quantity || 0;
        const newTotalQuantity = currentQuantity + quantityNum;

        if (newTotalQuantity > availableStock) {
            return NextResponse.json(
                {
                    error: "สต็อกไม่เพียงพอ",
                    availableStock,
                    requestedQuantity: newTotalQuantity
                },
                { status: 400 }
            );
        }

        // เพิ่มหรืออัพเดทตะกร้า
        const cartItem = await prisma.cart.upsert({
            where: {
                userId_productId: {
                    userId: userIdNum,
                    productId: productIdNum,
                },
            },
            create: {
                userId: userIdNum,
                productId: productIdNum,
                quantity: quantityNum,
            },
            update: {
                quantity: newTotalQuantity,
            },
        });

        return NextResponse.json({ success: true, data: cartItem });
    } catch (error) {
        console.error("Add to cart error:", error);
        return NextResponse.json(
            { error: "เกิดข้อผิดพลาด" },
            { status: 500 }
        );
    }
}
```

**Priority:** 🔴 สูงมาก

---

### 4. ⚠️ parseInt ไม่ปลอดภัย (ไม่มีการตรวจสอบ NaN)
**ระดับ:** CRITICAL
**ไฟล์:** หลายไฟล์ API
**ผลกระทบ:** ค่า NaN อาจส่งไปยัง Database ทำให้เกิด Error

**ตำแหน่งที่พบ:**
- `/src/app/api/v1/cart/route.ts` (บรรทัด 20, 21, 39, 40, 73, 74, 87, 88, 91, 120, 121)
- `/src/app/api/v1/codes/route.ts` (บรรทัด 46)
- API routes อื่นๆ

**โค้ดที่มีปัญหา:**
```typescript
userId: parseInt(userId),        // ❌ ถ้า userId = "abc" จะได้ NaN
productId: parseInt(productId),  // ❌ ถ้า productId = null จะได้ NaN
quantity: parseInt(quantity)     // ❌ ไม่มีการตรวจสอบ
```

**วิธีแก้:**
สร้าง Utility Function:
```typescript
// /src/lib/utils/parse.ts
export function parseIntSafe(value: any, fieldName: string): number {
    const parsed = parseInt(value);
    if (isNaN(parsed)) {
        throw new Error(`${fieldName} ต้องเป็นตัวเลข`);
    }
    return parsed;
}

export function parseFloatSafe(value: any, fieldName: string): number {
    const parsed = parseFloat(value);
    if (isNaN(parsed)) {
        throw new Error(`${fieldName} ต้องเป็นตัวเลข`);
    }
    return parsed;
}
```

ใช้งาน:
```typescript
try {
    const userIdNum = parseIntSafe(userId, "User ID");
    const productIdNum = parseIntSafe(productId, "Product ID");
    const quantityNum = parseIntSafe(quantity, "จำนวน");

    // ใช้งานต่อ...
} catch (error) {
    return NextResponse.json(
        { error: error.message },
        { status: 400 }
    );
}
```

**Priority:** 🔴 สูง

---

### 5. ⚠️ การ Update Banner/Code ขาด Validation
**ระดับ:** CRITICAL
**ไฟล์:**
- [/src/app/api/v1/banners/[id]/route.ts](../src/app/api/v1/banners/[id]/route.ts) (PUT, บรรทัด 54-64)
- [/src/app/api/v1/codes/[id]/route.ts](../src/app/api/v1/codes/[id]/route.ts) (PUT, บรรทัด 57)

**โค้ดที่มีปัญหา:**
```typescript
// Banner PUT - ไม่มี validation
const banner = await prisma.banner.update({
    where: { id },
    data: {
        title,        // ❌ อาจเป็น undefined
        description,  // ❌ ไม่มี validation
        image,        // ❌ ไม่มี validation
        imageId,
        link,
        isActive,
        order,
    }
});

// Code PUT - รับ body ทั้งหมดโดยไม่กรอง (อันตราย!)
const updatedCode = await prisma.code.update({
    where: { id: parseInt(id) },
    data: body,  // ❌ Client สามารถส่งข้อมูลอะไรก็ได้
});
```

**ผลกระทบ:**
- ข้อมูลอาจถูกตั้งเป็น undefined/null โดยไม่ตั้งใจ
- Code update รับ field ใดๆ จาก client (ไม่ปลอดภัย)
- อาจทำให้ข้อมูลเสียหาย

**วิธีแก้:**
ใช้ Zod validation และทำ whitelist:

```typescript
// /src/lib/validations/banner.ts
import { z } from "zod";

export const bannerUpdateSchema = z.object({
    title: z.string().min(1, "กรุณาใส่หัวข้อ").optional(),
    description: z.string().optional(),
    image: z.string().url("URL รูปภาพไม่ถูกต้อง").optional(),
    imageId: z.string().optional(),
    link: z.string().url("URL ลิงก์ไม่ถูกต้อง").optional().nullable(),
    isActive: z.boolean().optional(),
    order: z.number().int().min(0).optional(),
});

export const codeUpdateSchema = z.object({
    code: z.string().min(1).optional(),
    isUsed: z.boolean().optional(),
    productId: z.number().int().positive().optional(),
});
```

ใช้ใน API:
```typescript
// Banner PUT
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();

        // Validate input
        const validatedData = bannerUpdateSchema.parse(body);

        // Update with validated data only
        const banner = await prisma.banner.update({
            where: { id: params.id },
            data: validatedData,
        });

        return NextResponse.json({ success: true, data: banner });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "ข้อมูลไม่ถูกต้อง", details: error.errors },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: "เกิดข้อผิดพลาด" },
            { status: 500 }
        );
    }
}

// Code PUT
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();

        // Validate and whitelist fields
        const validatedData = codeUpdateSchema.parse(body);

        const updatedCode = await prisma.code.update({
            where: { id: parseInt(params.id) },
            data: validatedData,  // ✅ ใช้เฉพาะ field ที่ validate แล้ว
        });

        return NextResponse.json({ success: true, data: updatedCode });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "ข้อมูลไม่ถูกต้อง", details: error.errors },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: "เกิดข้อผิดพลาด" },
            { status: 500 }
        );
    }
}
```

**Priority:** 🔴 สูง

---

### 6. ⚠️ ไม่มี Authentication ใน Cart Endpoints
**ระดับ:** CRITICAL
**ไฟล์:** [/src/app/api/v1/cart/*.ts](../src/app/api/v1/cart/)
**ผลกระทบ:** ผู้ใช้คนหนึ่งสามารถแก้ไขตะกร้าของคนอื่นได้

**โค้ดปัจจุบัน:**
```typescript
export async function POST(request: NextRequest) {
    const body = await request.json();
    const { userId, productId, quantity } = body;  // ❌ ไม่มีการตรวจสอบ auth

    // User สามารถส่ง userId อะไรก็ได้มา
    await prisma.cart.create({
        data: {
            userId: parseInt(userId),  // ❌ อันตราย!
            productId: parseInt(productId),
            quantity,
        }
    });
}
```

**วิธีแก้:**
เพิ่มการตรวจสอบ Session:

```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export async function POST(request: NextRequest) {
    try {
        // ตรวจสอบ session
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: "กรุณาเข้าสู่ระบบ" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { productId, quantity } = body;  // ไม่รับ userId จาก body

        // ใช้ userId จาก session
        const userId = parseInt(session.user.id);

        // ตรวจสอบสต็อกและเพิ่มลงตะกร้า...

        return NextResponse.json({ success: true, data: cartItem });
    } catch (error) {
        return NextResponse.json(
            { error: "เกิดข้อผิดพลาด" },
            { status: 500 }
        );
    }
}
```

**ใช้กับ API ทั้งหมด:**
- `POST /api/v1/cart` - เพิ่มสินค้า
- `PUT /api/v1/cart` - อัพเดทจำนวน
- `DELETE /api/v1/cart` - ลบสินค้า
- `GET /api/v1/cart/[userId]` - ดูตะกร้า (ตรวจสอบว่า userId ตรงกับ session)
- `POST /api/v1/cart/sync` - ซิงค์ตะกร้า

**Priority:** 🔴 สูงสุด - เป็นช่องโหว่ด้านความปลอดภัย

---

### 7. ⚠️ ไม่มีระบบรับโค้ดหลังซื้อ
**ระดับ:** CRITICAL
**ผลกระทบ:** ลูกค้าซื้อแล้วไม่ได้รับโค้ด

**ปัญหา:**
- ไม่มีการสร้าง PurchaseCode หลังชำระเงิน
- ไม่มีหน้าแสดงโค้ดที่ซื้อ
- ไม่มีการส่งอีเมลแจ้งโค้ด
- ไม่มีการอัพเดท `Code.isUsed = true`

**วิธีแก้:**
สร้างระบบรับโค้ดครบชุด:

```typescript
// /src/app/api/v1/purchases/[id]/complete/route.ts
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const purchaseId = parseInt(params.id);

        await prisma.$transaction(async (tx) => {
            // ดึงข้อมูลคำสั่งซื้อ
            const purchase = await tx.purchase.findUnique({
                where: { id: purchaseId },
                include: { product: true }
            });

            if (!purchase) {
                throw new Error("ไม่พบคำสั่งซื้อ");
            }

            if (purchase.userId !== parseInt(session.user.id)) {
                throw new Error("ไม่มีสิทธิ์");
            }

            if (purchase.status !== "PENDING") {
                throw new Error("คำสั่งซื้อนี้ดำเนินการแล้ว");
            }

            // หาโค้ดที่ยังไม่ถูกใช้
            const codes = await tx.code.findMany({
                where: {
                    productId: purchase.productId,
                    isUsed: false,
                },
                take: purchase.quantity,
            });

            if (codes.length < purchase.quantity) {
                throw new Error("สต็อกไม่เพียงพอ");
            }

            // สร้าง PurchaseCode
            for (const code of codes) {
                await tx.purchaseCode.create({
                    data: {
                        purchaseId: purchase.id,
                        codeId: code.id,
                    },
                });

                // ทำเครื่องหมายว่าโค้ดถูกใช้แล้ว
                await tx.code.update({
                    where: { id: code.id },
                    data: { isUsed: true },
                });
            }

            // อัพเดทสถานะคำสั่งซื้อ
            await tx.purchase.update({
                where: { id: purchaseId },
                data: { status: "COMPLETED" },
            });

            // อัพเดทสถานะการชำระเงิน
            await tx.payment.update({
                where: { purchaseId },
                data: { paymentStatus: "SUCCESS" },
            });
        });

        return NextResponse.json({
            success: true,
            message: "ดำเนินการสำเร็จ",
        });
    } catch (error) {
        console.error("Complete purchase error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "เกิดข้อผิดพลาด" },
            { status: 400 }
        );
    }
}
```

สร้างหน้าดูโค้ด:
```tsx
// /src/app/(main)/orders/[id]/page.tsx
export default async function OrderDetailPage({ params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    const purchase = await prisma.purchase.findUnique({
        where: { id: parseInt(params.id) },
        include: {
            product: true,
            purchaseCodes: {
                include: {
                    code: true,
                },
            },
        },
    });

    if (!purchase || purchase.userId !== parseInt(session.user.id)) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-4">รายละเอียดคำสั่งซื้อ #{purchase.id}</h1>

            <div className="bg-white rounded-lg shadow p-6">
                <p>สินค้า: {purchase.product.name}</p>
                <p>จำนวน: {purchase.quantity} ชิ้น</p>
                <p>ราคารวม: ฿{purchase.totalAmount}</p>
                <p>สถานะ: {purchase.status}</p>

                {purchase.status === "COMPLETED" && (
                    <div className="mt-6">
                        <h2 className="text-xl font-bold mb-2">โค้ดของคุณ:</h2>
                        <div className="space-y-2">
                            {purchase.purchaseCodes.map((pc, index) => (
                                <div key={pc.id} className="bg-gray-100 p-3 rounded font-mono">
                                    {index + 1}. {pc.code.code}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
```

**Priority:** 🔴 สูงสุด - ฟีเจอร์หลักของระบบ

---

## 🟠 HIGH PRIORITY ISSUES

### 8. console.log ในโค้ด Production
**ระดับ:** HIGH
**ไฟล์:** 33 ไฟล์มี console.log/error
**ผลกระทบ:** ประสิทธิภาพลดลง, ข้อมูลรั่วไหล

**หมายเหตุ:**
- `next.config.ts` มี `removeConsole: process.env.NODE_ENV === 'production'`
- แต่ลบแค่ `console.log` ไม่ลบ `console.error`

**วิธีแก้:**
1. ลบ console.log ทั้งหมด
2. แทนที่ console.error ด้วย logging service
3. ใช้ Winston หรือ Pino

```typescript
// /src/lib/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}

export default logger;
```

ใช้งาน:
```typescript
import logger from '@/lib/logger';

// แทน console.error
logger.error('Error message', { error, context });

// แทน console.log
logger.info('Info message', { data });
```

**Priority:** 🟠 สูง

---

### 9. Error Message เปิดเผยข้อมูลภายใน
**ระดับ:** HIGH
**ไฟล์:** [/src/app/api/v1/products/[id]/route.ts](../src/app/api/v1/products/[id]/route.ts) (บรรทัด 33)
**ผลกระทบ:** ข้อมูลภายในระบบรั่วไหล

**โค้ดปัจจุบัน:**
```typescript
return NextResponse.json(
    {
        success: false,
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error"  // ❌ เปิดเผย error message
    },
    { status: 500 }
);
```

**วิธีแก้:**
```typescript
// Log error ไว้ใน server
logger.error('Product fetch error:', { error, productId: id });

// ส่งข้อความทั่วไปให้ client
return NextResponse.json(
    { success: false, error: "ไม่สามารถดึงข้อมูลสินค้าได้" },
    { status: 500 }
);
```

**ใช้กับ API ทั้งหมด**

**Priority:** 🟠 สูง

---

### 10. การตรวจสอบรูปภาพอ่อนแอใน Upload PUT
**ระดับ:** HIGH
**ไฟล์:** [/src/app/api/v1/upload/[id]/route.ts](../src/app/api/v1/upload/[id]/route.ts) (PUT method)
**ผลกระทบ:** สามารถอัพโหลดไฟล์ที่เป็นอันตรายได้

**โค้ดปัจจุบัน:**
```typescript
const allowedExtensions = [".pdf", ".jpg", ".png", ".webp"];
const fileExtension = path.extname(file.name).toLowerCase();  // ❌ เช็คแค่นามสกุล

// User สามารถเปลี่ยนชื่อ malicious.exe -> malicious.jpg
```

**หมายเหตุ:** POST endpoint มีการตรวจสอบ magic bytes แล้ว แต่ PUT ไม่มี

**วิธีแก้:**
คัดลอก validation จาก POST route:

```typescript
// เพิ่มฟังก์ชันตรวจสอบ magic bytes
function validateFileType(buffer: Buffer, fileExtension: string): boolean {
    if (fileExtension === '.jpg' || fileExtension === '.jpeg') {
        return buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
    }
    if (fileExtension === '.png') {
        return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
    }
    if (fileExtension === '.webp') {
        const isRIFF = buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46;
        const isWEBP = buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;
        return isRIFF && isWEBP;
    }
    if (fileExtension === '.pdf') {
        return buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46;
    }
    return false;
}

// ใช้ใน PUT
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    // ... code อื่นๆ ...

    const buffer = Buffer.from(await file.arrayBuffer());
    const isValidType = validateFileType(buffer, fileExtension);

    if (!isValidType) {
        return NextResponse.json(
            { error: "ไฟล์ไม่ตรงกับประเภทที่อนุญาต" },
            { status: 400 }
        );
    }

    // ... ดำเนินการต่อ ...
}
```

**Priority:** 🟠 สูง

---

### 11. ไม่มี Rate Limiting ในหลาย Endpoints
**ระดับ:** HIGH
**ผลกระทบ:** เสี่ยงต่อการโจมตี DDoS

**มีการป้องกัน:**
- ✅ `/api/v1/register` - 5 requests/ชั่วโมง
- ✅ `/api/v1/upload` - 10 requests/นาที

**ไม่มีการป้องกัน:**
- ❌ `/api/v1/cart/*`
- ❌ `/api/v1/products/*`
- ❌ `/api/v1/codes/*`
- ❌ `/api/v1/banners/*`

**วิธีแก้:**
ใช้ `apiRateLimiter` กับ API ทั้งหมด:

```typescript
import { apiRateLimiter } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
    // เช็ค rate limit
    const rateLimitResult = await apiRateLimiter.check(request, 20, "1 m");

    if (!rateLimitResult.success) {
        return NextResponse.json(
            { error: "ส่ง request บ่อยเกินไป กรุณารอสักครู่" },
            { status: 429 }
        );
    }

    // ... ดำเนินการต่อ ...
}
```

**แนะนำ Rate Limit:**
- Cart API: 30 requests/นาที
- Products GET: 60 requests/นาที
- Products POST/PUT/DELETE: 10 requests/นาที
- Codes: 10 requests/นาที
- Banners: 30 requests/นาที

**Priority:** 🟠 สูง

---

### 12. TypeScript Build Errors ถูกปิดไว้
**ระดับ:** HIGH
**ไฟล์:** [/Users/sumbenz/Desktop/pkm-shop/next.config.ts](../next.config.ts) (บรรทัด 28-35)

**โค้ดปัจจุบัน:**
```typescript
eslint: {
    ignoreDuringBuilds: true,  // ❌ แนวทางที่ไม่ดี
},
typescript: {
    ignoreBuildErrors: true,  // ❌ อันตราย
}
```

**ผลกระทบ:**
- Type safety ถูกปิดการใช้งาน
- อาจเกิด runtime errors

**วิธีแก้:**
1. ลบ configuration ทั้งสองนี้
2. แก้ไข TypeScript errors ทั้งหมด
3. แก้ไข ESLint warnings

```bash
# ดู TypeScript errors
npx tsc --noEmit

# ดู ESLint errors
npm run lint

# แก้ไข
```

**Priority:** 🟠 สูง

---

### 13. ใช้ 'any' Type มากเกินไป
**ระดับ:** MEDIUM → HIGH
**ไฟล์:** หลายไฟล์
**ผลกระทบ:** Type safety ลดลง

**ตำแหน่งที่พบ:**
- `/src/app/api/v1/products/route.ts` (บรรทัด 8-10, 73)
- `/src/app/api/v1/register/route.ts` (บรรทัด 7-9, 22-23, 86)
- `/src/app/api/v1/upload/[id]/route.ts` (บรรทัด 1 - eslint disabled)

**วิธีแก้:**
สร้าง interfaces/types ที่ชัดเจน:

```typescript
// /src/types/api/request.ts
export interface AddToCartRequest {
    productId: number;
    quantity: number;
}

export interface UpdateCartRequest {
    cartId: number;
    quantity: number;
}

export interface CreateProductRequest {
    name: string;
    description?: string;
    price: number;
    discountprice: number;
    issale: boolean;
    isrecommend: boolean;
    category: "PACK" | "BOX" | "PROMO";
}
```

**Priority:** 🟠 ปานกลาง-สูง

---

### 14. Settings API มี Race Condition
**ระดับ:** MEDIUM
**ไฟล์:** [/src/app/api/v1/settings/route.ts](../src/app/api/v1/settings/route.ts) (GET, บรรทัด 11-21)
**ผลกระทบ:** อาจสร้าง settings หลายตัว

**โค้ดปัจจุบัน:**
```typescript
let settings = await prisma.siteSettings.findFirst();
if (!settings) {
    settings = await prisma.siteSettings.create({...});  // ❌ Race condition
}
```

**ถ้า request เข้ามาพร้อมกัน อาจสร้างได้หลายตัว**

**วิธีแก้:**
```typescript
const settings = await prisma.siteSettings.upsert({
    where: { id: 1 },  // ใช้ fixed ID
    create: {
        id: 1,
        welcomeTitle: "Welcome to PKM Shop",
        showWelcome: true,
    },
    update: {},  // ไม่อัพเดทอะไร
});
```

**Priority:** 🟡 ปานกลาง

---

### 15. Insecure Direct Object Reference (IDOR)
**ระดับ:** MEDIUM
**ไฟล์:** หลาย endpoints
**ผลกระทบ:** User สามารถเข้าถึง/แก้ไข resource ของคนอื่นได้

**ตัวอย่าง:**
- `GET /api/v1/products/[id]` - ไม่มีการตรวจสอบ auth (แต่ถ้าเป็น public ก็ OK)
- `GET /api/v1/cart/[userId]` - ต้องเช็คว่า userId ตรงกับ session
- `PUT /api/v1/banners/[id]` - ต้องเช็ค role

**วิธีแก้:**
เพิ่มการตรวจสอบสิทธิ์:
```typescript
// สำหรับ cart
const session = await getServerSession(authOptions);
if (!session || session.user.id !== params.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
}

// สำหรับ admin functions
if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

**Priority:** 🟡 ปานกลาง

---

### 16. ไม่มี Error Boundaries
**ระดับ:** MEDIUM
**ไฟล์:** ไม่มี `error.tsx` ยกเว้น `not-found.tsx`
**ผลกระทบ:** Error handling ไม่ดี, จอขาว

**วิธีแก้:**
สร้าง error.tsx:

```tsx
// /src/app/(main)/error.tsx
'use client';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="container mx-auto px-4 py-16 text-center">
            <h2 className="text-2xl font-bold mb-4">เกิดข้อผิดพลาด</h2>
            <p className="mb-4">ขออภัย เกิดข้อผิดพลาดในการแสดงผล</p>
            <button
                onClick={reset}
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            >
                ลองใหม่
            </button>
        </div>
    );
}
```

สร้างสำหรับ:
- `/src/app/(main)/error.tsx`
- `/src/app/(dashboard)/error.tsx`

**Priority:** 🟡 ปานกลาง

---

### 17. Wildcard Image Hostname (SSRF)
**ระดับ:** MEDIUM
**ไฟล์:** [next.config.ts](../next.config.ts) (บรรทัด 7-8)

**โค้ดปัจจุบัน:**
```typescript
remotePatterns: [{
    protocol: 'https',
    hostname: '**',  // ❌ อนุญาตทุก domain
}]
```

**ผลกระทบ:**
- SSRF vulnerability
- สามารถโหลดรูปจาก malicious sources

**วิธีแก้:**
```typescript
remotePatterns: [
    {
        protocol: 'https',
        hostname: 'your-cdn.com',
        pathname: '/uploads/**',
    },
    {
        protocol: 'https',
        hostname: 'trusted-image-source.com',
    }
]
```

**Priority:** 🟡 ปานกลาง

---

## 🟡 MEDIUM PRIORITY ISSUES

### 18. Pagination ไม่มี Max Limit
**ระดับ:** MEDIUM
**ไฟล์:** [/src/app/api/v1/banners/route.ts](../src/app/api/v1/banners/route.ts) (บรรทัด 15-16)

**โค้ดปัจจุบัน:**
```typescript
const page = parseInt(searchParams.get('page') || '1');
const limit = parseInt(searchParams.get('limit') || '10');  // ❌ ไม่มี max
```

**User สามารถส่ง `limit=999999` ทำให้หน่วยความจำเต็ม**

**วิธีแก้:**
```typescript
const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
const limit = Math.min(
    Math.max(1, parseInt(searchParams.get('limit') || '10')),
    100  // ✅ จำกัดไม่เกิน 100
);
```

**Priority:** 🟡 ปานกลาง

---

### 19. Database ไม่มี Indexes บางตัว
**ระดับ:** MEDIUM
**ไฟล์:** [prisma/schema.prisma](../prisma/schema.prisma)
**ผลกระทบ:** Query ช้าเมื่อข้อมูลเยอะ

**Indexes ที่ขาด:**
- `Cart.createdAt` - สำหรับ cleanup queries
- `Purchase.createdAt` - สำหรับ history queries
- `Payment.createdAt` - สำหรับ reports

**วิธีแก้:**
```prisma
model Cart {
    // ... fields ...

    @@unique([userId, productId])
    @@index([userId])
    @@index([productId])
    @@index([createdAt])  // ✅ เพิ่ม
}

model Purchase {
    // ... fields ...

    @@index([userId])
    @@index([productId])
    @@index([status])
    @@index([createdAt])  // ✅ เพิ่ม
}

model Payment {
    // ... fields ...

    @@index([paymentStatus])
    @@index([createdAt])  // ✅ เพิ่ม
}
```

**Priority:** 🟡 ปานกลาง

---

### 20. ไม่มี CSRF Protection
**ระดับ:** MEDIUM
**ผลกระทบ:** State-changing requests เสี่ยงต่อ CSRF

**หมายเหตุ:** Next.js 15 API routes ต้องใส่ CSRF protection เอง

**วิธีแก้:**
ใช้ `next-csrf`:

```bash
npm install next-csrf
```

```typescript
// /src/lib/csrf.ts
import { createCsrfProtect } from 'next-csrf';

const { csrfProtect, getCsrfToken } = createCsrfProtect({
    secret: process.env.NEXTAUTH_SECRET!,
});

export { csrfProtect, getCsrfToken };
```

ใช้ใน API:
```typescript
import { csrfProtect } from '@/lib/csrf';

export async function POST(request: NextRequest) {
    await csrfProtect(request);

    // ... ดำเนินการต่อ ...
}
```

**Priority:** 🟡 ปานกลาง

---

### 21-27. ปัญหาอื่นๆ ระดับ MEDIUM

**21. Password Requirements อ่อนแอ** - ไม่มี special character
**22. N+1 Query** - แก้ไขแล้วด้วย `include` ✅
**23. Missing Environment Validation** - ควรสร้าง env schema
**24. No Soft Delete** - ควรเพิ่ม `deletedAt`
**25. No Audit Trail** - ไม่มี `updatedBy`, change logs
**26. Cart ไม่มี Expiration** - cart เก่าสะสม
**27. Inconsistent Error Format** - ควร standardize

---

## 🟢 LOW PRIORITY ISSUES

### 28. Product POST มี Field 'stock' ไม่ได้ใช้
**ระดับ:** LOW
**ไฟล์:** [/src/app/api/v1/products/route.ts](../src/app/api/v1/products/route.ts) (POST, บรรทัด 147-149)

**โค้ดปัจจุบัน:**
```typescript
const price = parseFloat(formData.get("price") as string);
const stock = parseInt(formData.get("stock") as string);  // ❌ Product ไม่มี field stock
```

**หมายเหตุ:** Product model ไม่มี `stock` field, คำนวณจาก `code.length`

**วิธีแก้:**
ลบ parameter นี้หรืออธิบายว่าใช้ทำอะไร

**Priority:** 🟢 ต่ำ

---

### 29. ขาด Loading States บางจุด
**ระดับ:** LOW
**ผลกระทบ:** UX ไม่ดีระหว่างโหลดข้อมูล

**มี loading states:**
- ✅ `/src/app/(dashboard)/product/loading.tsx`
- ✅ `/src/app/(main)/loading.tsx`
- ✅ `/src/components/ui/DataTable.tsx`

**ขาด:**
- Cart operations
- Product card add to cart
- Banner slider

**Priority:** 🟢 ต่ำ

---

### 30. Error Response Format ไม่สม่ำเสมอ
**ระดับ:** LOW
**ผลกระทบ:** Client-side error handling ซับซ้อน

**Formats ที่พบ:**
- `{ error: "message" }`
- `{ success: false, error: "message" }`
- `{ success: false, message: "message" }`

**วิธีแก้:**
Standardize เป็น:
```typescript
// Success
{ success: true, data: any }

// Error
{ success: false, error: string }
```

**Priority:** 🟢 ต่ำ

---

### 31-40. ปัญหาอื่นๆ ระดับ LOW

**31. Missing Accessibility Labels** - alt text, aria-labels
**32. Commented Code** - ไม่พบ ✅
**33. Hydration Mismatch** - แก้ไขแล้ว ✅
**34. Bundle Size** - DataTables ใหญ่
**35. Image Optimization** - ใช้ Next/Image แล้ว ✅
**36. Stock Management** - ไม่มี reservation
**37. Order Status** - ไม่มีหน้า admin จัดการ
**38. Email Notifications** - ไม่มี
**39. .gitignore** - ครบถ้วน ✅
**40. Timing Attack** - แก้ไขแล้ว ✅

---

## 📋 แผนการแก้ไข

### สัปดาห์ที่ 1 (Critical)
- [ ] 1. สร้างระบบ Purchase/Payment/Checkout ครบชุด
- [ ] 2. แก้ Cart Sync Race Condition (ใช้ transaction)
- [ ] 3. เพิ่ม Stock Validation ใน Cart API ทุก method
- [ ] 4. สร้าง parseIntSafe utility และใช้แทน parseInt
- [ ] 5. เพิ่ม Validation ใน Banner/Code Update (Zod)
- [ ] 6. เพิ่ม Authentication check ใน Cart endpoints
- [ ] 7. สร้างระบบรับโค้ดหลังซื้อ (PurchaseCode flow)

### สัปดาห์ที่ 2-3 (High)
- [ ] 8. ลบ console.log และสร้าง logging system
- [ ] 9. แก้ Error messages ไม่ให้เปิดเผยข้อมูล
- [ ] 10. เพิ่ม magic bytes validation ใน Upload PUT
- [ ] 11. เพิ่ม Rate Limiting ทุก API endpoints
- [ ] 12. ลบ TypeScript/ESLint ignore และแก้ errors
- [ ] 13. แทนที่ 'any' type ด้วย interfaces
- [ ] 14. แก้ Settings API race condition (upsert)
- [ ] 15. เพิ่ม Authorization checks (IDOR)
- [ ] 16. สร้าง Error Boundaries
- [ ] 17. จำกัด Image hostname (แก้ SSRF)

### เดือนที่ 1 (Medium)
- [ ] 18. เพิ่ม max limit ใน pagination
- [ ] 19. เพิ่ม database indexes
- [ ] 20. เพิ่ม CSRF protection
- [ ] 21. ปรับปรุง password requirements
- [ ] 22. สร้าง env validation schema
- [ ] 23. เพิ่ม soft delete
- [ ] 24. สร้าง audit logging
- [ ] 25. สร้าง cart cleanup job
- [ ] 26. Standardize error responses

### เดือนที่ 2+ (Low & Enhancements)
- [ ] 27. แก้ไข accessibility issues
- [ ] 28. เพิ่ม loading states ครบ
- [ ] 29. Optimize bundle size
- [ ] 30. สร้างหน้า admin order management
- [ ] 31. เพิ่ม email notifications
- [ ] 32. เพิ่ม monitoring และ alerting
- [ ] 33. สร้าง comprehensive test suite
- [ ] 34. Security audit และ penetration testing
- [ ] 35. Performance optimization (Redis cache)

---

## 🎯 คำแนะนำสำคัญ

### ⚡ ต้องแก้ก่อนเปิดใช้งานจริง:
1. ระบบ Purchase/Payment (Issue #1, #7)
2. Cart Security (Issue #2, #3, #6)
3. Input Validation (Issue #4, #5)

### 🛡️ Security ที่ต้องแก้:
- Authentication on Cart endpoints (#6)
- Rate limiting (#11)
- Input validation (#4, #5)
- Error exposure (#9)
- Upload validation (#10)
- CSRF protection (#20)

### 📈 Performance:
- Database indexes (#19)
- Logging system (#8)
- Bundle optimization (#34)

### 👨‍💻 Code Quality:
- TypeScript errors (#12)
- Remove 'any' types (#13)
- Error boundaries (#16)
- Consistent error format (#30)

---

## 📊 สรุปสถานะ

**ระบบมีพื้นฐานที่ดีในหลายจุด:**
- ✅ Authentication ครบถ้วน
- ✅ Rate limiting บาง endpoints
- ✅ Next.js patterns ถูกต้อง
- ✅ Prisma schema ออกแบบดี
- ✅ Hydration mismatch แก้ไขแล้ว

**แต่ยังมีปัญหาที่ต้องแก้:**
- ❌ ระบบ Purchase/Payment ยังไม่มี (Core feature)
- ❌ Cart validation ไม่เพียงพอ
- ❌ Security gaps หลายจุด
- ❌ Error handling ไม่สม่ำเสมอ

**คะแนนความพร้อม:** 65/100
- พร้อมใช้งาน (เบื้องต้น): 50%
- พร้อม Production: 35%

**เวลาที่ต้องใช้แก้ไข (ประมาณการ):**
- Critical Issues: 2-3 สัปดาห์
- High Priority: 2-3 สัปดาห์
- Medium Priority: 3-4 สัปดาห์
- Low Priority: 2-3 สัปดาห์
- **รวม: 9-13 สัปดาห์** (2-3 เดือน)

---

**สร้างเมื่อ:** 31 ตุลาคม 2025
**เวอร์ชัน:** 1.0.0
**สถานะ:** Ready for Action
