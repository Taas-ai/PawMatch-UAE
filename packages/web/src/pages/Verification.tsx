import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload, CheckCircle, Shield } from 'lucide-react';

type Step = 1 | 2 | 3;

export function Verification() {
  const [step, setStep] = useState<Step>(1);
  const [emiratesIdName, setEmiratesIdName] = useState('');
  const [selfieName, setSelfieName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (name: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) setter(file.name);
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Verification Submitted!
        </h2>
        <p className="text-gray-500 mb-6">
          We&apos;ll review within 24 hours. You&apos;ll receive a notification
          once your identity is verified.
        </p>
        <Link
          to="/profile"
          className="inline-block px-6 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
        >
          Back to Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          to="/profile"
          className="p-1 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">KYC Verification</h1>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                s <= step
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {s}
            </div>
            {s < 3 && (
              <div
                className={`flex-1 h-1 rounded ${
                  s < step ? 'bg-amber-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Emirates ID */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-6 w-6 text-amber-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              Upload Emirates ID
            </h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Please upload a clear photo of the front of your Emirates ID.
          </p>
          <label className="flex flex-col items-center gap-3 p-8 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-amber-300 transition-colors">
            <Upload className="h-8 w-8 text-gray-400" />
            <span className="text-sm text-gray-500">
              {emiratesIdName || 'Click to upload Emirates ID'}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChange(e, setEmiratesIdName)}
            />
          </label>
          <button
            onClick={() => setStep(2)}
            disabled={!emiratesIdName}
            className="w-full py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Step 2: Selfie */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-6 w-6 text-amber-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              Upload Selfie
            </h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Take a clear selfie for facial verification.
          </p>
          <label className="flex flex-col items-center gap-3 p-8 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-amber-300 transition-colors">
            <Upload className="h-8 w-8 text-gray-400" />
            <span className="text-sm text-gray-500">
              {selfieName || 'Click to upload selfie'}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChange(e, setSelfieName)}
            />
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-2 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!selfieName}
              className="flex-1 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Review & Submit
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Emirates ID</span>
              <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                {emiratesIdName}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Selfie</span>
              <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                {selfieName}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-2 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
            >
              Submit for Verification
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
