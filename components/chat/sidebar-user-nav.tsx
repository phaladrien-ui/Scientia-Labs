// components/chat/sidebar-user-nav.tsx
"use client";

import {
  LogOut,
  Moon,
  MoreHorizontal,
  Settings2,
  Sun,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { User as NextAuthUser } from "next-auth";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { guestRegex } from "@/lib/constants";
import { toast } from "./toast";

function emailToHue(email: string): number {
  let hash = 0;
  for (const char of email) {
    hash = char.charCodeAt(0) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

function getDisplayName(user?: NextAuthUser): string {
  if (!user) return "Guest";
  if (user.name) return user.name;
  if (user.email) return user.email.split("@")[0];
  return "User";
}

export function SidebarUserNav({ user }: { user?: NextAuthUser }) {
  const router = useRouter();
  const { data, status } = useSession();
  const { setTheme, resolvedTheme } = useTheme();
  const t = useTranslations("auth");

  const isGuest = guestRegex.test(data?.user?.email ?? "");
  const displayName = getDisplayName(user);

  if (status !== "authenticated") {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            className="h-10 justify-between rounded-lg bg-transparent text-sidebar-foreground/50 transition-colors duration-150 hover:text-sidebar-foreground cursor-pointer"
            onClick={() => router.push("/login")}
          >
            <div className="flex flex-row items-center gap-2">
              <User className="size-4" />
              <span className="text-[13px]">Sign in</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="h-10 px-2.5 rounded-lg bg-transparent text-sidebar-foreground/70 transition-colors duration-150 hover:text-sidebar-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer">
              <div
                className="size-5 shrink-0 rounded-full ring-1 ring-sidebar-border/50"
                style={{
                  background: `linear-gradient(135deg, oklch(0.35 0.08 ${emailToHue(user?.email ?? "")}), oklch(0.25 0.05 ${emailToHue(user?.email ?? "") + 40}))`,
                }}
              />
              <span className="truncate text-[13px] font-medium flex-1">
                {isGuest ? "Guest" : displayName}
              </span>
              <MoreHorizontal className="size-4 text-sidebar-foreground/40 shrink-0" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-56 rounded-xl border border-border/40 bg-card/95 backdrop-blur-xl shadow-[var(--shadow-float)] p-1.5"
            data-testid="user-nav-menu"
            side="top"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-3 py-2.5">
              <div
                className="size-9 shrink-0 rounded-full ring-1 ring-sidebar-border/50"
                style={{
                  background: `linear-gradient(135deg, oklch(0.4 0.1 ${emailToHue(user?.email ?? "")}), oklch(0.3 0.06 ${emailToHue(user?.email ?? "") + 40}))`,
                }}
              />
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-sidebar-foreground truncate">
                  {displayName}
                </p>
                <p className="text-[12px] text-sidebar-foreground/50 truncate">
                  {user?.email ?? "—"}
                </p>
              </div>
            </div>

            <DropdownMenuSeparator className="mx-2 my-1.5 bg-sidebar-border/40" />

            {/* Menu items */}
            <div className="space-y-0.5">
              <DropdownMenuItem
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] cursor-pointer hover:bg-sidebar-accent/50 transition-colors"
                onClick={() => router.push("/settings/general")}
              >
                <User className="size-4 text-sidebar-foreground/50" />
                <span>{t("viewProfile")}</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] cursor-pointer hover:bg-sidebar-accent/50 transition-colors"
                onClick={() => router.push("/settings/general")}
              >
                <Settings2 className="size-4 text-sidebar-foreground/50" />
                <span>{t("settings")}</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] cursor-pointer hover:bg-sidebar-accent/50 transition-colors"
                onSelect={() =>
                  setTheme(resolvedTheme === "dark" ? "light" : "dark")
                }
              >
                {resolvedTheme === "dark" ? (
                  <Sun className="size-4 text-sidebar-foreground/50" />
                ) : (
                  <Moon className="size-4 text-sidebar-foreground/50" />
                )}
                <span>
                  {resolvedTheme === "dark"
                    ? t("switchToLight")
                    : t("switchToDark")}
                </span>
              </DropdownMenuItem>
            </div>

            <DropdownMenuSeparator className="mx-2 my-1.5 bg-sidebar-border/40" />

            <DropdownMenuItem
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] cursor-pointer hover:bg-red-500/10 transition-colors text-red-500"
              onClick={() => {
                if (status !== "authenticated") {
                  toast({
                    type: "error",
                    description:
                      "Checking authentication status, please try again!",
                  });
                  return;
                }

                if (isGuest) {
                  router.push("/login");
                } else {
                  signOut({ redirectTo: "/" });
                }
              }}
            >
              <LogOut className="size-4" />
              <span>
                {isGuest ? t("loginToAccount") : t("signOut")}
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}