import { AnnouncementsManager } from "@/components/admin/AnnouncementsManager";
import { getAnnouncement } from "@/lib/cms-api";

export const dynamic = "force-dynamic";

export default async function AdminAnnouncementsPage() {
  const announcement = await getAnnouncement();

  const initialData = {
    isEnabled: announcement.isEnabled !== undefined ? Boolean(announcement.isEnabled) : true,
    text: announcement.text || "Complimentary shipping across Java on orders over IDR 300,000 | Code: KALANA2026",
    linkText: announcement.linkText || "Shop Coffee",
    linkUrl: announcement.linkUrl || "/roastery",
    bgColor: announcement.bgColor || "#0A0A0A",
    textColor: announcement.textColor || "#FFFFFF",
  };

  return <AnnouncementsManager initialData={initialData} />;
}
