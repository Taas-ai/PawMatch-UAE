CREATE TABLE `breeding_contracts` (
	`id` text PRIMARY KEY NOT NULL,
	`match_id` text NOT NULL,
	`owner_a_id` text NOT NULL,
	`owner_b_id` text NOT NULL,
	`stud_fee_aed` real,
	`terms` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`contract_text` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`match_id`) REFERENCES `matches`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`owner_a_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`owner_b_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `matches` (
	`id` text PRIMARY KEY NOT NULL,
	`pet_a_id` text NOT NULL,
	`pet_b_id` text NOT NULL,
	`requested_by` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`compatibility_score` real,
	`genetic_health_risk` text,
	`breed_compatibility` text,
	`temperament_match` text,
	`location_proximity` text,
	`recommendation` text,
	`warnings` text DEFAULT '[]' NOT NULL,
	`breeding_tips` text DEFAULT '[]' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`pet_a_id`) REFERENCES `pets`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`pet_b_id`) REFERENCES `pets`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`requested_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`match_id` text NOT NULL,
	`sender_id` text NOT NULL,
	`content` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`match_id`) REFERENCES `matches`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `pets` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`name` text NOT NULL,
	`species` text NOT NULL,
	`breed` text NOT NULL,
	`age` real NOT NULL,
	`gender` text NOT NULL,
	`weight` real NOT NULL,
	`location` text NOT NULL,
	`temperament` text,
	`pedigree` text,
	`health_records` text DEFAULT '[]' NOT NULL,
	`dna_test_results` text,
	`is_neutered` integer DEFAULT false NOT NULL,
	`photo_urls` text DEFAULT '[]' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text,
	`name` text NOT NULL,
	`auth_provider` text DEFAULT 'email' NOT NULL,
	`auth_provider_id` text,
	`phone` text,
	`emirate` text,
	`role` text DEFAULT 'owner' NOT NULL,
	`kyc_verified` integer DEFAULT false NOT NULL,
	`avatar_url` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `vet_consultations` (
	`id` text PRIMARY KEY NOT NULL,
	`pet_id` text NOT NULL,
	`requested_by` text NOT NULL,
	`breeding_readiness` text,
	`required_tests` text DEFAULT '[]' NOT NULL,
	`breed_specific_risks` text DEFAULT '[]' NOT NULL,
	`uae_climate_considerations` text DEFAULT '[]' NOT NULL,
	`general_advice` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`pet_id`) REFERENCES `pets`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`requested_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `pet_diagnostics` (
	`id` text PRIMARY KEY NOT NULL,
	`pet_id` text NOT NULL,
	`requested_by` text NOT NULL,
	`image_url` text,
	`symptoms` text,
	`assessment` text,
	`possible_conditions` text DEFAULT '[]' NOT NULL,
	`recommended_actions` text DEFAULT '[]' NOT NULL,
	`urgency_level` text,
	`disclaimer` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`pet_id`) REFERENCES `pets`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`requested_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `pet_documents` (
	`id` text PRIMARY KEY NOT NULL,
	`pet_id` text NOT NULL,
	`uploaded_by` text NOT NULL,
	`image_url` text,
	`document_type` text NOT NULL,
	`extracted_data` text DEFAULT '{}' NOT NULL,
	`raw_text` text,
	`processed_at` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`pet_id`) REFERENCES `pets`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
