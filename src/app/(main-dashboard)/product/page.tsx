"use client";

import { useSession } from "next-auth/react";
import AddProductButton from "@/app/(main-dashboard)/components/AddProductButton";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import DataTable from "@/app/(main-dashboard)/components/DataTable";

export default function Page() {
  const { data: session, status } = useSession();
  const [isLoading] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user || session.user.role !== "ADMIN") {
      redirect("/");
    }
  }, [session, status]);

  if (status === "loading") return <><Loading /></>;

  return (
    <>
      {isLoading && <><Loading /></>}
      <div className="flex flex-col gap-4">
        <h3 className="text-2xl font-bold text-gray-700">Product</h3>
      </div>
      <hr className="border-gray-300 my-3 border" />
      <AddProductButton />
      <DataTable />
    </>
  );
}
