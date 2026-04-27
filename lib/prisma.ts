import {PrismaClient} from '@/lib/generated/prisma'

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

globalThis.prismaGlobal = prisma

export default prisma
