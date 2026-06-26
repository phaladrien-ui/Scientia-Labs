// components/chat/app-sidebar.tsx
"use client";

import {
  FlaskConicalIcon,
  GlobeIcon,
  PanelLeftIcon,
  PenSquareIcon,
  SearchIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { ScientiaLogo } from "@/components/chat/scientia-logo";
import {
  getChatHistoryPaginationKey,
  SidebarHistory,
} from "@/components/chat/sidebar-history";
import { SidebarUserNav } from "@/components/chat/sidebar-user-nav";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export function AppSidebar() {
  const t = useTranslations("sidebar");
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();
  const pathname = usePathname();
  const { setOpenMobile, toggleSidebar } = useSidebar();

  const isChat = pathname === "/" || pathname.startsWith("/chat");
  const isWebsites = pathname.startsWith("/websites");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="pb-0 pt-3">
        <SidebarMenu>
          <SidebarMenuItem className="flex flex-row items-center justify-between">
            <div className="group/logo relative flex items-center justify-center">
              <SidebarMenuButton
                asChild
                className="size-16 !px-0 items-center justify-center group-data-[collapsible=icon]:group-hover/logo:opacity-0"
                tooltip="Scientia Labs"
              >
                <Link href="/" onClick={() => setOpenMobile(false)}>
                  <ScientiaLogo className="-mt-1" size={56} />
                </Link>
              </SidebarMenuButton>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton
                    className="pointer-events-none absolute inset-0 size-16 opacity-0 group-data-[collapsible=icon]:pointer-events-auto group-data-[collapsible=icon]:group-hover/logo:opacity-100"
                    onClick={() => toggleSidebar()}
                  >
                    <PanelLeftIcon className="size-4" />
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent className="hidden md:block" side="right">
                  {t("openSidebar")}
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="group-data-[collapsible=icon]:hidden">
              <SidebarTrigger className="text-black/60 dark:text-white transition-colors duration-150 hover:text-black dark:hover:text-white" />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="pt-1 relative z-10">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className={`h-8 rounded-lg px-2 text-[12px] !font-normal text-sidebar-foreground/50 dark:text-white transition-colors duration-150 ${
                    isChat
                      ? "bg-gray-100 dark:bg-sidebar-accent/50"
                      : "hover:bg-gray-100 dark:hover:bg-sidebar-accent/50 hover:text-sidebar-foreground dark:hover:text-white"
                  }`}
                  onClick={() => {
                    setOpenMobile(false);
                    router.push("/");
                  }}
                  tooltip={t("newChat")}
                >
                  <PenSquareIcon className="size-4" />
                  <span>{t("newChat")}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className={`h-8 rounded-lg px-2 text-[12px] !font-normal text-sidebar-foreground/50 dark:text-white transition-colors duration-150 ${
                    isWebsites
                      ? "bg-gray-100 dark:bg-sidebar-accent/50"
                      : "hover:bg-gray-100 dark:hover:bg-sidebar-accent/50 hover:text-sidebar-foreground dark:hover:text-white"
                  }`}
                  onClick={() => {
                    setOpenMobile(false);
                    router.push("/websites");
                  }}
                  tooltip={t("websites")}
                >
                  <GlobeIcon className="size-4" />
                  <span>{t("websites")}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className={`h-8 rounded-lg px-2 text-[12px] !font-normal text-sidebar-foreground/50 dark:text-white transition-colors duration-150 ${
                    pathname === "/search"
                      ? "bg-gray-100 dark:bg-sidebar-accent/50"
                      : "hover:bg-gray-100 dark:hover:bg-sidebar-accent/50 hover:text-sidebar-foreground dark:hover:text-white"
                  }`}
                  onClick={() => {
                    setOpenMobile(false);
                    router.push("/search");
                  }}
                  tooltip={t("search")}
                >
                  <SearchIcon className="size-4" />
                  <span>{t("search")}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="h-8 rounded-lg px-2 text-[12px] !font-normal text-sidebar-foreground/50 dark:text-white transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-sidebar-accent/50 hover:text-sidebar-foreground dark:hover:text-white group/sim"
                  onClick={() => {
                    setOpenMobile(false);
                    window.open("/simulations", "_blank");
                  }}
                  tooltip={t("simulations")}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <FlaskConicalIcon className="size-4" />
                    <span>{t("simulations")}</span>
                  </div>
                  <svg
                    className="size-3 text-muted-foreground/30 group-hover/sim:text-muted-foreground/50 opacity-0 group-hover/sim:opacity-100 group-data-[collapsible=icon]:hidden transition-all ml-auto"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path d="M7 17L17 7M17 7H9M17 7V15" />
                  </svg>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarHistory user={user} />
      </SidebarContent>
      <SidebarFooter className="border-t border-black/10 dark:border-white/10 pt-2 pb-3 relative z-10">
        {user && <SidebarUserNav user={user} />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}