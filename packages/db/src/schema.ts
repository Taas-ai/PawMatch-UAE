import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  name: text('name').notNull(),
  authProvider: text('auth_provider', { enum: ['email', 'google', 'apple'] }).notNull().default('email'),
  authProviderId: text('auth_provider_id'),
  phone: text('phone'),
  emirate: text('emirate'),
  role: text('role', { enum: ['owner', 'breeder', 'vet', 'admin'] }).notNull().default('owner'),
  kycVerified: integer('kyc_verified', { mode: 'boolean' }).notNull().default(false),
  avatarUrl: text('avatar_url'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

export const pets = sqliteTable('pets', {
  id: text('id').primaryKey(),
  ownerId: text('owner_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  species: text('species', { enum: ['dog', 'cat'] }).notNull(),
  breed: text('breed').notNull(),
  age: real('age').notNull(),
  gender: text('gender', { enum: ['male', 'female'] }).notNull(),
  weight: real('weight').notNull(),
  location: text('location').notNull(),
  temperament: text('temperament'),
  pedigree: text('pedigree'),
  healthRecords: text('health_records').notNull().default('[]'),
  dnaTestResults: text('dna_test_results'),
  isNeutered: integer('is_neutered', { mode: 'boolean' }).notNull().default(false),
  photoUrls: text('photo_urls').notNull().default('[]'),
  status: text('status', { enum: ['active', 'inactive', 'suspended'] }).notNull().default('active'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

export const matches = sqliteTable('matches', {
  id: text('id').primaryKey(),
  petAId: text('pet_a_id').notNull().references(() => pets.id),
  petBId: text('pet_b_id').notNull().references(() => pets.id),
  requestedBy: text('requested_by').notNull().references(() => users.id),
  status: text('status', { enum: ['pending', 'accepted', 'rejected', 'completed'] }).notNull().default('pending'),
  compatibilityScore: real('compatibility_score'),
  geneticHealthRisk: text('genetic_health_risk'),
  breedCompatibility: text('breed_compatibility'),
  temperamentMatch: text('temperament_match'),
  locationProximity: text('location_proximity'),
  recommendation: text('recommendation'),
  warnings: text('warnings').notNull().default('[]'),
  breedingTips: text('breeding_tips').notNull().default('[]'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

export const messages = sqliteTable('messages', {
  id: text('id').primaryKey(),
  matchId: text('match_id').notNull().references(() => matches.id),
  senderId: text('sender_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});

export const breedingContracts = sqliteTable('breeding_contracts', {
  id: text('id').primaryKey(),
  matchId: text('match_id').notNull().references(() => matches.id),
  ownerAId: text('owner_a_id').notNull().references(() => users.id),
  ownerBId: text('owner_b_id').notNull().references(() => users.id),
  studFeeAED: real('stud_fee_aed'),
  terms: text('terms'),
  status: text('status', { enum: ['draft', 'active', 'completed', 'disputed'] }).notNull().default('draft'),
  contractText: text('contract_text'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

export const vetConsultations = sqliteTable('vet_consultations', {
  id: text('id').primaryKey(),
  petId: text('pet_id').notNull().references(() => pets.id),
  requestedBy: text('requested_by').notNull().references(() => users.id),
  breedingReadiness: text('breeding_readiness'),
  requiredTests: text('required_tests').notNull().default('[]'),
  breedSpecificRisks: text('breed_specific_risks').notNull().default('[]'),
  uaeClimateConsiderations: text('uae_climate_considerations').notNull().default('[]'),
  generalAdvice: text('general_advice'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});

export const petDiagnostics = sqliteTable('pet_diagnostics', {
  id: text('id').primaryKey(),
  petId: text('pet_id').notNull().references(() => pets.id),
  requestedBy: text('requested_by').notNull().references(() => users.id),
  imageUrl: text('image_url'),
  symptoms: text('symptoms'),
  assessment: text('assessment'),
  possibleConditions: text('possible_conditions').notNull().default('[]'),
  recommendedActions: text('recommended_actions').notNull().default('[]'),
  urgencyLevel: text('urgency_level', { enum: ['routine', 'soon', 'urgent', 'emergency'] }),
  disclaimer: text('disclaimer'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});

export const petDocuments = sqliteTable('pet_documents', {
  id: text('id').primaryKey(),
  petId: text('pet_id').notNull().references(() => pets.id),
  uploadedBy: text('uploaded_by').notNull().references(() => users.id),
  imageUrl: text('image_url'),
  documentType: text('document_type', { enum: ['lab_report', 'prescription', 'vaccination'] }).notNull(),
  extractedData: text('extracted_data').notNull().default('{}'),
  rawText: text('raw_text'),
  processedAt: text('processed_at'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});
