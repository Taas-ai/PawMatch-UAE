import { useState } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle, Lightbulb } from 'lucide-react';

interface CompatibilityCardProps {
  result: Record<string, unknown>;
}

function scoreBadgeColor(score: number): string {
  if (score >= 70) return 'text-green-700 bg-green-50 border-green-200';
  if (score >= 40) return 'text-yellow-700 bg-yellow-50 border-yellow-200';
  return 'text-red-700 bg-red-50 border-red-200';
}

function scoreRingColor(score: number): string {
  if (score >= 70) return '#22c55e';
  if (score >= 40) return '#eab308';
  return '#ef4444';
}

function qualityColor(value: string): string {
  const v = value.toLowerCase();
  if (['excellent', 'good', 'low', 'ready'].includes(v))
    return 'bg-green-100 text-green-700';
  if (['fair', 'medium', 'moderate', 'not yet'].includes(v))
    return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
}

export function CompatibilityCard({ result }: CompatibilityCardProps) {
  const [showWarnings, setShowWarnings] = useState(false);
  const [showTips, setShowTips] = useState(false);

  const score = (result.overallScore as number) ?? (result.score as number) ?? 0;
  const geneticHealthRisk = result.geneticHealthRisk as string | undefined;
  const breedCompatibility = result.breedCompatibility as string | undefined;
  const temperamentMatch = result.temperamentMatch as string | undefined;
  const locationProximity = result.locationProximity as string | undefined;
  const recommendation = result.recommendation as string | undefined;
  const warnings = result.warnings as string[] | undefined;
  const breedingTips = result.breedingTips as string[] | undefined;

  const ringPercent = Math.min(Math.max(score, 0), 100);
  const ringStyle = {
    background: `conic-gradient(${scoreRingColor(score)} ${ringPercent * 3.6}deg, #e5e7eb ${ringPercent * 3.6}deg)`,
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {/* Score Ring */}
      <div className="flex flex-col items-center mb-6">
        <div
          className="w-32 h-32 rounded-full flex items-center justify-center relative"
          style={ringStyle}
        >
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
            <span className={`text-3xl font-bold ${score >= 70 ? 'text-green-600' : score >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
              {score}
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">Compatibility Score</p>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {geneticHealthRisk && (
          <span className={`text-xs font-medium px-3 py-1 rounded-full border ${scoreBadgeColor(geneticHealthRisk.toLowerCase() === 'low' ? 80 : geneticHealthRisk.toLowerCase() === 'medium' ? 50 : 20)}`}>
            Genetic Risk: {geneticHealthRisk}
          </span>
        )}
        {breedCompatibility && (
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${qualityColor(breedCompatibility)}`}>
            Breed: {breedCompatibility}
          </span>
        )}
        {temperamentMatch && (
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${qualityColor(temperamentMatch)}`}>
            Temperament: {temperamentMatch}
          </span>
        )}
      </div>

      {/* Location */}
      {locationProximity && (
        <p className="text-sm text-gray-500 text-center mb-4">{locationProximity}</p>
      )}

      {/* Recommendation */}
      {recommendation && (
        <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-4 mb-4">
          {recommendation}
        </p>
      )}

      {/* Warnings */}
      {warnings && warnings.length > 0 && (
        <div className="mb-3">
          <button
            onClick={() => setShowWarnings(!showWarnings)}
            className="flex items-center gap-2 text-sm font-medium text-amber-700 hover:text-amber-800 w-full"
          >
            <AlertTriangle className="h-4 w-4" />
            Warnings ({warnings.length})
            {showWarnings ? <ChevronUp className="h-4 w-4 ml-auto" /> : <ChevronDown className="h-4 w-4 ml-auto" />}
          </button>
          {showWarnings && (
            <ul className="mt-2 space-y-1 text-sm text-amber-700 bg-amber-50 rounded-lg p-3">
              {warnings.map((w, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0">&#8226;</span>
                  {w}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Breeding Tips */}
      {breedingTips && breedingTips.length > 0 && (
        <div>
          <button
            onClick={() => setShowTips(!showTips)}
            className="flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-800 w-full"
          >
            <Lightbulb className="h-4 w-4" />
            Breeding Tips ({breedingTips.length})
            {showTips ? <ChevronUp className="h-4 w-4 ml-auto" /> : <ChevronDown className="h-4 w-4 ml-auto" />}
          </button>
          {showTips && (
            <ul className="mt-2 space-y-1 text-sm text-blue-700 bg-blue-50 rounded-lg p-3">
              {breedingTips.map((t, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0">&#8226;</span>
                  {t}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
