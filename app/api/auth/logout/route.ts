import { getSession } from '@/lib/session';

export async function POST(request: Request) {
  const session = await getSession();
  session.destroy();
  return Response.json({ success: true });
}
