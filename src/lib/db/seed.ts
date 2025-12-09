import "dotenv/config";
import { db } from "./index";
import { users } from "./schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

// Load environment variables with proper defaults
const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || "admin@shoroot.com";
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || "admin123";

async function seed() {
  try {
    console.log("🌱 Starting database seeding...");
    console.log(`📧 Using email: ${SUPER_ADMIN_EMAIL}`);

    // Check if admin user already exists
    try {
      const existingAdmins = await db
        .select()
        .from(users)
        .where(eq(users.email, SUPER_ADMIN_EMAIL));

      if (existingAdmins && existingAdmins.length > 0) {
        console.log("✅ Admin user already exists, skipping seed.");
        return;
      }
    } catch (checkError) {
      console.log("ℹ️ First time setup - creating admin user...");
    }

    // Create admin user
    const hashedPassword = bcrypt.hashSync(SUPER_ADMIN_PASSWORD, 10);

    const result = await db.insert(users).values({
      email: SUPER_ADMIN_EMAIL,
      fullName: "Admin User",
      password: hashedPassword,
      role: "admin",
      hasAcceptedTerms: true,
      acceptedTermsAt: new Date(),
    }).returning();

    console.log("✅ Admin user created successfully!");
    console.log(`📧 Email: ${SUPER_ADMIN_EMAIL}`);
    console.log(`🔑 Password: ${SUPER_ADMIN_PASSWORD}`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seed()
    .then(() => {
      console.log("🎉 Database seeding completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Database seeding failed:", error);
      process.exit(1);
    });
}

export { seed };
