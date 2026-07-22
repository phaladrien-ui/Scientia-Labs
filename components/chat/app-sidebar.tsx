// components/chat/app-sidebar.tsx
"use client";

import {
  FileTextIcon,
  FlaskConicalIcon,
  GlobeIcon,
  HistoryIcon,
  MessageCircleIcon,
  PanelLeftIcon,
  PenSquareIcon,
  SearchIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import type { LucideIcon } from "lucide-react";
import useSWRInfinite from "swr/infinite";
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
import type { Chat } from "@/lib/db/schema";
import { fetcher } from "@/lib/utils";

interface NavItem {
  route: string;
  isActive: boolean;
  icon: LucideIcon;
  label: string;
  external?: boolean;
  externalIcon?: boolean;
  isHistory?: boolean;
}

function HistoryTooltipContent() {
  const t = useTranslations("chat");
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();

  const { data, isLoading, setSize, size, isValidating } = useSWRInfinite<{ chats: Chat[]; hasMore: boolean }>(
    user ? getChatHistoryPaginationKey : () => null,
    fetcher,
    { initialSize: 1 }
  );

  const chats = data?.flatMap((page) => page.chats) ?? [];
  const hasMore = data?.[data.length - 1]?.hasMore ?? false;

  return (
    <div className="w-64 rounded-xl border border-border bg-card shadow-md overflow-hidden">
      <div className="px-3 py-2.5 border-b border-border/60">
        <h3 className="text-xs font-semibold text-foreground">{t("history")}</h3>
      </div>
      <div
        className="max-h-64 overflow-y-auto"
        onScroll={(e) => {
          const el = e.currentTarget;
          if (el.scrollHeight - el.scrollTop - el.clientHeight < 20 && hasMore && !isValidating) {
            setSize(size + 1);
          }
        }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <div className="size-3 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
          </div>
        ) : chats.length === 0 ? (
          <div className="px-3 py-5 text-center text-[11px] text-muted-foreground">
            {t("noChats")}
          </div>
        ) : (
          <div className="py-1">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => router.push(`/chat/${chat.id}`)}
                className="flex items-center gap-2 w-full px-3 py-1.5 text-left text-[12px] text-foreground/80 hover:bg-muted/50 transition-colors truncate"
              >
                <MessageCircleIcon className="size-3 shrink-0 text-muted-foreground" />
                <span className="truncate">{chat.title}</span>
              </button>
            ))}
            {hasMore && (
              <div className="flex items-center justify-center py-2">
                <div className="size-3 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function AppSidebar() {
  const t = useTranslations("sidebar");
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();
  const pathname = usePathname();
  const { setOpenMobile, toggleSidebar } = useSidebar();

  const isChat = pathname === "/" || pathname.startsWith("/chat");
  const isWebsites = pathname.startsWith("/websites");
  const isArtefacts = pathname.startsWith("/artefacts");

  const navItems: NavItem[] = [
    {
      route: "/",
      isActive: isChat,
      icon: PenSquareIcon,
      label: t("newChat"),
    },
    {
      route: "/websites",
      isActive: isWebsites,
      icon: GlobeIcon,
      label: t("websites"),
    },
    {
      route: "/search",
      isActive: pathname === "/search",
      icon: SearchIcon,
      label: t("search"),
    },
    {
      route: "/artefacts",
      isActive: isArtefacts,
      icon: FileTextIcon,
      label: t("artefacts"),
    },
    {
      route: "/simulations",
      isActive: false,
      icon: FlaskConicalIcon,
      label: t("simulations"),
      external: true,
      externalIcon: true,
    },
    {
      route: "",
      isActive: false,
      icon: HistoryIcon,
      label: t("history"),
      isHistory: true,
    },
  ];

  return (
    <Sidebar collapsible="icon" className="[&>div]:!bg-zinc-50 dark:[&>div]:!bg-zinc-900 border-r border-sidebar-border">
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
              {navItems.map((item) => (
                <SidebarMenuItem
                  key={item.route || item.label}
                  className={item.isHistory ? "hidden group-data-[collapsible=icon]:block" : ""}
                >
                  {item.isHistory ? (
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton
                          className="h-8 rounded-lg px-2 text-[12px] !font-normal text-sidebar-foreground/50 dark:text-white transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-sidebar-accent/50 hover:text-sidebar-foreground dark:hover:text-white"
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <item.icon className="size-4" />
                            <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                          </div>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent
                        side="right"
                        align="start"
                        sideOffset={8}
                        className="p-0 bg-transparent border-0 shadow-none [&>span]:hidden"
                      >
                        <HistoryTooltipContent />
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <SidebarMenuButton
                      className={`h-8 rounded-lg px-2 text-[12px] !font-normal text-sidebar-foreground/50 dark:text-white transition-colors duration-150 ${
                        item.isActive
                          ? "bg-gray-100 dark:bg-sidebar-accent/50"
                          : "hover:bg-gray-100 dark:hover:bg-sidebar-accent/50 hover:text-sidebar-foreground dark:hover:text-white"
                      }${item.external ? " group/sim" : ""}`}
                      onClick={() => {
                        setOpenMobile(false);
                        if (item.external) {
                          window.open(item.route, "_blank");
                        } else {
                          router.push(item.route);
                        }
                      }}
                      tooltip={item.label}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <item.icon className="size-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.externalIcon && (
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
                      )}
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarHistory user={user} />
      </SidebarContent>
      <SidebarFooter className="border-t border-black/10 dark:border-white/10 pt-2 pb-3 relative z-10">
        <SidebarUserNav user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}