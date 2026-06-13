// app/simulations/api/category/route.ts

import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import { getUserCategory, setUserCategory } from "@/lib/simulations/queries";

const categorySchema = z.object({
  category: z.string().min(1).max(100),
});

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

  const parsed = categorySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  await setUserCategory(session.user.id, parsed.data.category);
  return NextResponse.json({ success: true });
}
