/**
 * Utilities for filtering and selecting products to display in CMS sections
 * (e.g. Featured Collection on Homepage and Roastery Page).
 */

export interface ProductDisplayConfig {
  displayMode?: "all" | "collection" | "custom";
  collectionId?: string; // ID or Slug of the collection
  productIds?: string[]; // Specific product IDs selected manually
  productLimit?: number; // Maximum number of products to show (0 = unlimited)
}

export interface MinimalProduct {
  id: string;
  name: string;
  slug: string;
  blend?: string | null;
  roast?: string | null;
  tastingNotes?: string | null;
  status?: string | null;
  collections?: Array<{
    collectionId?: string;
    collection?: {
      id?: string;
      slug?: string;
      name?: string;
    } | null;
  }>;
  [key: string]: any;
}

export function filterProductsForDisplay<T extends MinimalProduct>(
  allProducts: T[],
  config?: ProductDisplayConfig
): T[] {
  if (!allProducts || allProducts.length === 0) return [];
  if (!config) return allProducts;

  const mode = config.displayMode || "all";

  let filtered: T[] = [];

  // Mode 1: Custom display by choice (Hand-picked products)
  if (mode === "custom" && Array.isArray(config.productIds) && config.productIds.length > 0) {
    const productMap = new Map(allProducts.map((p) => [p.id, p]));
    const customList: T[] = [];
    
    for (const id of config.productIds) {
      const prod = productMap.get(id);
      if (prod) {
        customList.push(prod);
      }
    }

    filtered = customList.length > 0 ? customList : allProducts;
  }
  // Mode 2: By Collection / Category
  else if (mode === "collection" && config.collectionId) {
    const target = config.collectionId.trim().toLowerCase();

    const matched = allProducts.filter((p) => {
      if (!p.collections || p.collections.length === 0) return false;
      return p.collections.some((cp: any) => {
        const c = cp?.collection || cp;
        return (
          c?.id === config.collectionId ||
          c?.collectionId === config.collectionId ||
          c?.slug?.toLowerCase() === target ||
          c?.name?.toLowerCase() === target
        );
      });
    });

    if (matched.length > 0) {
      filtered = matched;
    } else {
      // Name / Slug heuristic fallback (e.g. "daily" for Daily Series, "terra" for Terra Series)
      const cleanTarget = target.replace(/-series$/, "").replace(/-collection$/, "").trim();
      const byName = allProducts.filter((p) => 
        p.name.toLowerCase().includes(cleanTarget) || p.slug.toLowerCase().includes(cleanTarget)
      );

      filtered = byName.length > 0 ? byName : allProducts;
    }
  }
  // Mode 3: All products (or fallback default)
  else {
    filtered = allProducts;
  }

  // Apply limit if specified and positive
  if (config.productLimit && config.productLimit > 0) {
    return filtered.slice(0, config.productLimit);
  }

  return filtered;
}
