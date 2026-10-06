import { EventsManager } from "@/components/admin/EventsManager";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AdminWorkshopsPage() {
  const allEvents = await db.query.events.findMany({
    orderBy: [desc(events.date)]
  }).catch(() => []);

  return <EventsManager initialEvents={allEvents} defaultType="WORKSHOP" />;
}
