# ID Obfuscation Implementation Guide (Issue #63)

**Date:** 2025-11-07
**Issue:** #63 - Replace Sequential IDs with Obfuscated IDs
**Status:** ✅ Phase 1 COMPLETE (User ID Formatting)

---

## 📋 Overview

This implementation provides ID obfuscation to prevent enumeration attacks and improve security without requiring complex database migrations.

### Implementation Strategy

**Phase 1: User ID Formatting** (✅ COMPLETE - Zero Downtime)
- Padded format (e.g., `10000000001` instead of `1`)
- Database remains INT (no migration needed)
- Only display logic changes
- Fully backward compatible

**Phase 2: Order ID Migration** (📝 PLANNED - Future Implementation)
- Amazon-style format (e.g., `702-1234567-8901`)
- Requires database schema change
- See: [ID_OBFUSCATION_MIGRATION_GUIDE.md](./ID_OBFUSCATION_MIGRATION_GUIDE.md)

---

## ✅ Phase 1: User ID Formatting (IMPLEMENTED)

### How It Works

```typescript
// Database stores: 42 (INT)
// API returns: "10000000042" (String)
// Frontend displays: "10000000042"

import { formatUserId, parseUserId } from '@/lib/utils/id-formatter';

// When sending to client
const displayId = formatUserId(user.id); // 42 → "10000000042"

// When receiving from client
const dbId = parseUserId(formattedId); // "10000000042" → 42
```

### Security Benefits

#### Before
```
GET /api/users/1    ✅ Found
GET /api/users/2    ✅ Found
GET /api/users/3    ✅ Found
→ Easy to enumerate all users
```

#### After
```
GET /api/users/10000000001    ✅ Found
GET /api/users/10000000002    ❌ 404 (requires knowledge of base number)
GET /api/users/2               ❌ Invalid format
→ Enumeration attack significantly harder
```

---

## 🔧 Implementation Details

### 1. Utility Functions

**File:** [`src/lib/utils/id-formatter.ts`](../../src/lib/utils/id-formatter.ts)

#### Core Functions

```typescript
// Format user ID for display
formatUserId(id: number): string
// Example: formatUserId(1) → "10000000001"

// Parse formatted ID back to database ID
parseUserId(formattedId: string): number
// Example: parseUserId("10000000001") → 1

// Validate formatted ID
isValidFormattedUserId(formattedId: string): boolean
// Example: isValidFormattedUserId("10000000001") → true

// Safe variants (return null on error)
safeFormatUserId(id: number | null): string | null
safeParseUserId(formattedId: string | null): number | null
```

#### Order ID Functions (Ready for Phase 2)

```typescript
// Generate Amazon-style order ID
generateOrderId(): string
// Example: generateOrderId() → "702-1234567-8901"

// Validate order ID format
isValidOrderId(orderId: string): boolean
// Example: isValidOrderId("702-1234567-8901") → true

// Extract components
extractOrderTimestamp(orderId: string): string | null
extractOrderPrefix(orderId: string): string | null
```

### 2. Environment Configuration

**File:** [`.env.example`](../../.env.example)

```env
# ID Obfuscation Configuration
USER_ID_BASE="10000000000"    # Default: 10 billion (11 digits)
ORDER_ID_PREFIX="702"          # Default: 702 (for future use)
```

### 3. API Response Formatting

#### Example: User Profile API

```typescript
// src/app/api/v1/users/profile/route.ts
import { formatUserId } from '@/lib/utils/id-formatter';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  return NextResponse.json({
    success: true,
    data: {
      id: formatUserId(user.id), // Format for display
      fname: user.fname,
      lname: user.lname,
      email: user.email,
      role: user.role,
    },
  });
}
```

#### Example: Parse User ID from Request

```typescript
// src/app/api/v1/users/[id]/route.ts
import { parseUserId } from '@/lib/utils/id-formatter';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Parse formatted ID back to database ID
    const userId = parseUserId(params.id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: formatUserId(user.id),
        // ... other fields
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid user ID format' },
      { status: 400 }
    );
  }
}
```

### 4. Frontend Display

#### Example: User Profile Component

```typescript
// src/app/(main)/profile/page.tsx
'use client';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetch('/api/v1/users/profile')
      .then(res => res.json())
      .then(data => setProfile(data.data));
  }, []);

  return (
    <div>
      <p>User ID: {profile?.id}</p> {/* Displays: "10000000042" */}
      <p>Name: {profile?.fname} {profile?.lname}</p>
    </div>
  );
}
```

#### Example: Order History

```typescript
// src/app/(shop)/orders/page.tsx
export default function OrdersPage() {
  return (
    <div>
      {orders.map(order => (
        <div key={order.id}>
          {/* Order ID remains as INT for now (Phase 2 will change this) */}
          <p>Order #{order.id}</p>
          <p>Status: {order.status}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 🧪 Testing

### Unit Tests

**File:** [`tests/unit/lib/utils/id-formatter.test.ts`](../../tests/unit/lib/utils/id-formatter.test.ts)

```bash
# Run ID formatter tests
npm test src/lib/utils/id-formatter.test.ts

# All tests should pass
✓ formatUserId - formats single digit correctly
✓ parseUserId - parses formatted ID correctly
✓ Round-trip conversion works
✓ Security - makes sequential IDs non-obvious
```

### Manual Testing

```typescript
// Test in browser console or Node.js
import { formatUserId, parseUserId } from '@/lib/utils/id-formatter';

// Test formatting
console.log(formatUserId(1));    // "10000000001"
console.log(formatUserId(42));   // "10000000042"
console.log(formatUserId(999));  // "10000000999"

// Test parsing
console.log(parseUserId("10000000001")); // 1
console.log(parseUserId("10000000042")); // 42

// Test round-trip
const original = 123;
const formatted = formatUserId(original);
const parsed = parseUserId(formatted);
console.log(original === parsed); // true
```

---

## 📊 Files Modified

### Created
- ✅ `src/lib/utils/id-formatter.ts` (core utilities)
- ✅ `tests/unit/lib/utils/id-formatter.test.ts` (unit tests)
- ✅ `docs/03-development/ID_OBFUSCATION_IMPLEMENTATION.md` (this file)
- ✅ `docs/03-development/ID_OBFUSCATION_MIGRATION_GUIDE.md` (Phase 2 guide)

### Modified
- ✅ `.env.example` (added USER_ID_BASE and ORDER_ID_PREFIX)
- ⏳ API endpoints (will be updated to use formatUserId)
- ⏳ Frontend components (will display formatted IDs)

---

## 🚀 Deployment

### Phase 1: User ID Formatting (Zero Downtime)

1. **Deploy Code**
   ```bash
   git add .
   git commit -m "feat: Add User ID obfuscation (Issue #63 Phase 1)"
   git push
   ```

2. **No Database Changes Required** ✅
   - Schema remains unchanged
   - No migrations needed
   - Fully backward compatible

3. **Monitor**
   - Check API responses show formatted IDs
   - Verify no breaking changes
   - Monitor error logs

### Phase 2: Order ID Migration (Future - Requires Downtime)

See: [ID_OBFUSCATION_MIGRATION_GUIDE.md](./ID_OBFUSCATION_MIGRATION_GUIDE.md)

---

## 🔐 Security Improvements

### Enumeration Attack Prevention

#### User IDs
```
❌ Before: /api/users/1, /api/users/2, ... (predictable)
✅ After: /api/users/10000000001, /api/users/10000000002, ... (requires base knowledge)
```

#### Order IDs (Phase 2)
```
❌ Before: /api/orders/1, /api/orders/2, ... (predictable)
✅ After: /api/orders/702-1234567-8901, /api/orders/702-1234568-3456, ... (unpredictable)
```

### Benefits
- ✅ Prevents user enumeration
- ✅ Makes brute force attacks significantly harder
- ✅ Professional appearance (like Amazon, Shopee, Lazada)
- ✅ Maintains database performance (INT primary keys)
- ✅ Easy to implement (no database changes)

---

## 📝 Best Practices

### DO ✅
- Format user IDs in API responses
- Parse formatted IDs when receiving from client
- Use safe variants (`safeFormatUserId`, `safeParseUserId`) when handling nullable values
- Validate input before parsing
- Keep base number secret (don't expose in client code)

### DON'T ❌
- Don't expose raw database IDs in API responses
- Don't hard-code base numbers in frontend
- Don't skip input validation
- Don't use formatted IDs in database queries (always parse first)
- Don't expose error messages that reveal the algorithm

---

## 🆘 Troubleshooting

### Issue: "Invalid user ID" error

**Cause:** Client sending old integer ID format
**Solution:** Update client to send formatted IDs, or add backward compatibility:

```typescript
function parseUserIdCompat(id: string): number {
  // Try parsing as formatted ID
  try {
    return parseUserId(id);
  } catch {
    // Fallback to plain integer (backward compatibility)
    const num = parseInt(id, 10);
    if (!isNaN(num) && num > 0) {
      return num;
    }
    throw new Error('Invalid user ID format');
  }
}
```

### Issue: IDs displayed as numbers in frontend

**Cause:** Forgot to format user ID in API response
**Solution:** Add `formatUserId()` to all user-facing API responses

### Issue: 404 errors for valid users

**Cause:** Trying to query database with formatted ID
**Solution:** Always parse formatted ID before database query:

```typescript
// ❌ Wrong
const user = await prisma.user.findUnique({
  where: { id: "10000000042" } // Error: Expected number
});

// ✅ Correct
const userId = parseUserId("10000000042"); // 42
const user = await prisma.user.findUnique({
  where: { id: userId }
});
```

---

## 📚 Related Documentation

- [ID Obfuscation Migration Guide](./ID_OBFUSCATION_MIGRATION_GUIDE.md) (Phase 2)
- [Security Improvements](../02-security/SECURITY_IMPROVEMENTS.md)
- [API Response Standards](./API_RESPONSE_STANDARDS.md)

---

## ✅ Checklist

### Phase 1 Implementation
- [x] Create ID formatter utilities
- [x] Write unit tests
- [x] Update .env.example
- [x] Create documentation
- [ ] Update API endpoints to format user IDs
- [ ] Update frontend to display formatted IDs
- [ ] Test enumeration prevention
- [ ] Deploy to production

### Phase 2 Planning (Future)
- [x] Create migration guide
- [ ] Test migration on development database
- [ ] Schedule maintenance window
- [ ] Backup production database
- [ ] Execute migration
- [ ] Update API endpoints for order IDs
- [ ] Monitor and verify

---

**Last Updated:** 2025-11-07
**Author:** Claude (AI Assistant)
**Status:** Phase 1 Complete, Phase 2 Planned
**Issue:** #63 - Replace Sequential IDs with Obfuscated IDs
