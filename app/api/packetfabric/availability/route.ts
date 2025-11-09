import { NextRequest, NextResponse } from 'next/server';

const PACKETFABRIC_API_KEY = process.env.PACKETFABRIC_API_KEY || 'api-2391930d-3ace-4dbc-ad25-c7ba81dcb36b-7f2d5892-e5ce-460e-aa7e-96a5752cabd1';
const PACKETFABRIC_BASE_URL = 'https://api.packetfabric.com/v2';

interface PortAvailability {
  zone: string;
  speed: string;
  media: string;
  count: number;
  partial: boolean;
  enni: boolean;
}

interface AvailabilityResponse {
  from: {
    pop: string;
    availability: PortAvailability[];
    zones: string[];
  };
  to: {
    pop: string;
    availability: PortAvailability[];
    zones: string[];
  };
}

export async function POST(request: NextRequest) {
  try {
    const { from_pop, to_pop } = await request.json();

    if (!from_pop || !to_pop) {
      return NextResponse.json(
        { error: 'from_pop and to_pop are required' },
        { status: 400 }
      );
    }

    const headers = {
      'Authorization': `Bearer ${PACKETFABRIC_API_KEY}`,
      'Content-Type': 'application/json',
    };

    // Fetch availability and zones for both POPs in parallel
    const [fromAvailability, fromZones, toAvailability, toZones] = await Promise.all([
      fetch(`${PACKETFABRIC_BASE_URL}/locations/${from_pop}/port-availability`, { headers }),
      fetch(`${PACKETFABRIC_BASE_URL}/locations/${from_pop}/zones`, { headers }),
      fetch(`${PACKETFABRIC_BASE_URL}/locations/${to_pop}/port-availability`, { headers }),
      fetch(`${PACKETFABRIC_BASE_URL}/locations/${to_pop}/zones`, { headers }),
    ]);

    // Check for errors
    if (!fromAvailability.ok || !fromZones.ok || !toAvailability.ok || !toZones.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch availability data from PacketFabric' },
        { status: 500 }
      );
    }

    const response: AvailabilityResponse = {
      from: {
        pop: from_pop,
        availability: await fromAvailability.json(),
        zones: await fromZones.json(),
      },
      to: {
        pop: to_pop,
        availability: await toAvailability.json(),
        zones: await toZones.json(),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Availability check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}