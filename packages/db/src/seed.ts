import { createDb } from './index.js';
import { users, pets } from './schema.js';
import { sampleUsers, samplePets } from '../../../fixtures/sample-data.js';

const db = createDb();

console.log('Seeding database...');
db.insert(users).values(sampleUsers).run();
db.insert(pets).values(samplePets).run();
console.log('Seeded 2 users and 2 pets.');
