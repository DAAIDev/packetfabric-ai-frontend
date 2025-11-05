import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ customer_uuid: string }> }
) {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session.isLoggedIn || !session.token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { customer_uuid } = await params;

    const response = await fetch(`https://api.packetfabric.com/v2/customers/${customer_uuid}`, {
      headers: {
        'Authorization': session.token,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
