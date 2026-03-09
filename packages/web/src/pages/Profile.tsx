import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Shield } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const EMIRATES = [
  'Abu Dhabi',
  'Dubai',
  'Sharjah',
  'Ajman',
  'Umm Al Quwain',
  'Ras Al Khaimah',
  'Fujairah',
];

export function Profile() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [emirate, setEmirate] = useState(user?.emirate || '');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>

      {/* Avatar placeholder */}
      <div className="flex items-center gap-4 mb-8">
        <div className="h-20 w-20 rounded-full bg-amber-100 flex items-center justify-center">
          <User className="h-10 w-10 text-amber-600" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">{user?.name}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Emirate
          </label>
          <select
            value={emirate}
            onChange={(e) => setEmirate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
          >
            <option value="">Select emirate</option>
            {EMIRATES.map((em) => (
              <option key={em} value={em}>
                {em}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
        >
          Save Changes
        </button>

        {saved && (
          <p className="text-center text-sm text-amber-600">
            Coming soon — profile update API is not yet available.
          </p>
        )}
      </form>

      {/* Verification link */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <Link
          to="/profile/verification"
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-amber-200 hover:shadow-sm transition-all"
        >
          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Shield className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">KYC Verification</p>
            <p className="text-sm text-gray-500">
              Verify your identity to unlock all features
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
