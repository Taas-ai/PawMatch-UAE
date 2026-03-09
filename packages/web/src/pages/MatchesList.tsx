import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Heart, Plus } from 'lucide-react';
import { api } from '@/lib/api';

const TABS = ['all', 'pending', 'accepted', 'completed', 'rejected'] as const;
type Tab = (typeof TABS)[number];

function statusBadge(status: string) {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-700';
    case 'accepted':
      return 'bg-green-100 text-green-700';
    case 'completed':
      return 'bg-blue-100 text-blue-700';
    case 'rejected':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

export function MatchesList() {
  const [tab, setTab] = useState<Tab>('all');

  const { data: matches, isLoading } = useQuery({
    queryKey: ['matches'],
    queryFn: () => api.matches.list(),
  });

  const filtered =
    tab === 'all'
      ? matches
      : matches?.filter((m) => (m.status as string) === tab);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Matches</h1>
          <p className="mt-1 text-gray-500">View and manage your pet matches</p>
        </div>
        <Link
          to="/matches/new"
          className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Match
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 min-w-[80px] text-sm font-medium py-2 rounded-md capitalize transition-colors ${
              tab === t
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="text-center py-20 text-gray-500">Loading matches...</div>
      ) : !filtered || filtered.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">No {tab === 'all' ? '' : tab} matches yet.</p>
          <Link
            to="/matches/new"
            className="inline-flex items-center gap-2 text-rose-600 hover:text-rose-700 font-medium"
          >
            <Plus className="h-4 w-4" /> Create a match
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((match) => {
            const petA = match.petA as Record<string, unknown> | undefined;
            const petB = match.petB as Record<string, unknown> | undefined;
            const petAName = (petA?.name as string) ?? (match.petAId as string) ?? 'Pet A';
            const petBName = (petB?.name as string) ?? (match.petBId as string) ?? 'Pet B';
            const score = match.overallScore as number | undefined;
            const status = (match.status as string) ?? 'pending';
            const createdAt = match.createdAt as string | undefined;

            return (
              <Link
                key={match.id as string}
                to={`/matches/${match.id as string}`}
                className="block bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center">
                      <Heart className="h-5 w-5 text-rose-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {petAName} &amp; {petBName}
                      </p>
                      {createdAt && (
                        <p className="text-xs text-gray-400">
                          {new Date(createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {score != null && (
                      <span className="text-sm font-bold text-gray-700">{score}%</span>
                    )}
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusBadge(status)}`}
                    >
                      {status}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
