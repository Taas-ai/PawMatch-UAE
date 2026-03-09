export const sampleUsers = [
  {
    id: 'user-sarah-001',
    email: 'sarah@example.com',
    passwordHash: '$2a$10$placeholder',
    name: 'Sarah Thompson',
    phone: '+971501234567',
    emirate: 'Dubai',
    role: 'owner' as const,
    kycVerified: true,
  },
  {
    id: 'user-ahmed-002',
    email: 'ahmed@example.com',
    passwordHash: '$2a$10$placeholder',
    name: 'Ahmed Al Mansouri',
    phone: '+971551234567',
    emirate: 'Abu Dhabi',
    role: 'breeder' as const,
    kycVerified: true,
  },
];

export const samplePets = [
  {
    id: 'pet-golden-001',
    ownerId: 'user-sarah-001',
    name: 'Luna',
    species: 'dog' as const,
    breed: 'Golden Retriever',
    age: 3,
    gender: 'female' as const,
    weight: 28,
    location: 'Dubai',
    temperament: 'Friendly, gentle, great with children',
    isNeutered: false,
    healthRecords: JSON.stringify(['Vaccinated', 'Hip dysplasia clear']),
    photoUrls: JSON.stringify([]),
    status: 'active' as const,
  },
  {
    id: 'pet-saluki-002',
    ownerId: 'user-ahmed-002',
    name: 'Riyah',
    species: 'dog' as const,
    breed: 'Saluki',
    age: 4,
    gender: 'male' as const,
    weight: 25,
    location: 'Abu Dhabi',
    temperament: 'Independent, loyal, elegant',
    pedigree: 'Champion bloodline - 3 generations',
    isNeutered: false,
    healthRecords: JSON.stringify(['DNA tested', 'Heart clear', 'Eyes clear']),
    dnaTestResults: 'Pure Saluki - no genetic markers for breed-specific conditions',
    photoUrls: JSON.stringify([]),
    status: 'active' as const,
  },
];

export const mockGeminiMatchResponse = {
  compatibilityScore: 72,
  geneticHealthRisk: 'low' as const,
  breedCompatibility: 'fair' as const,
  temperamentMatch: 'good' as const,
  locationProximity: 'Dubai to Abu Dhabi - 130km, manageable',
  recommendation: 'These pets are different breeds so this would be a crossbreed. Both have excellent health records.',
  warnings: ['Different breeds - offspring will be mixed breed', 'Confirm both owners want crossbreed puppies'],
  breedingTips: ['Schedule vet pre-breeding check', 'Arrange neutral meeting location'],
};

export const mockGeminiBreedDetectResponse = {
  primaryBreed: 'Golden Retriever',
  confidence: 95,
  species: 'dog' as const,
  colorPattern: 'Golden/cream solid coat',
  sizeCategory: 'large' as const,
  breedCharacteristics: ['Friendly', 'Intelligent', 'Devoted'],
  uaePopularity: 'very popular' as const,
  heatToleranceRating: 'fair' as const,
  averagePrice: '4000-10000 AED',
};

export const mockGeminiDiagnosticResponse = {
  assessment: 'The image shows a localized area of redness and mild swelling on the left ear. This is consistent with an ear infection or allergic reaction.',
  possibleConditions: [
    { condition: 'Otitis externa (ear infection)', likelihood: 'high' as const, severity: 'moderate' as const, description: 'Common in dogs, especially in hot and humid climates like the UAE.' },
    { condition: 'Allergic dermatitis', likelihood: 'moderate' as const, severity: 'mild' as const, description: 'Could be triggered by environmental allergens or food.' },
  ],
  recommendedActions: [
    'Schedule a vet appointment within 2-3 days',
    'Keep the ear clean and dry',
    'Do not insert anything into the ear canal',
    'Monitor for worsening symptoms or discharge',
  ],
  urgencyLevel: 'soon' as const,
  shouldSeeVet: true,
  disclaimer: 'This is an AI-assisted preliminary assessment and NOT a veterinary diagnosis. Please consult a licensed UAE veterinarian for proper examination and treatment.',
};

export const mockGeminiDocumentOCRResponse = {
  documentType: 'lab_report' as const,
  clinicName: 'Modern Vet - Jumeirah',
  date: '2026-02-15',
  veterinarian: 'Dr. Sarah Ahmed',
  labResults: [
    { test: 'Complete Blood Count (CBC)', value: '12.5', unit: 'x10^9/L', referenceRange: '5.5-16.9', flag: 'normal' as const },
    { test: 'ALT (Liver)', value: '85', unit: 'U/L', referenceRange: '10-125', flag: 'normal' as const },
    { test: 'Creatinine (Kidney)', value: '1.8', unit: 'mg/dL', referenceRange: '0.5-1.8', flag: 'normal' as const },
  ],
  notes: 'All values within normal range. Pet is healthy for breeding.',
  rawText: 'Modern Vet Jumeirah\nLab Report\nDate: 2026-02-15\nPatient: Luna\nSpecies: Canine\n...',
};

export const mockGeminiVetAdvisorResponse = {
  breedingReadiness: 'ready' as const,
  requiredTests: [
    { test: 'Hip & Elbow Scoring', reason: 'Breed prone to hip dysplasia', estimatedCostAED: '800-1200' },
    { test: 'DNA Panel', reason: 'Screen for PRA, ICT, MD', estimatedCostAED: '1500-2500' },
  ],
  optimalBreedingWindow: 'October-March (cooler months)',
  breedSpecificRisks: ['Hip dysplasia', 'Elbow dysplasia', 'Progressive retinal atrophy'],
  uaeClimateConsiderations: ['Avoid summer breeding - heat stress risk', 'Indoor whelping area with AC required'],
  recommendedVetVisitBefore: true,
  generalAdvice: 'Luna is at a good age for first breeding. Complete all health screening before proceeding.',
};
