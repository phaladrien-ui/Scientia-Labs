import { getSettingsPageData } from "@/lib/settings/get-settings-page-data";
import { SecurityForm } from "./security-form";

export default async function SecurityPage() {
  const { session, prefs } = await getSettingsPageData();

  return (
    <SecurityForm initialPreferences={prefs} userId={session?.user?.id ?? ""} />
  );
}
