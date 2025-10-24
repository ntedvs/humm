CREATE TABLE "upload" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"userId" text
);
--> statement-breakpoint
ALTER TABLE "upload" ADD CONSTRAINT "upload_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;