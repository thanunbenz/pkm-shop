import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { redirect } from "next/navigation";
import AddProductButton from "@/components/ui/AddProductButton";
import DataTable from "@/components/ui/DataTable";

async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      include: {
        code: true, // Include codes relation
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export default async function Page() {
  const session = await getServerSession(authOptions);

  // ✅ Allow OPERATOR and ADMIN
  const isStaff = session?.user?.role === "OPERATOR" || session?.user?.role === "ADMIN";

  if (!session?.user || !isStaff) {
    redirect("/");
  }

  const products = await getProducts();

  return (
    <>
      <div className="flex flex-row justify-between items-center">
        <h3 className="text-2xl font-bold text-gray-700">Product</h3>
        <AddProductButton />
      </div>
      <hr className="border-gray-300 my-3 border" />
      <DataTable initialProducts={products} />
    </>
  );
}
