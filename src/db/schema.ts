import { pgTable, text, integer, bigint, uuid } from 'drizzle-orm/pg-core';

export const uploadedFiles = pgTable('uploaded_files', {
	id: uuid().defaultRandom().primaryKey(),
	originalName: text().notNull(),
	mimeType: text().notNull(),
	size: bigint({ mode: 'number' }).notNull(),
	fileKey: text().notNull(),
	uploadedAt: integer().notNull(),
	slug: text().unique(),
	isEncrypted: integer(),
	encryptionSalt: text(),
	encryptionIv: text(),
});

export type UploadedFile = typeof uploadedFiles.$inferSelect;
export type NewUploadedFile = typeof uploadedFiles.$inferInsert;
