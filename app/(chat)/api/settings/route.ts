import { auth } from "@/app/(auth)/auth";
import {
  deleteAllChatsByUserId,
  deleteUserById,
  getUser,
  getUserSettings,
  getUserStats,
  updateUserProfile,
  upsertUserSettings,
} from "@/lib/db/queries";
import { ChatbotError } from "@/lib/errors";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return new ChatbotError("unauthorized:chat").toResponse();
  }

  const [stats, settings, userRecord] = await Promise.all([
    getUserStats({ userId: session.user.id }),
    getUserSettings({ userId: session.user.id }),
    getUser(session.user.email ?? ""),
  ]);

  const currentUser = userRecord[0];

  return Response.json({
    user: {
      id: session.user.id,
      name: currentUser?.name ?? session.user.name ?? null,
      email: session.user.email ?? null,
      image: currentUser?.image ?? session.user.image ?? null,
      bio: currentUser?.bio ?? null,
      type: session.user.type,
      createdAt: currentUser?.createdAt?.toISOString() ?? null,
    },
    stats,
    preferences: settings?.preferences ?? {},
  });
}

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return new ChatbotError("unauthorized:chat").toResponse();
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return new ChatbotError(
      "bad_request:api",
      "Invalid JSON in request body."
    ).toResponse();
  }

  const { name, bio, image, preferences } = body as {
    name?: string;
    bio?: string;
    image?: string;
    preferences?: Record<string, unknown>;
  };

  if (name !== undefined || bio !== undefined || image !== undefined) {
    await updateUserProfile({
      userId: session.user.id,
      name,
      bio,
      image,
    });
  }

  if (preferences !== undefined) {
    await upsertUserSettings({
      userId: session.user.id,
      preferences,
    });
  }

  return Response.json({ success: true });
}

export async function DELETE(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return new ChatbotError("unauthorized:chat").toResponse();
  }

  const { searchParams } = new URL(request.url);
  const scope = searchParams.get("scope");

  if (scope === "chats") {
    const result = await deleteAllChatsByUserId({ userId: session.user.id });
    return Response.json(result, { status: 200 });
  }

  if (scope === "account") {
    await deleteUserById({ userId: session.user.id });
    return Response.json({ success: true }, { status: 200 });
  }

  return Response.json({ error: "Invalid scope" }, { status: 400 });
}
