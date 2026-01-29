CREATE TABLE IF NOT EXISTS "bet_assignees" (
	"id" serial PRIMARY KEY NOT NULL,
	"bet_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	"assigned_by" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bets" ADD COLUMN "visibility" text DEFAULT 'public' NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bet_assignees" ADD CONSTRAINT "bet_assignees_bet_id_bets_id_fk" FOREIGN KEY ("bet_id") REFERENCES "public"."bets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bet_assignees" ADD CONSTRAINT "bet_assignees_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bet_assignees" ADD CONSTRAINT "bet_assignees_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_bet_user_assignee" ON "bet_assignees" USING btree ("bet_id","user_id");