// app/(chat)/websites/page.tsx
import { ChatShellWebsites } from "@/components/chat/website-shell";
import { ActiveChatProvider } from "@/hooks/use-active-chat";

export default function WebsitesPage() {
  return (
    <ActiveChatProvider key="websites">
      <ChatShellWebsites key="websites" />
    </ActiveChatProvider>
  );
}