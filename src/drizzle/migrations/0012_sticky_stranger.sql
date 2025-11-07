ALTER TABLE "upload" ADD COLUMN "summary" text;--> statement-breakpoint
ALTER TABLE "upload" ADD COLUMN "processed" timestamp;--> statement-breakpoint
ALTER TABLE "upload" ADD COLUMN "error" text;