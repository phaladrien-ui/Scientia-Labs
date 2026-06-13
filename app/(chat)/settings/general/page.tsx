import { getUser } from "@/lib/db/queries";
import { getSettingsPageData } from "@/lib/settings/get-settings-page-data";
import { GeneralForm } from "./general-form";

export default async function GeneralPage() {
  const { session, prefs } = await getSettingsPageData();
  const userRecord = await getUser(session?.user?.email ?? "");
  const currentUser = userRecord[0];

  return (
    <GeneralForm
      initialPreferences={prefs}
      user={{
        id: session?.user?.id ?? "",
        name: currentUser?.name ?? session?.user?.name ?? "",
        email: session?.user?.email ?? "",
        image: currentUser?.image ?? null,
        bio: currentUser?.bio ?? null,
        createdAt: currentUser?.createdAt?.toISOString() ?? null,
      }}
    />
  );
}
