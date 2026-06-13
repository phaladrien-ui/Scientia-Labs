import type { Session } from "next-auth";
import { auth } from "@/app/(auth)/auth";
import { getChatById } from "@/lib/db/queries";
import { ChatbotError, type Surface } from "@/lib/errors";

type AuthResult =
  | { session: Session & { user: NonNullable<Session["user"]> }; error?: never }
  | { session?: never; error: Response };

export async function authenticateRequest(
  surface: Surface
): Promise<AuthResult> {
  const session = await auth();

  if (!session?.user) {
    return {
      error: new ChatbotError(`unauthorized:${surface}`).toResponse(),
    };
  }

  return {
    session: session as AuthResult extends { session: infer S } ? S : never,
  } as AuthResult;
}

type ChatAuthResult =
  | {
      chat: NonNullable<Awaited<ReturnType<typeof getChatById>>>;
      error?: never;
    }
  | { chat?: never; error: Response };

export async function authorizeChatAccess(
  chatId: string,
  userId: string,
  surface: Surface
): Promise<ChatAuthResult> {
  const chat = await getChatById({ id: chatId });

  if (!chat) {
    return {
      error: new ChatbotError(`not_found:${surface}`).toResponse(),
    };
  }

  if (chat.userId !== userId) {
    return {
      error: new ChatbotError(`forbidden:${surface}`).toResponse(),
    };
  }

  return { chat };
}
