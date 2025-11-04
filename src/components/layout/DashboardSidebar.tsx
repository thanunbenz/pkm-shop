"use client";
import Link from "next/link";
import DashboardNavItem from "@/components/dashboard/DashboardNavItem";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLaptop,
  faBagShopping,
  faGear,
  faImage,
  faShoppingCart,
} from "@fortawesome/free-solid-svg-icons";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: Props) => {
  return (
    <div className="flex">
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-20 transition-opacity bg-black opacity-50 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 overflow-y-auto transition duration-300 transform bg-gray-900 ${
          isOpen ? "translate-x-0 ease-out" : "-translate-x-full ease-in"
        } lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-center mt-8">
          <div className="flex items-center">
            <span className="mx-2 text-2xl font-semibold text-white">
              <Link href={"/dashboard"}>Dashboard</Link>
            </span>
          </div>
        </div>

        <nav className="mt-10">
          <DashboardNavItem
            href="/dashboard"
            name="Dashboard"
            icon={<FontAwesomeIcon icon={faLaptop} />}
          />
          <DashboardNavItem
            href="/dashboard/orders"
            name="Orders"
            icon={<FontAwesomeIcon icon={faShoppingCart} />}
          />
          <DashboardNavItem
            href="/dashboard/product"
            name="Product"
            icon={<FontAwesomeIcon icon={faBagShopping} />}
          />
          <DashboardNavItem
            href="/dashboard/banner"
            name="Banner"
            icon={<FontAwesomeIcon icon={faImage} />}
          />
          <DashboardNavItem
            href="/dashboard/settings"
            name="Settings"
            icon={<FontAwesomeIcon icon={faGear} />}
          />
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
