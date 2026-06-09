import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/app/(auth)/auth";
import { SettingsNav } from "@/components/chat/settings/settings-nav";
import { SettingsCloseButton } from "@/components/chat/settings/settings-close-button";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.type === "guest") {
    redirect("/");
  }

  return (
    <div className="flex h-full items-center justify-center p-4">
      <div className="flex w-full max-w-7xl h-[90vh] relative">
        {/* Bouton de fermeture */}
        <SettingsCloseButton />

        {/* Master — Navigation */}
        <div className="w-64 shrink-0 border-r border-neutral-200 dark:border-neutral-800 p-6">
          <h2 className="mb-6 text-[14px] font-bold uppercase tracking-[0.15em] text-neutral-400 dark:text-neutral-500">
            Settings
          </h2>
          <SettingsNav />
        </div>

        {/* Detail — Contenu */}
        <div className="flex-1 overflow-y-auto p-14">
          <div className="max-w-4xl mx-auto">
            <Suspense fallback={<div className="flex h-full items-center justify-center" />}>
              {children}
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}