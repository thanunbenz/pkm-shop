# Claude - Next.js Development Guidelines

## 🎯 Core Principles

### File Structure Management
* Follow Next.js 14+ App Router conventions strictly
* Organize files using feature-based structure when appropriate
* Keep components modular and reusable
* Separate concerns (UI, logic, data fetching)

### Documentation Practice
* **ทุกครั้งที่ implement อะไรเสร็จให้สร้างเอกสารและจัดเก็บให้เรียบร้อย**
* Document all major implementations with README files
* Include usage examples and API documentation
* Maintain a CHANGELOG.md for tracking changes

### Development Workflow
* **ไม่ต้องพยายาม restart service ด้วยตัวเอง - ให้ผู้ใช้เป็นคนดำเนินการ**
* **ไม่ต้องพยายามใช้ sudo - แค่แจ้งผู้ใช้เมื่อจำเป็น**
* Always inform user when manual intervention is needed
* Provide clear instructions for any required system operations

## 📁 Project Structure (Best Practice)

```
app/
├── (auth)/                 # Route groups for authentication
│   ├── login/
│   └── register/
├── (dashboard)/           # Protected routes
│   ├── layout.tsx
│   └── [feature]/
├── api/                   # API routes
│   └── [endpoint]/
│       └── route.ts
├── components/            # Shared components
│   ├── ui/               # UI components
│   ├── forms/            # Form components
│   └── layouts/          # Layout components
├── lib/                   # Utility functions
│   ├── utils.ts
│   ├── constants.ts
│   └── validators.ts
├── hooks/                 # Custom React hooks
├── services/             # API services
├── types/                # TypeScript types
├── styles/               # Global styles
└── public/               # Static assets
```

## 🚀 Best Practices

### 1. Use Server Components by Default
```tsx
// ✅ Server Component (default)
export default async function Page() {
  const data = await fetchData()
  return <div>{data}</div>
}

// ✅ Client Component (only when needed)
'use client'
export default function InteractiveComponent() {
  const [state, setState] = useState()
  return <button onClick={() => setState()}>Click</button>
}
```

### 2. Image Optimization
```tsx
import Image from 'next/image'

export default function OptimizedImage() {
  return (
    <Image
      src="/image.jpg"
      alt="Description"
      width={500}
      height={300}
      priority // Use for above-the-fold images
      placeholder="blur" // Add blur placeholder
      blurDataURL="..." // Base64 encoded placeholder
    />
  )
}
```

### 3. Font Optimization
```tsx
// app/layout.tsx
import { Inter, Roboto_Mono } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono',
})

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${robotoMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

### 4. Error Handling
```tsx
// app/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}

// app/not-found.tsx
export default function NotFound() {
  return (
    <div>
      <h2>404 - Page Not Found</h2>
    </div>
  )
}
```

### 5. Loading States
```tsx
// app/loading.tsx
export default function Loading() {
  return <div>Loading...</div>
}

// With Suspense
import { Suspense } from 'react'

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <AsyncComponent />
    </Suspense>
  )
}
```

### 6. Dynamic Imports & Code Splitting
```tsx
import dynamic from 'next/dynamic'

// Lazy load heavy components
const DynamicComponent = dynamic(
  () => import('./HeavyComponent'),
  {
    loading: () => <p>Loading...</p>,
    ssr: false, // Disable SSR if needed
  }
)

// Lazy load with named export
const DynamicModal = dynamic(
  () => import('./Modal').then(mod => mod.Modal),
  { loading: () => <div>Loading modal...</div> }
)
```

### 7. API Routes Best Practices
```tsx
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema
const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
})

export async function GET(request: NextRequest) {
  try {
    // Add authentication check
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const users = await fetchUsers()
    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = userSchema.parse(body)
    
    const user = await createUser(validatedData)
    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
```

### 8. Metadata & SEO
```tsx
// Static metadata
export const metadata = {
  title: 'Page Title',
  description: 'Page description',
  openGraph: {
    title: 'Page Title',
    description: 'Page description',
    images: ['/og-image.jpg'],
  },
}

// Dynamic metadata
export async function generateMetadata({ params }) {
  const product = await getProduct(params.id)
  
  return {
    title: product.title,
    description: product.description,
    openGraph: {
      images: [product.image],
    },
  }
}
```

### 9. Data Fetching Patterns
```tsx
// Server Component - Direct fetching
async function ServerComponent() {
  const data = await fetch('https://api.example.com/data', {
    next: { revalidate: 3600 }, // Revalidate every hour
  })
  
  return <div>{data}</div>
}

// Parallel data fetching
async function ParallelFetch() {
  const [users, posts] = await Promise.all([
    fetchUsers(),
    fetchPosts(),
  ])
  
  return (
    <div>
      <UserList users={users} />
      <PostList posts={posts} />
    </div>
  )
}

// Sequential when dependent
async function SequentialFetch({ userId }) {
  const user = await fetchUser(userId)
  const posts = await fetchUserPosts(user.id)
  
  return <UserProfile user={user} posts={posts} />
}
```

### 10. Performance Optimization

#### a. Route Segment Config
```tsx
// app/page.tsx
export const dynamic = 'force-dynamic' // or 'force-static'
export const revalidate = 3600 // Revalidate every hour
export const runtime = 'edge' // or 'nodejs'
```

#### b. Streaming with Suspense
```tsx
import { Suspense } from 'react'

export default function Page() {
  return (
    <>
      <Header />
      <Suspense fallback={<div>Loading content...</div>}>
        <SlowComponent />
      </Suspense>
      <Suspense fallback={<div>Loading sidebar...</div>}>
        <Sidebar />
      </Suspense>
    </>
  )
}
```

#### c. Prefetching
```tsx
import Link from 'next/link'

// Automatic prefetching (default)
<Link href="/about">About</Link>

// Disable prefetching
<Link href="/heavy-page" prefetch={false}>Heavy Page</Link>
```

## 🔐 Security Best Practices

### 1. Environment Variables
```bash
# .env.local
DATABASE_URL=postgresql://...
NEXT_PUBLIC_API_URL=https://api.example.com

# Access in code
process.env.DATABASE_URL // Server only
process.env.NEXT_PUBLIC_API_URL // Client & Server
```

### 2. Authentication Middleware
```tsx
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')
  
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/protected/:path*'],
}
```

### 3. CSRF Protection
```tsx
// Use built-in CSRF protection with Server Actions
async function serverAction(formData: FormData) {
  'use server'
  
  // Automatically CSRF protected
  const data = Object.fromEntries(formData)
  await saveData(data)
}
```

## 🧪 Testing Strategy

### 1. Unit Tests
```tsx
// __tests__/component.test.tsx
import { render, screen } from '@testing-library/react'
import Component from '@/components/Component'

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

### 2. Integration Tests
```tsx
// __tests__/api.test.ts
import { GET } from '@/app/api/users/route'

describe('/api/users', () => {
  it('returns users', async () => {
    const response = await GET(new Request('http://localhost/api/users'))
    const data = await response.json()
    expect(data).toHaveLength(10)
  })
})
```

## 📊 Performance Monitoring

### 1. Web Vitals
```tsx
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

### 2. Custom Performance Tracking
```tsx
// lib/performance.ts
export function measurePerformance(metricName: string, value: number) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'performance', {
      event_category: 'Web Vitals',
      event_label: metricName,
      value: Math.round(value),
    })
  }
}
```

## 🔄 State Management

### 1. Server State - React Query/TanStack Query
```tsx
// app/providers.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
})

export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

### 2. Client State - Zustand
```tsx
// store/useStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Store {
  count: number
  increment: () => void
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
    }),
    { name: 'app-storage' }
  )
)
```

## 📝 TypeScript Best Practices

### 1. Type Safety
```tsx
// types/index.ts
export interface User {
  id: string
  name: string
  email: string
}

export type ApiResponse<T> = {
  data: T
  error?: string
  status: number
}

// Use throughout app
const response: ApiResponse<User[]> = await fetchUsers()
```

### 2. Type Guards
```tsx
function isUser(obj: any): obj is User {
  return obj && typeof obj.id === 'string' && typeof obj.name === 'string'
}

// Usage
if (isUser(data)) {
  console.log(data.name) // TypeScript knows this is safe
}
```

## 🚢 Deployment Checklist

- [ ] Run build locally: `npm run build`
- [ ] Check TypeScript errors: `npm run type-check`
- [ ] Run tests: `npm test`
- [ ] Check bundle size: `npm run analyze`
- [ ] Verify environment variables
- [ ] Test production build locally: `npm run start`
- [ ] Check accessibility: Run lighthouse audit
- [ ] Verify SEO metadata
- [ ] Test error boundaries
- [ ] Check loading states
- [ ] Verify API error handling
- [ ] Test on multiple devices
- [ ] Check performance metrics

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Vercel Deployment](https://vercel.com/docs)
- [Web.dev Performance](https://web.dev/performance)

---

**Remember**: 
- Always prioritize user experience
- Write clean, maintainable code
- Document your implementations
- Test thoroughly before deployment
- Keep dependencies updated
- Monitor performance in production