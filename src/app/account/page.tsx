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
    <div className="container mx-auto px-4 sm:px-6 pt-32 sm:pt-36 pb-24 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-12">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-widest uppercase font-mono mb-2">My Account</h1>
          <p className="text-kalana-black/60 font-mono text-xs sm:text-sm">Manage your profile and orders</p>
        </div>
        <Link 
          href="/account/orders"
          className="flex items-center gap-2 bg-kalana-black text-kalana-offwhite px-5 sm:px-6 py-2.5 sm:py-3 font-mono text-xs tracking-widest hover:bg-black/80 transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Package className="w-4 h-4" />
          VIEW ORDERS
        </Link>
      </div>
      
      <div className="flex justify-center w-full max-w-full overflow-x-auto">
        <div className="w-full max-w-full overflow-x-auto flex justify-center">
          <UserProfile routing="hash" />
        </div>
      </div>
    </div>
  );
}
