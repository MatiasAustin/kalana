import { EmailCaptureManager } from "@/components/admin/EmailCaptureManager";
import { getSubscribers } from "@/lib/actions/marketing";

export const dynamic = "force-dynamic";

export default async function AdminEmailCapturePage() {
  const subscribers = await getSubscribers();
  return <EmailCaptureManager initialSubscribers={subscribers} />;
}
