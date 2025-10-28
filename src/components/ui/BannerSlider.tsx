"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

interface Banner {
  id: string;
  title: string;
  description?: string;
  image: string;
  link?: string;
  isActive: boolean;
  order: number;
}

export default function BannerSlider() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBanners();
  }, []);

  // Auto slide every 5 seconds
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const fetchBanners = async () => {
    try {
      const response = await fetch("/api/v1/banners");
      if (!response.ok) throw new Error("Failed to fetch banners");
      const result = await response.json();
      setBanners(result.data || []);
    } catch (error) {
      console.error("Error fetching banners:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (isLoading) {
    return (
      <div className="w-full h-[400px] md:h-[500px] bg-gradient-to-r from-blue-100 to-purple-100 animate-pulse" />
    );
  }

  if (banners.length === 0) {
    return (
      <div className="w-full h-[400px] md:h-[500px] relative overflow-hidden bg-gray-200">
        <Image
          src="/uploads/no_image_available.svg"
          alt="No banners available"
          fill
          className="object-cover"
          priority
        />
      </div>
    );
  }

  const currentBanner = banners[currentIndex];

  return (
    <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden group">
      {/* Banner Image */}
      <div className="relative w-full h-full">
        {currentBanner.link ? (
          <Link href={currentBanner.link} className="block w-full h-full">
            <Image
              src={currentBanner.image}
              alt={currentBanner.title}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          </Link>
        ) : (
          <Image
            src={currentBanner.image}
            alt={currentBanner.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        )}
      </div>

      {/* Navigation Arrows - Show only if more than 1 banner */}
      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full w-12 h-12 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg"
            aria-label="Previous slide"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full w-12 h-12 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg"
            aria-label="Next slide"
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </>
      )}

      {/* Dots Indicator - Show only if more than 1 banner */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-white w-8"
                  : "bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
