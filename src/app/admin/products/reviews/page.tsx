import { db } from "@/lib/db";
import { reviews, products } from "@/lib/db/schema";
import { desc, asc } from "drizzle-orm";
import { ReviewsManager } from "@/components/admin/ReviewsManager";

export default async function ProductReviewsPage() {
  const [allReviews, allProducts] = await Promise.all([
    db.query.reviews.findMany({
      with: {
        product: true,
      },
      orderBy: [desc(reviews.createdAt)],
    }).catch(() => []),
    db.query.products.findMany({
      orderBy: [asc(products.name)],
    }).catch(() => []),
  ]);

  return (
    <div className="max-w-7xl mx-auto">
      <ReviewsManager 
        initialReviews={allReviews as any} 
        allProducts={allProducts as any} 
      />
    </div>
  );
}
