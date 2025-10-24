import * as app from "@/drizzle/app"
import * as auth from "@/drizzle/auth"
import { drizzle } from "drizzle-orm/neon-http"

export const db = drizzle(process.env.DATABASE_URL!, {
  schema: { ...app, ...auth },
})
