import { defineConfig } from "@prisma/config"

const databaseUrl = process.env.DATABASE_URL || ""

export default defineConfig({
  db: {
    url: databaseUrl,
  },
})
