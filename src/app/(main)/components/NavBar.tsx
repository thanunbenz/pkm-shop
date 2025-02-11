/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";


import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faBagShopping,
  faMagnifyingGlass,
  fas,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
library.add(fas);

const Navbar = () => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <>
      <nav className="w-full bg-[#0B264C] text-white">
        <div className="container mx-auto flex items-center justify-between py-3 px-4">
          <div className="text-xl font-bold">
            <Link href={"/"}>
              {/* <img src="https://via.placeholder.com/100x100" alt="Logo" /> */}
              <div>LOGO</div>
            </Link>
          </div>

          <div className="hidden md:flex w-full max-w-md relative">
            <input
              type="text"
              placeholder="ค้นหา"
              className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 text-gray-700 focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const query = (e.target as HTMLInputElement).value;
                  router.push(`/search?query=${encodeURIComponent(query)}`);
                }
              }}
            />
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            />
          </div>
          <div className="flex items-center space-x-5">
            <div className="relative">
              <FontAwesomeIcon icon={faBagShopping} size="lg" />
              <span className="absolute -top-2 -right-4 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                0
              </span>
            </div>

            {/* User Icon */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!isDropdownOpen)}
                className="focus:outline-none"
              >
                <FontAwesomeIcon icon={faUser} size="lg" />
              </button>
              {isDropdownOpen &&
                (!session ? (
                  <div className="absolute right-0 mt-2 w-32 bg-white text-gray-700 rounded shadow-lg z-20">
                    <Link
                      href="/login"
                      className="block px-4 py-2 hover:bg-gray-200 rounded-t"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="block px-4 py-2 hover:bg-gray-200 rounded-b"
                    >
                      Register
                    </Link>
                  </div>
                ) : (
                  <div className="absolute right-0 mt-2 w-32 bg-white text-gray-700 rounded shadow-lg z-20">
                    {session.user?.role === "ADMIN" && (
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 hover:bg-gray-200 rounded-t"
                      >
                        Dashboard
                      </Link>
                    )}
                    <Link
                      href="/profile"
                      className="block px-4 py-2 hover:bg-gray-200 rounded-t"
                    >
                      Profile
                    </Link>
                    <Link
                      href=""
                      onClick={() =>
                        signOut({ callbackUrl: "/", redirect: true })
                      }
                      className="block px-4 py-2 hover:bg-gray-200 rounded-b"
                    >
                      Logout
                    </Link>
                  </div>
                ))}
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white focus:outline-none"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>
      {/* Links */}
      <div className="bg-white md:flex hidden shadow-md sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-start text-gray-800 py-2 space-x-6">
          <a href="#" className="text-blue-600 font-medium">
            SALE
          </a>
          <Link href="/pack" className="hover:text-blue-600">
            ซอง
          </Link>
          <a href="#" className="hover:text-blue-600">
            เด็ก
          </a>
          <a href="#" className="hover:text-blue-600">
            โปรโมการ์ด
          </a>
          <a href="#" className="hover:text-blue-600">
            กล่อง สลีฟ เหรียญ
          </a>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white text-gray-800">
          <a href="#" className="block px-4 py-2 text-blue-600 font-medium">
            SALE
          </a>
          <a href="#" className="block px-4 py-2 hover:text-blue-600">
            ซอง
          </a>
          <a href="#" className="block px-4 py-2 hover:text-blue-600">
            เด็ก
          </a>
          <a href="#" className="block px-4 py-2 hover:text-blue-600">
            โปรโมการ์ด
          </a>
          <a href="#" className="block px-4 py-2 hover:text-blue-600">
            กล่อง สลีฟ เหรียญ
          </a>
        </div>
      )}
    </>
  );
};

export default Navbar;
