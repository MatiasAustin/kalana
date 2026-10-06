import { CampaignsManager } from "@/components/admin/CampaignsManager";
import { getCampaigns } from "@/lib/actions/marketing";

export const dynamic = "force-dynamic";

export default async function AdminCampaignsPage() {
  const campaigns = await getCampaigns();
  return <CampaignsManager initialCampaigns={campaigns} />;
}
