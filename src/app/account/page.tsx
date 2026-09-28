import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserProfile } from "@clerk/nextjs";
import Link from "next/link";
import { Package } from "lucide-react";

export default async function AccountPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto px-6 py-24 min-h-screen">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-3xl font-bold tracking-widest uppercase font-mono mb-2">My Account</h1>
          <p className="text-kalana-black/60 font-mono text-sm">Manage your profile and orders</p>
        </div>
        <Link 
          href="/account/orders"
          className="flex items-center gap-2 bg-kalana-black text-kalana-offwhite px-6 py-3 font-mono text-xs tracking-widest hover:bg-black/80 transition-colors"
        >
          <Package className="w-4 h-4" />
          VIEW ORDERS
        </Link>
      </div>
      
      <div className="flex justify-center">
        <UserProfile routing="hash" />
      </div>
    </div>
  );
}
