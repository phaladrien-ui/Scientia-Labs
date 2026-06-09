// app/(chat)/websites/chat/[id]/page.tsx
import { ChatShell } from "@/components/chat/shell";
import { ActiveChatProvider } from "@/hooks/use-active-chat";

export default function WebsiteChatPage() {
  return (
    <ActiveChatProvider key="websites">
      <ChatShell key="websites" />
    </ActiveChatProvider>
  );
}
