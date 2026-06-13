import { getSettingsPageData } from "@/lib/settings/get-settings-page-data";
import { EngineForm } from "./engine-form";

export default async function EnginePage() {
  const { prefs } = await getSettingsPageData();

  return <EngineForm initialPreferences={prefs} />;
}
