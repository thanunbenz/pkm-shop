"use client";

import { useSession } from "next-auth/react";

export default function Page() {
  const { data: session, status } = useSession();

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Welcome to PKM Shop</h1>

      {status === "loading" ? (
        <p className="text-gray-400 mb-4">Loading...</p>
      ) : session ? (
        <div className="mb-4">
          <p className="text-lg text-gray-800">
            สวัสดี, <span className="font-semibold">{session.user?.fname} {session.user?.lname}</span>
          </p>
          <p className="text-sm text-gray-600">Email: {session.user?.email}</p>
          <p className="text-sm text-gray-600">Role: {session.user?.role}</p>
        </div>
      ) : (
        <p className="text-gray-600 mb-4">กรุณา Login เพื่อใช้งาน</p>
      )}

      <p className="text-gray-600">
        Your one-stop shop for Pokémon TCG Live codes
      </p>
    </main>
  );
}