- ช่วยจัดการโครงสร้างไฟล์เป็น best practice ของ nextJs
- ทุกครั้งที่ implement อะไรเสร็จให้สร้างเองสารและจัดเก็บให้เรียบร้อย
- ไม่ต้องพยามรีเซิฟด้วยตัวเองให้ผู้ใช้เป็นคนรีและไม่ต้องพยาม sudo แค่แจ้งผู้ใช้พอ

Best Practices

Use Server Components by default - Only use Client Components when necessary
Optimize images - Use Next.js Image component
Implement proper error handling - Use error.tsx and not-found.tsx
Use TypeScript - For better type safety
Follow Next.js conventions - Use app directory structure
Implement proper SEO - Use metadata API
Cache effectively - Utilize Next.js caching strategies
Secure API routes - Implement proper authentication and validation
Monitor performance - Use Vercel Analytics or similar tools
Keep dependencies updated - Regularly update packages

Performance Optimization
Image Optimization
tsximport Image from 'next/image'

<Image
  src="/image.jpg"
  alt="Description"
  width={500}
  height={300}
  priority
/>
Font Optimization
tsximport { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
Lazy Loading
tsximport dynamic from 'next/dynamic'

const DynamicComponent = dynamic(() => import('./Component'), {
  loading: () => <p>Loading...</p>,
})