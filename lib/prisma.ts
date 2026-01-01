import { PrismaClient } from "@/lib/generated/prisma"
import path from "path"

const prismaClientSingleton = () => {
  const dbPath = path.resolve(process.cwd(), "prisma", "dev.db")
  
  return new PrismaClient({
    datasources: {
      db: {
        url: `file:${dbPath}`
      }
    }
  })
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma
}

export default prisma