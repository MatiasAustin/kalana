import { DiscountsManager } from "@/components/admin/DiscountsManager";
import { getDiscounts } from "@/lib/actions/marketing";

export const dynamic = "force-dynamic";

export default async function AdminDiscountsPage() {
  const discounts = await getDiscounts();
  return <DiscountsManager initialDiscounts={discounts} />;
}
