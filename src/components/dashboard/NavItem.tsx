/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface Props {
  href: any;
  icon: ReactNode;
  name: string;
}

export default function NavItem({ href, icon, name }: Props) {
  const pathname = usePathname();

  const activeClass = "bg-gray-600 bg-opacity-25 text-gray-100 border-gray-100";
  const inactiveClass =
    "border-gray-900 text-gray-500 hover:bg-gray-600 hover:bg-opacity-25 hover:text-gray-100";
  const isActive = pathname === `${ href }`;

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
