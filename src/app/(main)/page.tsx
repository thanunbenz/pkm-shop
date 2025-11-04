"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import BannerSlider from "@/components/ui/BannerSlider";
import ProductCard from "@/components/ui/ProductCard";

interface SiteSettings {
  welcomeTitle: string;
  welcomeSubtitle: string | null;
  showWelcome: boolean;
}

interface Code {
  id: number;
  isUsed: boolean;
}

interface Product {
  id: number;
  name: string;
  price: number;
  discountprice: number;
  issale: boolean;
  image: string | null;
  code?: Code[];
}

export default function Page() {
  const { data: session, status } = useSession();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [recommendProducts, setRecommendProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchSettings();
    fetchRecommendProducts();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/v1/settings");
      if (!response.ok) throw new Error("Failed to fetch settings");
      const result = await response.json();
      setSettings(result.data);
    } catch (error) {
      // Use default values if fetch fails
      setSettings({
        welcomeTitle: "Welcome to PKM Shop",
        welcomeSubtitle: "Your one-stop shop for Pokémon TCG Live codes",
        showWelcome: true
      });
    }
  };

  const fetchRecommendProducts = async () => {
    try {
      const response = await fetch("/api/v1/products/recommend");
      if (!response.ok) throw new Error("Failed to fetch recommend products");
      const result = await response.json();
      setRecommendProducts(result.data || []);
    } catch (error) {
      setRecommendProducts([]);
    }
  };

  return (
    <>
      {/* Banner Slider - Full Width */}
      <BannerSlider />

      {/* Content Section */}
      <main className="container mx-auto px-4 py-12 md:py-16">
        {/* Welcome Section */}
        {settings?.showWelcome && (
          <div className="mb-16 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">{settings.welcomeTitle}</h1>
            {settings.welcomeSubtitle && (
              <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                {settings.welcomeSubtitle}
              </p>
            )}
          </div>
        )}

        {/* Divider */}
        {settings?.showWelcome && recommendProducts.length > 0 && (
          <hr className="border-gray-200 mb-16" />
        )}

        {/* Recommend Products Section */}
        {recommendProducts.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-8" style={{ color: '#0d3461' }}>Recommend</h2>

            {/* Products Grid - 5 columns, max 2 rows (10 items) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {recommendProducts.slice(0, 10).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}