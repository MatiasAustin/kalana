"use server";

import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";
import { requireAdminApi } from "@/lib/auth";

export async function updateReviewStatus(reviewId: string, status: "APPROVED" | "REJECTED" | "PENDING") {
  try {
    await requireAdminApi();

    await db.update(reviews)
      .set({ status })
      .where(eq(reviews.id, reviewId));

    revalidatePath("/admin/products/reviews");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("[UPDATE_REVIEW_STATUS_ERROR]", error);
    return { success: false, error: error.message || "Failed to update review status" };
  }
}

export async function toggleReviewFeatured(reviewId: string, isFeatured: boolean) {
  try {
    await requireAdminApi();

    await db.update(reviews)
      .set({ isFeatured })
      .where(eq(reviews.id, reviewId));

    revalidatePath("/admin/products/reviews");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("[TOGGLE_REVIEW_FEATURED_ERROR]", error);
    return { success: false, error: error.message || "Failed to toggle featured state" };
  }
}

export async function deleteReview(reviewId: string) {
  try {
    await requireAdminApi();

    await db.delete(reviews).where(eq(reviews.id, reviewId));

    revalidatePath("/admin/products/reviews");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("[DELETE_REVIEW_ERROR]", error);
    return { success: false, error: error.message || "Failed to delete review" };
  }
}

export interface CreateReviewInput {
  productId: string;
  authorName: string;
  rating: number;
  title?: string;
  content: string;
  status?: "APPROVED" | "PENDING" | "REJECTED";
  isFeatured?: boolean;
}

export async function createReview(data: CreateReviewInput) {
  try {
    await requireAdminApi();

    const reviewId = uuidv4();
    await db.insert(reviews).values({
      id: reviewId,
      productId: data.productId,
      authorName: data.authorName.trim(),
      rating: Math.min(5, Math.max(1, Number(data.rating) || 5)),
      title: data.title?.trim() || "",
      content: data.content.trim(),
      status: data.status || "APPROVED",
      isFeatured: !!data.isFeatured,
    });

    revalidatePath("/admin/products/reviews");
    revalidatePath("/");
    return { success: true, id: reviewId };
  } catch (error: any) {
    console.error("[CREATE_REVIEW_ERROR]", error);
    return { success: false, error: error.message || "Failed to create review" };
  }
}
