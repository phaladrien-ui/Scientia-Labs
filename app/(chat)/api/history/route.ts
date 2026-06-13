import type { NextRequest } from "next/server";
import { deleteAllChatsByUserId, getChatsByUserId } from "@/lib/db/queries";
import { ChatbotError } from "@/lib/errors";
import { authenticateRequest } from "@/lib/auth/api-helpers";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const limit = Math.min(
    Math.max(Number.parseInt(searchParams.get("limit") || "10", 10), 1),
    50
  );
  const startingAfter = searchParams.get("starting_after");
  const endingBefore = searchParams.get("ending_before");

  if (startingAfter && endingBefore) {
    return new ChatbotError(
      "bad_request:api",
      "Only one of starting_after or ending_before can be provided."
    ).toResponse();
  }

  const authResult = await authenticateRequest("history");
  if (authResult.error) return authResult.error;

  const chats = await getChatsByUserId({
    id: authResult.session.user.id,
    limit,
    startingAfter,
    endingBefore,
  });

  return Response.json(chats);
}

export async function DELETE() {
  const authResult = await authenticateRequest("chat");
  if (authResult.error) return authResult.error;

  const result = await deleteAllChatsByUserId({
    userId: authResult.session.user.id,
  });

  return Response.json(result, { status: 200 });
}
