"use client";
import { useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { data: session } = useSession();
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b-4 border-[#134A9B]">
      <div className="flex items-center">
        <button
          onClick={onToggleSidebar}
          className="text-gray-500 focus:outline-none lg:hidden"
        >
          <svg
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 6H20M4 12H20M4 18H11"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="flex items-center">
        {session && (
          <>
            <span className="hidden text-right lg:block mr-4">
              {session?.user && (
                <>
                  <span className="block text-sm font-medium text-black uppercase">
                    {session?.user?.fname}
                  </span>
                  <span className="block text-xs font-medium">
                    {session?.user?.role}
                  </span>
                </>
              )}
            </span>
          </>
        )}

        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="relative z-10 block w-8 h-8 overflow-hidden rounded-full shadow bg-blue-600  opacity-70"
          >
            <FontAwesomeIcon icon={faUser} className="text-white" />
          </button>

          {dropdownOpen && (
            <>
              <div
                onClick={() => setDropdownOpen(false)}
                className="fixed inset-0 z-10 w-full h-full"
              ></div>

              <div className="absolute right-0 z-20 w-48 py-2 mt-2 bg-white rounded-md shadow-xl">
                <Link
                  href="/"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 hover:text-black"
                >
                  Back to Shop
                </Link>
                {session && (
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 hover:text-black"
                  >
                    Profile
                  </Link>
                )}
                <Link
                  href="#"
                  onClick={() => signOut({ callbackUrl: "/", redirect: true })}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 hover:text-black"
                >
                  Log out
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
