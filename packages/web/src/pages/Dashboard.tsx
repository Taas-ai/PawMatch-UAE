import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PawPrint, Heart, MessageCircle, Plus, Search, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';

export function Dashboard() {
  const { user } = useAuth();

  const { data: pets } = useQuery({
    queryKey: ['my-pets'],
    queryFn: () => api.pets.list({ owner: 'me' }),
  });

  const { data: matches } = useQuery({
    queryKey: ['my-matches'],
    queryFn: () => api.matches.list(),
  });

  const petCount = pets?.length ?? 0;
  const matchCount = matches?.length ?? 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="mt-1 text-gray-600">
          Here&apos;s what&apos;s happening with your pets today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <StatCard
          icon={<PawPrint className="h-6 w-6" />}
          label="My Pets"
          value={petCount}
          color="amber"
          to="/pets"
        />
        <StatCard
          icon={<Heart className="h-6 w-6" />}
          label="Active Matches"
          value={matchCount}
          color="rose"
          to="/matches"
        />
        <StatCard
          icon={<MessageCircle className="h-6 w-6" />}
          label="Messages"
          value={0}
          color="blue"
          to="/messages"
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ActionCard
            icon={<Plus className="h-6 w-6" />}
            title="Add a Pet"
            description="Register a new pet to your profile"
            to="/pets/new"
            color="amber"
          />
          <ActionCard
            icon={<Search className="h-6 w-6" />}
            title="Browse Pets"
            description="Discover potential matches"
            to="/pets"
            color="blue"
          />
          <ActionCard
            icon={<Sparkles className="h-6 w-6" />}
            title="AI Tools"
            description="Breed detection, vet advice, and more"
            to="/tools/breed-detect"
            color="purple"
          />
        </div>
      </div>

      {/* Recent Pets */}
      {pets && pets.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Your Pets</h2>
            <Link to="/pets" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pets.slice(0, 3).map((pet) => (
              <div
                key={pet.id as string}
                className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <PawPrint className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{pet.name as string}</h3>
                    <p className="text-sm text-gray-500">{pet.breed as string}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const colorMap = {
  amber: { bg: 'bg-amber-50', icon: 'text-amber-600', border: 'border-amber-100' },
  rose: { bg: 'bg-rose-50', icon: 'text-rose-600', border: 'border-rose-100' },
  blue: { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-100' },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600', border: 'border-purple-100' },
} as const;

function StatCard({
  icon,
  label,
  value,
  color,
  to,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: keyof typeof colorMap;
  to: string;
}) {
  const colors = colorMap[color];
  return (
    <Link
      to={to}
      className={`bg-white rounded-xl border ${colors.border} p-6 hover:shadow-md transition-all hover:-translate-y-0.5`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center ${colors.icon}`}>
          {icon}
        </div>
      </div>
    </Link>
  );
}

function ActionCard({
  icon,
  title,
  description,
  to,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  to: string;
  color: keyof typeof colorMap;
}) {
  const colors = colorMap[color];
  return (
    <Link
      to={to}
      className="group bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-all hover:-translate-y-0.5"
    >
      <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center ${colors.icon} mb-3 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </Link>
  );
}
