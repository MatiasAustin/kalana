import ProductClient from "./ProductClient";
import { getProductByHandle } from "@/lib/cms-api";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductByHandle(params.slug);
  
  return <ProductClient product={product} />;
}
