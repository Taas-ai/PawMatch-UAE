import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Stethoscope, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

function readinessBadge(status: string) {
  const s = status.toLowerCase();
  if (s === 'ready') return 'bg-green-100 text-green-700 border-green-200';
  if (s === 'not yet') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  if (s === 'consult vet') return 'bg-orange-100 text-orange-700 border-orange-200';
  return 'bg-red-100 text-red-700 border-red-200';
}

export function VetAdvisor() {
  const [selectedPetId, setSelectedPetId] = useState('');
  const [previousLitters, setPreviousLitters] = useState('');
  const [lastHeatDate, setLastHeatDate] = useState('');
  const [question, setQuestion] = useState('');

  const { data: myPets } = useQuery({
    queryKey: ['my-pets'],
    queryFn: () => api.pets.list({ owner: 'me' }),
  });

  const selectedPet = myPets?.find((p) => (p.id as string) === selectedPetId);

  const mutation = useMutation({
    mutationFn: () => {
      const data: Record<string, unknown> = {};
      if (previousLitters) data['previousLitters'] = Number(previousLitters);
      if (lastHeatDate) data['lastHeatDate'] = lastHeatDate;
      if (question) data['question'] = question;
      return api.tools.vetAdvisor(selectedPetId, data);
    },
  });

  const result = mutation.data;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Vet Advisor</h1>
      <p className="text-gray-500 mb-8">
        Get AI-powered breeding and health advice for your pet
      </p>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        {/* Pet Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Pet</label>
          <select
            value={selectedPetId}
            onChange={(e) => setSelectedPetId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 bg-white"
          >
            <option value="">Choose a pet...</option>
            {myPets?.map((pet) => (
              <option key={pet.id as string} value={pet.id as string}>
                {pet.name as string} ({pet.breed as string})
              </option>
            ))}
          </select>
        </div>

        {/* Pre-filled info */}
        {selectedPet && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <p className="text-gray-500">Species</p>
              <p className="font-medium text-gray-800 capitalize">{selectedPet.species as string}</p>
            </div>
            <div>
              <p className="text-gray-500">Breed</p>
              <p className="font-medium text-gray-800">{selectedPet.breed as string}</p>
            </div>
            <div>
              <p className="text-gray-500">Age</p>
              <p className="font-medium text-gray-800">
                {selectedPet.age != null ? `${selectedPet.age} yrs` : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Gender / Weight</p>
              <p className="font-medium text-gray-800 capitalize">
                {(selectedPet.gender as string) ?? 'N/A'}{' '}
                {selectedPet.weight != null ? `/ ${selectedPet.weight} kg` : ''}
              </p>
            </div>
          </div>
        )}

        {/* Additional Fields */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Previous Litters
            </label>
            <input
              type="number"
              min="0"
              value={previousLitters}
              onChange={(e) => setPreviousLitters(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Heat Date
            </label>
            <input
              type="date"
              value={lastHeatDate}
              onChange={(e) => setLastHeatDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Specific Question <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={3}
            placeholder="Any specific concern or question..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 resize-none"
          />
        </div>

        {mutation.isError && (
          <p className="text-red-500 text-sm mb-3">
            {mutation.error instanceof Error ? mutation.error.message : 'Failed to get advice'}
          </p>
        )}

        <button
          onClick={() => mutation.mutate()}
          disabled={!selectedPetId || mutation.isPending}
          className="w-full inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors"
        >
          <Stethoscope className="h-4 w-4" />
          {mutation.isPending ? 'Getting Advice...' : 'Get Advice'}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Breeding Readiness */}
          {result.breedingReadiness ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Breeding Readiness</h2>
                <span
                  className={`text-sm font-medium px-3 py-1 rounded-full border ${readinessBadge(result.breedingReadiness as string)}`}
                >
                  {String(result.breedingReadiness)}
                </span>
              </div>
            </div>
          ) : null}

          {/* Required Tests */}
          {Array.isArray(result.requiredTests) && (result.requiredTests as Record<string, unknown>[]).length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Required Tests</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 pr-4 font-medium text-gray-500">Test</th>
                      <th className="text-left py-2 pr-4 font-medium text-gray-500">Reason</th>
                      <th className="text-right py-2 font-medium text-gray-500">Est. Cost (AED)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(result.requiredTests as Record<string, unknown>[]).map((test, i) => (
                      <tr key={i} className="border-b border-gray-50">
                        <td className="py-2 pr-4 font-medium text-gray-900">{String(test.name)}</td>
                        <td className="py-2 pr-4 text-gray-600">{String(test.reason)}</td>
                        <td className="py-2 text-right text-gray-700">{Number(test.estimatedCostAED)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Breed-Specific Risks */}
          {Array.isArray(result.breedSpecificRisks) && (result.breedSpecificRisks as string[]).length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Breed-Specific Risks</h2>
              <div className="flex flex-wrap gap-2">
                {(result.breedSpecificRisks as string[]).map((risk, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 text-xs font-medium bg-red-50 text-red-700 px-3 py-1 rounded-full"
                  >
                    <AlertCircle className="h-3 w-3" /> {risk}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* UAE Climate Considerations */}
          {Array.isArray(result.uaeClimateConsiderations) && (result.uaeClimateConsiderations as string[]).length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">UAE Climate Considerations</h2>
              <ul className="space-y-2">
                {(result.uaeClimateConsiderations as string[]).map((item, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="mt-1 text-amber-500 shrink-0">&#9702;</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* General Advice */}
          {result.generalAdvice ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">General Advice</h2>
              <p className="text-sm text-gray-700">{String(result.generalAdvice)}</p>
            </div>
          ) : null}

          {/* Answer to specific question */}
          {result.specificAnswer ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Your Question</h2>
              <p className="text-sm text-gray-700">{String(result.specificAnswer)}</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
