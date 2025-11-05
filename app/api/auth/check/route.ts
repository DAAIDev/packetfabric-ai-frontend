import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(cookies(), sessionOptions);

    return NextResponse.json({
      isLoggedIn: session.isLoggedIn || false,
      user_uuid: session.user_uuid || null,
    });
  } catch (error) {
    return NextResponse.json(
      { isLoggedIn: false },
      { status: 200 }
    );
  }
}
