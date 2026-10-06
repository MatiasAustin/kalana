import { NavigationEditor } from "@/components/admin/NavigationEditor";
import { getNavigation } from "@/lib/cms-api";

export default async function AdminNavigationPage() {
  const nav = await getNavigation();
  return <NavigationEditor initialNav={nav} />;
}
