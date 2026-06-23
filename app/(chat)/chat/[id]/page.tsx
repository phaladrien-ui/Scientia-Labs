// app/(chat)/chat/[id]/page.tsx
import { ChatShellChat } from "@/components/chat/chat-shell";
import { ActiveChatProvider } from "@/hooks/use-active-chat";

export default function Page() {
  return (
    <ActiveChatProvider>
      <ChatShellChat />
    </ActiveChatProvider>
  );
}