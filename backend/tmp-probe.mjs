import { PrismaClient } from '@prisma/client';

const urls = [
  'postgresql://postgres@localhost:5432/tema_concept',
  'postgresql://postgres:postgres@localhost:5432/tema_concept',
  'postgresql://postgres:admin@localhost:5432/tema_concept',
  'postgresql://postgres:1234@localhost:5432/tema_concept',
  'postgresql://postgres:password@localhost:5432/tema_concept'
];

for (const url of urls) {
  try {
    const prisma = new PrismaClient({ datasources: { db: { url } } });
    await prisma.$connect();
    console.log('SUCCESS', url.replace(/:([^:@]+)@/, ':***@'));
    await prisma.$disconnect();
  } catch (error) {
    console.log('FAIL', url.replace(/:([^:@]+)@/, ':***@'), error.message.split('\n')[0]);
  }
}
