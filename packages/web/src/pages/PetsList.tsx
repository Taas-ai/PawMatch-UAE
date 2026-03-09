import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';
import { api } from '@/lib/api';
import { PetCard } from '@/components/PetCard';

const EMIRATES = [
  'Abu Dhabi',
  'Dubai',
  'Sharjah',
  'Ajman',
  'Umm Al Quwain',
  'Ras Al Khaimah',
  'Fujairah',
];

export function PetsList() {
  const [species, setSpecies] = useState('');
  const [breed, setBreed] = useState('');
  const [emirate, setEmirate] = useState('');
  const [gender, setGender] = useState('');

  const filters: Record<string, string> = {};
  if (species) filters['species'] = species;
  if (breed) filters['breed'] = breed;
  if (emirate) filters['location'] = emirate;
  if (gender) filters['gender'] = gender;

  const { data: pets, isLoading } = useQuery({
    queryKey: ['pets', filters],
    queryFn: () => api.pets.list(Object.keys(filters).length > 0 ? filters : undefined),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Browse Pets</h1>
          <p className="mt-1 text-gray-500">Find the perfect match for your pet</p>
        </div>
        <Link
          to="/pets/new"
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Pet
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Species */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Species</label>
            <div className="flex gap-1">
              {['', 'dog', 'cat'].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpecies(s)}
                  className={`flex-1 text-sm py-2 rounded-lg font-medium transition-colors ${
                    species === s
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {s === '' ? 'All' : s === 'dog' ? 'Dogs' : 'Cats'}
                </button>
              ))}
            </div>
          </div>

          {/* Breed */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search breed..."
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Emirate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Emirate</label>
            <select
              value={emirate}
              onChange={(e) => setEmirate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 bg-white"
            >
              <option value="">All Emirates</option>
              {EMIRATES.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 bg-white"
            >
              <option value="">Any</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="text-center py-20 text-gray-500">Loading pets...</div>
      ) : !pets || pets.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 mb-4">No pets found matching your filters.</p>
          <Link
            to="/pets/new"
            className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium"
          >
            <Plus className="h-4 w-4" /> Add the first pet
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map((pet) => (
            <PetCard key={pet.id as string} pet={pet} />
          ))}
        </div>
      )}
    </div>
  );
}
