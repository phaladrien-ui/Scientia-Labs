import { auth } from "@/app/(auth)/auth";
import { getUserSettings } from "@/lib/db/queries";

export async function getSettingsPageData() {
  const session = await auth();
  const settings = await getUserSettings({ userId: session?.user?.id ?? "" });
  const prefs = (settings?.preferences ?? {}) as Record<string, unknown>;

  return { session, prefs };
}
