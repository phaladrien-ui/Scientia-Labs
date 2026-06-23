import { getUserStats } from "@/lib/db/queries";
import { getSettingsPageData } from "@/lib/settings/get-settings-page-data";
import { BillingForm } from "./billing-form";

export default async function BillingPage() {
  const { session, prefs } = await getSettingsPageData();
  const stats = await getUserStats({ userId: session?.user?.id ?? "" });

  return <BillingForm stats={stats} initialPreferences={prefs} />;
}
