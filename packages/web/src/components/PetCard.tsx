import { Link } from 'react-router-dom';
import { PawPrint, MapPin, Heart, Scale } from 'lucide-react';

interface PetCardProps {
  pet: Record<string, unknown>;
  onMatch?: () => void;
}

export function PetCard({ pet, onMatch }: PetCardProps) {
  const species = (pet.species as string) ?? 'dog';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* Photo placeholder */}
      <div className="h-48 bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center relative">
        <PawPrint className="h-16 w-16 text-amber-400/60" />
        <span
          className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${
            species === 'cat'
              ? 'bg-purple-100 text-purple-700'
              : 'bg-amber-100 text-amber-700'
          }`}
        >
          {species === 'cat' ? 'Cat' : 'Dog'}
        </span>
        {onMatch && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onMatch();
            }}
            className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition-colors"
          >
            <Heart className="h-4 w-4 text-rose-500" />
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900">{String(pet.name ?? '')}</h3>
        <p className="text-sm text-gray-500 mb-3">{String(pet.breed ?? '')}</p>

        <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-4">
          {pet.location ? (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {String(pet.location)}
            </span>
          ) : null}
          {pet.gender ? (
            <span className="flex items-center gap-1">
              {(pet.gender as string) === 'male' ? 'Male' : 'Female'}
            </span>
          ) : null}
          {pet.age != null && (
            <span>{Number(pet.age)} yr{Number(pet.age) !== 1 ? 's' : ''}</span>
          )}
          {pet.weight != null && (
            <span className="flex items-center gap-1">
              <Scale className="h-3.5 w-3.5" />
              {Number(pet.weight)} kg
            </span>
          )}
        </div>

        <Link
          to={`/pets/${pet.id as string}`}
          className="block w-full text-center text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg py-2 transition-colors"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}
