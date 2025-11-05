import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';

export async function GET() {
  try {
    const cookieStore = await cookies();

    const session = await getIronSession<SessionData>(
      cookieStore,
      sessionOptions
    );

    console.log('Session data:', {
      isLoggedIn: session.isLoggedIn,
      user_uuid: session.user_uuid,
      customer_uuid: session.customer_uuid,
      has_token: !!session.token
    });

    if (!session.isLoggedIn) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      isLoggedIn: true,
      user: {
        token: session.token,
        user_uuid: session.user_uuid,
        customer_uuid: session.customer_uuid
      }
    });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json(
      { error: 'Invalid session' },
      { status: 401 }
    );
  }
}
