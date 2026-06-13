import {
  deleteAllChatsByUserId,
  deleteUserById,
  getUser,
  getUserSettings,
  getUserStats,
  updateUserProfile,
  upsertUserSettings,
} from "@/lib/db/queries";
import { authenticateRequest } from "@/lib/auth/api-helpers";

export async function GET() {
  const authResult = await authenticateRequest("chat");
  if (authResult.error) return authResult.error;

  const { user } = authResult.session;

  const [stats, settings, userRecord] = await Promise.all([
    getUserStats({ userId: user.id }),
    getUserSettings({ userId: user.id }),
    getUser(user.email ?? ""),
  ]);

  const currentUser = userRecord[0];

  return Response.json({
    user: {
      id: user.id,
      name: currentUser?.name ?? user.name ?? null,
      email: user.email ?? null,
      image: currentUser?.image ?? user.image ?? null,
      bio: currentUser?.bio ?? null,
      type: user.type,
      createdAt: currentUser?.createdAt?.toISOString() ?? null,
    },
    stats,
    preferences: settings?.preferences ?? {},
  });
}

export async function PATCH(request: Request) {
  const authResult = await authenticateRequest("chat");
  if (authResult.error) return authResult.error;

  const { user } = authResult.session;

  const body = await request.json();
  const { name, bio, image, preferences } = body;

  if (name !== undefined || bio !== undefined || image !== undefined) {
    await updateUserProfile({
      userId: user.id,
      name,
      bio,
      image,
    });
  }

  if (preferences !== undefined) {
    await upsertUserSettings({
      userId: user.id,
      preferences,
    });
  }

  return Response.json({ success: true });
}

export async function DELETE(request: Request) {
  const authResult = await authenticateRequest("chat");
  if (authResult.error) return authResult.error;

  const { user } = authResult.session;

  const { searchParams } = new URL(request.url);
  const scope = searchParams.get("scope");

  if (scope === "chats") {
    const result = await deleteAllChatsByUserId({ userId: user.id });
    return Response.json(result, { status: 200 });
  }

  if (scope === "account") {
    await deleteUserById({ userId: user.id });
    return Response.json({ success: true }, { status: 200 });
  }

  return Response.json({ error: "Invalid scope" }, { status: 400 });
}
