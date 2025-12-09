import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./src/lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    // Prefer environment variable, fall back to provided connection string
    url:
      process.env.DATABASE_URL ||
      "postgresql://neondb_owner:npg_U6mHCfo2tEdG@ep-sparkling-hat-ahqiw1qu-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  },
});
