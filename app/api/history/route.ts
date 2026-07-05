import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getHistory } from "@/lib/chat";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const persona = req.nextUrl.searchParams.get("persona");
  if (persona !== "hitesh" && persona !== "piyush") {
    return NextResponse.json({ error: "Invalid persona" }, { status: 400 });
  }

  const history = await getHistory(userId, persona);
  return NextResponse.json({ history });
}
