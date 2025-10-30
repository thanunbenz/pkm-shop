"use client";

import React from "react";
import Link from "next/link";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebook,
  faInstagram,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";

export default function Footer() {
  return (
    <footer className="bg-[#1E1E1E] text-white">
      <div className="container mx-auto py-8 px-4 flex flex-col md:flex-row items-center justify-between">
        <div className="text-center md:text-left mb-6 md:mb-0">
          <h1 className="text-4xl font-bold mb-4">
            <div>LOGO</div>
          </h1>
          <div className="flex justify-center md:justify-start space-x-4">
            <Link href="#" className="block bg-white rounded p-2">
              <FontAwesomeIcon
                icon={faFacebook}
                size="xl"
                style={{ color: "#000000" }}
              />
            </Link>
            <Link href="#" className="block bg-white rounded p-2">
              <FontAwesomeIcon
                icon={faInstagram}
                size="xl"
                style={{ color: "#000000" }}
              />
            </Link>
            <Link href="#" className="block bg-white rounded p-2">
              <FontAwesomeIcon
                icon={faTwitter}
                size="xl"
                style={{ color: "#000000" }}
              />
            </Link>
          </div>
        </div>
        <div className="text-center md:text-right">
          <ul className="space-y-2 md:space-y-0 md:space-x-6 flex flex-col md:flex-row">
            <li>
              <Link href="#" className="hover:text-gray-400">
                About Us
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-gray-400">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-gray-400">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-gray-400">
                Cookie Policy
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="bg-white text-gray-700 py-4">
        <p className="text-center text-sm">
          © {new Date().getFullYear()} PKM Shop. This website is in no way affiliated with
          TPCi, Nintendo, Creatures, or Game Freak.
        </p>
      </div>
    </footer>
  );
};
