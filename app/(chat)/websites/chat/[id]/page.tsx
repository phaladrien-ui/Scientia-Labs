// app/(chat)/websites/chat/[id]/page.tsx
import { ChatShellWebsites } from "@/components/chat/website-shell";
import { ActiveChatProvider } from "@/hooks/use-active-chat";

export default function WebsiteChatPage() {
  return (
    <ActiveChatProvider key="websites">
      <ChatShellWebsites key="websites" />
    </ActiveChatProvider>
  );
}