import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";
import { Metadata } from "next";
import db from "@/lib/db";

interface ProductDetailPageProps {
  params: {
    id: string;
  };
}

async function getProduct(id: string) {
  const product = await db.product.findUnique({
    where: { id: parseInt(id, 10) },
    include: {
      code: {
        select: {
          isUsed: true,
        },
      },
    },
  });

  if (!product) {
    return null;
  }

  const availableStock = product.code.filter((c) => !c.isUsed).length;

  return {
    ...product,
    availableStock,
  };
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const product = await getProduct(params.id);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description || "",
      images: [
        {
          url: product.image || "/uploads/no_image_available.svg",
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}