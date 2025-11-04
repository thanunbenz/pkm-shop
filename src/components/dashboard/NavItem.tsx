"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

interface Props {
  href: string;
  icon: ReactNode;
  name: string;
}

export default function NavItem({ href, icon, name }: Props) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  const activeClass = "bg-gray-600 bg-opacity-25 text-gray-100 border-gray-100";
  const inactiveClass =
    "border-gray-900 text-gray-500 hover:bg-gray-600 hover:bg-opacity-25 hover:text-gray-100";

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check if current path matches exactly or is a sub-route
  // Special case: /dashboard should only match exactly, not /dashboard/*
  const isActive = isMounted
    ? href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname === href || pathname.startsWith(`${href}/`)
    : false;

  return (
    <Link
      href={href}
      className={`flex items-center px-6 py-2 mt-4 duration-200 border-l-4 ${
        isActive ? activeClass : inactiveClass
      }`}
    >
      {icon}{" "}
      <span className="mx-4">{name}</span>
    </Link>
  );
}
