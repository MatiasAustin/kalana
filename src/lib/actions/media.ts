"use server";

import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { requireAdminApi } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";

export async function createMediaRecord(data: {
  key: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  folder: string;
}) {
  try {
    const user = await requireAdminApi();

    const id = uuidv4();
    await db.insert(media).values({
      id,
      key: data.key,
      filename: data.filename,
      url: data.url,
      mimeType: data.mimeType,
      size: data.size,
      folder: data.folder,
      uploadedBy: user.id,
    });

    revalidatePath("/admin/media");
    
    return { success: true, id, url: data.url };
  } catch (error: any) {
    console.error("[CREATE_MEDIA_ERROR]", error);
    return { success: false, error: error.message };
  }
}
