// app/(chat)/websites/page.tsx
import { ChatShell } from "@/components/chat/shell";
import { ActiveChatProvider } from "@/hooks/use-active-chat";

export default function WebsitesPage() {
  return (
    <ActiveChatProvider key="websites">
      <ChatShell key="websites" />
    </ActiveChatProvider>
  );
}
