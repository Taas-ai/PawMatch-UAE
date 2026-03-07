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
