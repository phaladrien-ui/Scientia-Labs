import { z } from "zod";
import { getVotesByChatId, voteMessage } from "@/lib/db/queries";
import { ChatbotError } from "@/lib/errors";
import {
  authenticateRequest,
  authorizeChatAccess,
} from "@/lib/auth/api-helpers";

const voteSchema = z.object({
  chatId: z.string(),
  messageId: z.string(),
  type: z.enum(["up", "down"]),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get("chatId");

  if (!chatId) {
    return new ChatbotError(
      "bad_request:api",
      "Parameter chatId is required."
    ).toResponse();
  }

  const authResult = await authenticateRequest("vote");
  if (authResult.error) return authResult.error;

  const chatResult = await authorizeChatAccess(
    chatId,
    authResult.session.user.id,
    "vote"
  );
  if (chatResult.error) return chatResult.error;

  const votes = await getVotesByChatId({ id: chatId });

  return Response.json(votes, { status: 200 });
}

export async function PATCH(request: Request) {
  let chatId: string;
  let messageId: string;
  let type: "up" | "down";

  try {
    const parsed = voteSchema.parse(await request.json());
    chatId = parsed.chatId;
    messageId = parsed.messageId;
    type = parsed.type;
  } catch {
    return new ChatbotError(
      "bad_request:api",
      "Parameters chatId, messageId, and type are required."
    ).toResponse();
  }

  const authResult = await authenticateRequest("vote");
  if (authResult.error) return authResult.error;

  const chatResult = await authorizeChatAccess(
    chatId,
    authResult.session.user.id,
    "vote"
  );
  if (chatResult.error) return chatResult.error;

  await voteMessage({
    chatId,
    messageId,
    type,
  });

  return new Response("Message voted", { status: 200 });
}
