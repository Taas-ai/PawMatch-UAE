import { Router } from 'express';

const UAE_POPULAR_BREEDS = {
  dogs: [
    { breed: 'Saluki', popularity: 'very popular', avgPriceAED: '5,000 - 15,000', origin: 'Middle East', heatTolerance: 'excellent' },
    { breed: 'German Shepherd', popularity: 'very popular', avgPriceAED: '3,000 - 8,000', origin: 'Germany', heatTolerance: 'fair' },
    { breed: 'Golden Retriever', popularity: 'very popular', avgPriceAED: '3,500 - 7,000', origin: 'UK', heatTolerance: 'fair' },
    { breed: 'Labrador Retriever', popularity: 'popular', avgPriceAED: '3,000 - 6,000', origin: 'Canada', heatTolerance: 'fair' },
    { breed: 'French Bulldog', popularity: 'very popular', avgPriceAED: '8,000 - 25,000', origin: 'France', heatTolerance: 'poor' },
    { breed: 'Pomeranian', popularity: 'popular', avgPriceAED: '2,500 - 6,000', origin: 'Germany', heatTolerance: 'fair' },
    { breed: 'Husky', popularity: 'popular', avgPriceAED: '4,000 - 10,000', origin: 'Russia', heatTolerance: 'poor' },
    { breed: 'Rottweiler', popularity: 'moderate', avgPriceAED: '4,000 - 12,000', origin: 'Germany', heatTolerance: 'fair' },
    { breed: 'Shih Tzu', popularity: 'popular', avgPriceAED: '2,000 - 5,000', origin: 'China', heatTolerance: 'poor' },
    { breed: 'Maltese', popularity: 'popular', avgPriceAED: '3,000 - 8,000', origin: 'Malta', heatTolerance: 'fair' },
  ],
  cats: [
    { breed: 'Persian', popularity: 'very popular', avgPriceAED: '1,500 - 5,000', origin: 'Iran', heatTolerance: 'fair' },
    { breed: 'British Shorthair', popularity: 'very popular', avgPriceAED: '3,000 - 8,000', origin: 'UK', heatTolerance: 'good' },
    { breed: 'Ragdoll', popularity: 'popular', avgPriceAED: '4,000 - 10,000', origin: 'USA', heatTolerance: 'fair' },
    { breed: 'Maine Coon', popularity: 'popular', avgPriceAED: '5,000 - 15,000', origin: 'USA', heatTolerance: 'fair' },
    { breed: 'Scottish Fold', popularity: 'popular', avgPriceAED: '3,000 - 9,000', origin: 'UK', heatTolerance: 'good' },
    { breed: 'Siamese', popularity: 'moderate', avgPriceAED: '2,000 - 6,000', origin: 'Thailand', heatTolerance: 'excellent' },
    { breed: 'Bengal', popularity: 'moderate', avgPriceAED: '5,000 - 12,000', origin: 'USA', heatTolerance: 'good' },
    { breed: 'Sphynx', popularity: 'moderate', avgPriceAED: '6,000 - 15,000', origin: 'Canada', heatTolerance: 'good' },
  ],
};

const UAE_VET_DIRECTORY = [
  { name: 'Modern Vet', location: 'Dubai - Jumeirah', phone: '+971-4-395-3131', specialties: ['breeding', 'genetics', 'surgery'], emergencyService: true },
  { name: 'American Veterinary Clinic', location: 'Dubai - Al Wasl', phone: '+971-4-340-8601', specialties: ['breeding', 'dermatology', 'dentistry'], emergencyService: true },
  { name: 'British Veterinary Hospital', location: 'Abu Dhabi - Khalifa City', phone: '+971-2-665-0085', specialties: ['breeding', 'orthopedics', 'cardiology'], emergencyService: true },
  { name: 'German Veterinary Clinic', location: 'Dubai - Al Barsha', phone: '+971-4-340-8601', specialties: ['breeding', 'genetics', 'internal medicine'], emergencyService: false },
  { name: 'Canadian Veterinary Clinic', location: 'Abu Dhabi - Corniche', phone: '+971-2-681-1330', specialties: ['breeding', 'exotic pets', 'nutrition'], emergencyService: true },
  { name: 'Sharjah Cat & Dog Hospital', location: 'Sharjah - Al Nahda', phone: '+971-6-530-9090', specialties: ['general practice', 'breeding', 'vaccination'], emergencyService: false },
];

export function resourcesRouter(): Router {
  const router = Router();

  // GET /breeds — UAE popular breeds (public)
  router.get('/breeds', (_req, res) => {
    res.json(UAE_POPULAR_BREEDS);
  });

  // GET /vets — UAE vet directory (public)
  router.get('/vets', (_req, res) => {
    res.json(UAE_VET_DIRECTORY);
  });

  return router;
}
