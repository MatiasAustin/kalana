import { db } from '@/lib/db';
import { products, productVariants, productMedia, media } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function getProductBySlug(slug: string) {
  const product = await db.query.products.findFirst({
    where: eq(products.slug, slug),
    with: {
      variants: true,
      media: {
        with: {
          media: true
        }
      }
    }
  });

  return product;
}

export async function getAllProducts() {
  return db.query.products.findMany({
    with: {
      variants: true,
      media: {
        with: {
          media: true
        }
      }
    }
  });
}
