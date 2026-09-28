import { ProductForm } from "@/components/admin/ProductForm";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  // Await params if it's a promise (Next.js 15+), otherwise use as is
  const resolvedParams = await params;
  
  const product = await db.query.products.findFirst({
    where: eq(products.id, resolvedParams.id),
    with: {
      variants: true,
      media: {
        with: {
          media: true
        }
      }
    }
  });

  if (!product) {
    notFound();
  }

  // Format data for the form
  const formattedData = {
    ...product,
    media: product.media.map(pm => ({ mediaId: pm.mediaId, url: pm.media.url }))
  };

  return <ProductForm initialData={formattedData} />;
}
