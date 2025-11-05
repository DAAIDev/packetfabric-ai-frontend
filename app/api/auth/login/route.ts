import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  console.log("=== LOGIN ENDPOINT CALLED ===");
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Call PacketFabric API
    console.log("Calling PacketFabric API with:", { email });
    const response = await fetch("https://api.packetfabric.com/v2/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        login: email,
        password: password,
      }),
    });

    console.log("Got response from PacketFabric, status:", response.status);
    const data = await response.json();
    console.log("Parsed response data:", JSON.stringify(data, null, 2));
    console.log("Data keys:", Object.keys(data));
    console.log("Has token?", !!data.token);

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: data.message || data.error || "Login failed"
        },
        { status: response.status }
      );
    }

    // Fetch user list to get user_uuid
    console.log("Fetching user list from /v2/users");
    const usersResponse = await fetch('https://api.packetfabric.com/v2/users', {
      headers: { 'Authorization': `Bearer ${data.token}` }
    });
    const users = await usersResponse.json();
    console.log('Users list:', JSON.stringify(users, null, 2));

    const currentUser = users.find((u: any) => u.email === email);
    console.log('Current user:', JSON.stringify(currentUser, null, 2));

    if (!currentUser || !currentUser.uuid) {
      return NextResponse.json(
        {
          success: false,
          error: "Could not retrieve user information"
        },
        { status: 500 }
      );
    }

    // Store in session
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
    session.isLoggedIn = true;
    session.token = data.token;
    session.user_uuid = currentUser.uuid;
    console.log("About to save session with:", {
      token: data.token,
      user_uuid: currentUser.uuid
    });
    await session.save();
    console.log("Session saved successfully");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "An error occurred during login" },
      { status: 500 }
    );
  }
}
