import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Load environment variables from .env file (plain text, no encryption)
config({ debug: false });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
