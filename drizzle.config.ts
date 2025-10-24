import { defineConfig } from "drizzle-kit"

const config = defineConfig({
  schema: "src/drizzle",
  out: "src/drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
})

export default config
