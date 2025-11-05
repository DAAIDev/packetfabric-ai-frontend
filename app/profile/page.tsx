'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface UserProfile {
  user_uuid: string;
  first_name: string;
  last_name: string;
  email: string;
  login: string;
  timezone: string;
  mfa_enabled: boolean;
  last_login: string;
  groups: string[];
}

interface Service {
  vc_circuit_id?: string;
  cloud_circuit_id?: string;
  port_circuit_id?: string;
  description: string;
  state: string;
  speed: string;
  service_type: string;
}

interface Location {
  pop: string;
  market: string;
  site: string;
  region: string;
  vendor: string;
}

interface Port {
  port_circuit_id: string;
  description: string;
  speed: string;
  media: string;
  status: string;
  pop: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch session to get tokens and user info
      const sessionRes = await fetch('/api/auth/session');
      if (!sessionRes.ok) {
        throw new Error('Not authenticated');
      }
      const session = await sessionRes.json();

      console.log('Session response:', session);

      if (!session.user) {
        console.error('No user in session:', session);
        router.push('/login');
        return;
      }

      const { token, user_uuid } = session.user;
      console.log('Extracted session data:', { user_uuid, has_token: !!token });

      // Fetch all data in parallel via Next.js API routes
      const [userRes, servicesRes, locationsRes, portsRes] = await Promise.all([
        fetch(`/api/pf/users/${user_uuid}`),
        fetch('/api/pf/services'),
        fetch('/api/pf/locations'),
        fetch('/api/pf/ports')
      ]);

      if (userRes.ok) {
        const userData = await userRes.json();
        setUserProfile(userData);
      }

      if (servicesRes.ok) {
        const servicesData = await servicesRes.json();
        setServices(servicesData);
      }

      if (locationsRes.ok) {
        const locationsData = await locationsRes.json();
        setLocations(locationsData);
      }

      if (portsRes.ok) {
        const portsData = await portsRes.json();
        setPorts(portsData);
      }

    } catch (err) {
      console.error('Error fetching profile data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus === 'active' || normalizedStatus === 'up') return 'bg-green-500';
    if (normalizedStatus === 'provisioning') return 'bg-yellow-500';
    if (normalizedStatus === 'down' || normalizedStatus === 'inactive') return 'bg-red-500';
    return 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-red-900/30 border border-red-500 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Profile</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={fetchProfileData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Chat
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                {userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : 'User Profile'}
              </h1>
              <p className="text-gray-400 text-lg">{userProfile?.email}</p>
            </div>

            <Link
              href="/provision"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg"
            >
              Provision New Service
            </Link>
          </div>
        </div>

        {/* User Details Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            User Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Name</p>
              <p className="text-white text-lg font-medium">
                {userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Email</p>
              <p className="text-white text-lg">{userProfile?.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Login</p>
              <p className="text-white text-lg">{userProfile?.login || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Timezone</p>
              <p className="text-white text-lg">{userProfile?.timezone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">MFA Status</p>
              <p className="text-white text-lg">
                {userProfile?.mfa_enabled ? (
                  <span className="text-green-400">Enabled</span>
                ) : (
                  <span className="text-yellow-400">Disabled</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Last Login</p>
              <p className="text-white text-lg">
                {userProfile?.last_login
                  ? new Date(userProfile.last_login).toLocaleString()
                  : 'N/A'}
              </p>
            </div>
            {userProfile?.groups && userProfile.groups.length > 0 && (
              <div className="md:col-span-2 lg:col-span-3">
                <p className="text-gray-400 text-sm mb-2">Groups</p>
                <div className="flex flex-wrap gap-2">
                  {userProfile.groups.map((group, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm"
                    >
                      {group}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Services Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
              Active Services
              <span className="ml-2 text-sm font-normal text-gray-400">({services.length})</span>
            </h2>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {services.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No active services</p>
              ) : (
                services.map((service, idx) => (
                  <div key={idx} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-white font-medium">
                          {service.vc_circuit_id || service.cloud_circuit_id || service.port_circuit_id}
                        </p>
                        <p className="text-gray-400 text-sm">{service.description || 'No description'}</p>
                        <p className="text-gray-500 text-xs mt-1">{service.service_type}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${getStatusColor(service.state)}`}></span>
                        <span className="text-sm text-gray-300 capitalize">{service.state}</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">
                      Speed: {service.speed}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Existing Ports Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Existing Ports
              <span className="ml-2 text-sm font-normal text-gray-400">({ports.length})</span>
            </h2>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {ports.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No ports configured</p>
              ) : (
                ports.map((port, idx) => (
                  <div key={idx} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-white font-medium font-mono text-sm">{port.port_circuit_id}</p>
                        <p className="text-gray-400 text-sm">{port.description || 'No description'}</p>
                        <p className="text-gray-500 text-xs mt-1">{port.pop}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${getStatusColor(port.status)}`}></span>
                        <span className="text-sm text-gray-300 capitalize">{port.status}</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-400 flex gap-4">
                      <span>Speed: {port.speed}</span>
                      <span>Media: {port.media}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Available Locations Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mt-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Available Locations
            <span className="ml-2 text-sm font-normal text-gray-400">({locations.length} POPs)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
            {locations.length === 0 ? (
              <p className="text-gray-400 text-center py-8 col-span-full">No locations available</p>
            ) : (
              locations.slice(0, 50).map((location, idx) => (
                <div key={idx} className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <p className="text-white font-medium">{location.pop}</p>
                  <p className="text-gray-400 text-sm">{location.market}</p>
                  <p className="text-gray-500 text-xs mt-1">{location.site}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-blue-400">{location.region}</span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-400">{location.vendor}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          {locations.length > 50 && (
            <p className="text-gray-400 text-sm mt-4 text-center">
              Showing 50 of {locations.length} locations
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mt-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/provision"
              className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg font-semibold transition-colors text-center shadow-lg"
            >
              <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Provision New Connection
            </Link>

            <button
              className="bg-gray-600 hover:bg-gray-700 text-white p-4 rounded-lg font-semibold transition-colors text-center shadow-lg cursor-not-allowed opacity-50"
              disabled
            >
              <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              View Billing (Coming Soon)
            </button>

            <Link
              href="/"
              className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg font-semibold transition-colors text-center shadow-lg"
            >
              <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Get Pricing
            </Link>
          </div>
        </div>

        {/* User UUID Footer */}
        {userProfile && (
          <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 mt-6 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">User UUID</p>
                <p className="text-white font-mono text-sm">{userProfile.user_uuid}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
