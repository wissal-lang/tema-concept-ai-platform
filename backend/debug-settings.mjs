import prisma from './src/config/prisma.js';

const key = 'chatbot';
const value = { enabled: true, name: 'Tema Assistant' };

try {
  const payload = typeof value === 'string' ? value : JSON.stringify(value);
  const savedSetting = await prisma.platformSetting.upsert({
    where: { key },
    update: { value: payload },
    create: { key, value: payload, category: key },
  });
  console.log('savedSetting', savedSetting);
} catch (error) {
  console.error('ERR', error);
} finally {
  await prisma.$disconnect();
}
