DROP INDEX "idx_account_user_id";--> statement-breakpoint
ALTER TABLE "jwks" ADD COLUMN "expires_at" timestamp;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");