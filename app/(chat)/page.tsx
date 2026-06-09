// app/(chat)/page.tsx
import { ChatShell } from "@/components/chat/shell";
import { ActiveChatProvider } from "@/hooks/use-active-chat";

export default function Page() {
  return (
    <ActiveChatProvider key="chat">
      <ChatShell key="chat" />
    </ActiveChatProvider>
  );
}
