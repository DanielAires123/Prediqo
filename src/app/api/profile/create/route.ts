import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const username =
    typeof body.username === "string"
      ? body.username.trim().slice(0, 30).replace(/[^a-zA-Z0-9_]/g, "") || "user"
      : "user";

  const existing = await prisma.profile.findUnique({
    where: { id: user.id },
  });
  if (existing) return NextResponse.json({ profile: existing });

  const count = await prisma.profile.count({ where: { username } });
  const finalUsername = count > 0 ? `${username}${count}` : username;

  const profile = await prisma.profile.create({
    data: {
      id: user.id,
      username: finalUsername,
      skillRating: 1200,
    },
  });

  return NextResponse.json({ profile });
}
