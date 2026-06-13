import { getSettingsPageData } from "@/lib/settings/get-settings-page-data";
import { MemoryForm } from "./memory-form";

export default async function MemoryPage() {
  const { prefs } = await getSettingsPageData();

  return <MemoryForm initialPreferences={prefs} />;
}
