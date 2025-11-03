"use client";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBagShopping,
  faMagnifyingGlass,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { useCartStore } from "@/store/useCartStore";

const Navbar = () => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: session } = useSession();
  const router = useRouter();
  const cartStore = useCartStore();

  // Prevent hydration mismatch - only run on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Update cart count whenever cart store changes (client-side only)
  useEffect(() => {
    if (!isMounted) return;

    const updateCount = () => {
      setCartItemCount(cartStore.getTotalItems());
    };

    // Initial count
    updateCount();

    // Subscribe to changes
    const unsubscribe = useCartStore.subscribe(updateCount);

    return () => unsubscribe();
  }, [isMounted, cartStore]);

  // Load cart from server when logged in
  useEffect(() => {
    if (isMounted && session?.user?.id) {
      cartStore.loadFromServer(Number(session.user.id));
    }
  }, [isMounted, session, cartStore]);

  // Handle click outside dropdown
  useEffect(() => {
    if (!isDropdownOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/search?query=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await signOut({ callbackUrl: "/", redirect: true });
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDropdownOpen((prev) => !prev);
  };

  return (
    <>
      <nav className="w-full bg-[#0B264C] text-white">
        <div className="container mx-auto flex items-center justify-between py-3 px-4">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold hover:opacity-90 transition-opacity">
            LOGO
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex w-full max-w-md relative mx-4">
            <input
              type="text"
              placeholder="ค้นหา"
              className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const query = (e.target as HTMLInputElement).value;
                  handleSearch(query);
                }
              }}
            />
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            />
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-5">
            {/* Session Info - Desktop Only */}
            {session && (
              <div className="hidden md:flex flex-col items-end text-sm">
                <div className="text-white">
                  สวัสดี, <span className="font-semibold">{session.user?.fname} {session.user?.lname}</span>
                </div>
                <div className="text-gray-300 text-xs">{session.user?.email}</div>
              </div>
            )}

            {/* Shopping Bag */}
            <Link href="/cart" className="relative hover:opacity-80 transition-opacity">
              <FontAwesomeIcon icon={faBagShopping} size="lg" />
              {isMounted && cartItemCount > 0 && (
                <span className="absolute -top-2 -right-4 bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="focus:outline-none hover:opacity-80 transition-opacity"
                aria-label="User menu"
                aria-expanded={isDropdownOpen}
              >
                <FontAwesomeIcon icon={faUser} size="lg" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white text-gray-700 rounded-lg shadow-lg z-50 overflow-hidden">
                  {!session ? (
                    <>
                      <Link
                        href="/login"
                        className="block px-4 py-2 hover:bg-gray-100 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Login
                      </Link>
                      <Link
                        href="/register"
                        className="block px-4 py-2 hover:bg-gray-100 transition-colors border-t border-gray-200"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Register
                      </Link>
                    </>
                  ) : (
                    <>
                      {(session.user?.role === "ADMIN" || session.user?.role === "OPERATOR") && (
                        <Link
                          href="/dashboard"
                          className="block px-4 py-2 hover:bg-gray-100 transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          Dashboard
                        </Link>
                      )}
                      <Link
                        href="/orders"
                        className="block px-4 py-2 hover:bg-gray-100 transition-colors border-t border-gray-200"
                        onClick={() => setDropdownOpen(false)}
                      >
                        คำสั่งซื้อของฉัน
                      </Link>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 hover:bg-gray-100 transition-colors border-t border-gray-200"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors border-t border-gray-200 text-red-600"
                      >
                        Logout
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-white focus:outline-none hover:opacity-80 transition-opacity"
              aria-label="Toggle mobile menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden px-4 pb-3">
          <div className="relative">
            <input
              type="text"
              placeholder="ค้นหา"
              className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const query = (e.target as HTMLInputElement).value;
                  handleSearch(query);
                }
              }}
            />
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            />
          </div>
        </div>
      </nav>
      {/* Category Links - Desktop */}
      <div className="hidden md:flex bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-start text-gray-800 py-2 px-4 space-x-6">
          <Link href="/" className="text-blue-600 font-medium hover:underline transition-all">
            SALE
          </Link>
          <Link href="/pack" className="hover:text-blue-600 transition-colors">
            ซอง
          </Link>
          <Link href="/deck" className="hover:text-blue-600 transition-colors">
            เด็ค
          </Link>
          <Link href="/promo" className="hover:text-blue-600 transition-colors">
            โปรโมการ์ด
          </Link>
          <Link href="/box-sleeve-coin" className="hover:text-blue-600 transition-colors">
            กล่อง สลีฟ เหรียญ
          </Link>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white text-gray-800 shadow-md border-t border-gray-200">
          <Link
            href="/"
            className="block px-4 py-3 text-blue-600 font-medium hover:bg-gray-50 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            SALE
          </Link>
          <Link
            href="/pack"
            className="block px-4 py-3 hover:bg-gray-50 hover:text-blue-600 transition-colors border-t border-gray-100"
            onClick={() => setMobileMenuOpen(false)}
          >
            ซอง
          </Link>
          <Link
            href="/deck"
            className="block px-4 py-3 hover:bg-gray-50 hover:text-blue-600 transition-colors border-t border-gray-100"
            onClick={() => setMobileMenuOpen(false)}
          >
            เด็ค
          </Link>
          <Link
            href="/promo"
            className="block px-4 py-3 hover:bg-gray-50 hover:text-blue-600 transition-colors border-t border-gray-100"
            onClick={() => setMobileMenuOpen(false)}
          >
            โปรโมการ์ด
          </Link>
          <Link
            href="/box-sleeve-coin"
            className="block px-4 py-3 hover:bg-gray-50 hover:text-blue-600 transition-colors border-t border-gray-100"
            onClick={() => setMobileMenuOpen(false)}
          >
            กล่อง สลีฟ เหรียญ
          </Link>
        </div>
      )}
    </>
  );
};

export default Navbar;
