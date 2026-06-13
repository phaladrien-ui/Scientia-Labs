// app/simulations/api/category/route.ts

import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { getUserCategory, setUserCategory } from "@/lib/simulations/queries";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const category = await getUserCategory(session.user.id);
  return NextResponse.json({ category: category?.category ?? null });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let category: string;
  try {
    const body = await request.json();
    category = body.category;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  if (!category || typeof category !== "string") {
    return NextResponse.json(
      { error: "Parameter 'category' is required" },
      { status: 400 }
    );
  }

  await setUserCategory(session.user.id, category);
  return NextResponse.json({ success: true });
}
