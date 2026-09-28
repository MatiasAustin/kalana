import ProductClient from "./ProductClient";
import { getProductByHandle } from "@/lib/cms-api";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  const resolvedParams = await params;
  const product = await getProductByHandle(resolvedParams.slug);
  
  return <ProductClient product={product} />;
}
