import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MessageCircle } from 'lucide-react';
import { api } from '@/lib/api';

export function Messages() {
  const { data: matches, isLoading } = useQuery({
    queryKey: ['matches'],
    queryFn: () => api.matches.list(),
  });

  const conversations = (matches || []).filter(
    (m: Record<string, unknown>) => m.status === 'accepted'
  );

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>

      {conversations.length === 0 ? (
        <div className="text-center py-16">
          <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            No conversations yet. Accept a match to start chatting!
          </p>
          <Link
            to="/matches"
            className="inline-block mt-4 text-amber-600 hover:text-amber-700 font-medium"
          >
            View Matches
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((match: Record<string, unknown>) => {
            const petA = match.petA as Record<string, unknown> | undefined;
            const petB = match.petB as Record<string, unknown> | undefined;
            const petAName = petA?.name || 'Pet A';
            const petBName = petB?.name || 'Pet B';

            return (
              <Link
                key={match.id as string}
                to={`/messages/${match.id}`}
                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-amber-200 hover:shadow-sm transition-all"
              >
                <div className="flex-shrink-0 h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {petAName as string} & {petBName as string}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    Tap to start chatting
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
