import { PrismaClient } from '@prisma/client';

const getDatabaseUrl = () => {
  let url = process.env.DATABASE_URL;
  if (url && url.includes('@/')) {
    url = url.replace('@/', '@localhost/');
  }
  return url;
};

const prismaClientSingleton = () => {
  const url = getDatabaseUrl();
  return new PrismaClient(
    url ? { datasources: { db: { url } } } : undefined
  );
};

const globalForPrisma = globalThis;

const prisma = globalForPrisma.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prismaGlobal = prisma;
}

