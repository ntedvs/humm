CREATE TABLE "relation" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role" text DEFAULT 'viewer' NOT NULL,
	"joined" timestamp DEFAULT now() NOT NULL,
	"companyId" text NOT NULL,
	"userId" text NOT NULL,
	CONSTRAINT "relation_companyId_userId_unique" UNIQUE("companyId","userId")
);
--> statement-breakpoint
ALTER TABLE "relation" ADD CONSTRAINT "relation_companyId_company_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."company"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relation" ADD CONSTRAINT "relation_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;