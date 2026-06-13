import { getSettingsPageData } from "@/lib/settings/get-settings-page-data";
import { ToolsForm } from "./tools-form";

export default async function ToolsPage() {
  const { prefs } = await getSettingsPageData();

  return <ToolsForm initialPreferences={prefs} />;
}
