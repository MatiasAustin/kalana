"use server";

import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { requireAdminApi } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { eq, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function createEvent(data: {
  title: string;
  slug: string;
  description?: string;
  type?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  price?: number;
  registrationUrl?: string;
  status?: string;
}) {
  try {
    await requireAdminApi();

    const id = uuidv4();
    const eventDate = data.date ? new Date(data.date) : new Date();

    await db.insert(events).values({
      id,
      title: data.title,
      slug: data.slug || `event-${Date.now()}`,
      description: data.description,
      type: data.type || "WORKSHOP",
      date: eventDate,
      startTime: data.startTime,
      endTime: data.endTime,
      price: data.price || 0,
      registrationUrl: data.registrationUrl,
      status: data.status || "UPCOMING",
    });

    revalidatePath("/space/workshops");
    revalidatePath("/admin/space/workshops");
    revalidatePath("/admin/space/events");

    return { success: true, id };
  } catch (error: any) {
    console.error("[CREATE_EVENT_ERROR]", error);
    return { success: false, error: error.message };
  }
}

export async function updateEvent(id: string, data: any) {
  try {
    await requireAdminApi();

    const eventDate = data.date ? new Date(data.date) : undefined;

    await db.update(events)
      .set({
        title: data.title,
        slug: data.slug,
        description: data.description,
        type: data.type,
        ...(eventDate ? { date: eventDate } : {}),
        startTime: data.startTime,
        endTime: data.endTime,
        price: data.price,
        registrationUrl: data.registrationUrl,
        status: data.status,
      })
      .where(eq(events.id, id));

    revalidatePath("/space/workshops");
    revalidatePath("/admin/space/workshops");
    revalidatePath("/admin/space/events");

    return { success: true };
  } catch (error: any) {
    console.error("[UPDATE_EVENT_ERROR]", error);
    return { success: false, error: error.message };
  }
}

export async function deleteEvent(id: string) {
  try {
    await requireAdminApi();

    await db.delete(events).where(eq(events.id, id));

    revalidatePath("/space/workshops");
    revalidatePath("/admin/space/workshops");
    revalidatePath("/admin/space/events");

    return { success: true };
  } catch (error: any) {
    console.error("[DELETE_EVENT_ERROR]", error);
    return { success: false, error: error.message };
  }
}
