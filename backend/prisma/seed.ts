import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { ROLE } from '../src/utils/constants';
import { DEFAULT_COMMENTS, DEFAULT_SETTINGS } from '../src/services/settings.service';

const prisma = new PrismaClient();

const ADMIN_EMAIL = 'wisemuhasbookclub@gmail.com';
const ADMIN_PASSWORD = 'wisebook123';

const CATEGORIES: Array<{ name: string; description: string }> = [
  { name: 'Language', description: 'Language and communication' },
  { name: 'School', description: 'School textbooks and revision' },
  { name: 'Novels', description: 'Novels and long-form fiction' },
  { name: 'Medical', description: 'Health, anatomy and clinical references' },
  { name: 'Education', description: 'Textbooks and study guides' },
  { name: 'Fiction', description: 'Novels, short stories and more' },
  { name: 'Business', description: 'Entrepreneurship and economics' },
  { name: 'Technology', description: 'Computing and engineering' },
  { name: 'Children', description: 'Stories and learning for kids' },
  { name: 'Biography', description: 'Lives of remarkable people' },
  { name: 'Science', description: 'Physics, chemistry and biology' },
  { name: 'History', description: 'Africa and the world' },
  { name: 'Religion', description: 'Faith and spirituality' },
  { name: 'Art', description: 'Design, music and creativity' },
  { name: 'Travel', description: 'Guides and exploration' },
];

async function main(): Promise<void> {
  // Only create the default admin when the account does not exist yet.
  const existingAdmin = await prisma.user.findFirst({ where: { role: ROLE.ADMIN } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await prisma.user.create({
      data: {
        email: ADMIN_EMAIL,
        name: 'Bookstore Owner',
        passwordHash,
        role: ROLE.ADMIN,
        isActive: true,
      },
    });
    console.log(`Created default admin: ${ADMIN_EMAIL}`);
  } else {
    console.log(`Admin already exists (${existingAdmin.email}); leaving it untouched.`);
  }

  for (const category of CATEGORIES) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: { name: category.name, description: category.description },
    });
  }

  // Seed default site content only when the Owner has not saved settings before.
  await prisma.siteSetting.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, data: DEFAULT_SETTINGS },
  });

  // Seed default comments only when none exist yet.
  const commentCount = await prisma.comment.count();
  if (commentCount === 0) {
    await prisma.comment.createMany({ data: DEFAULT_COMMENTS });
    console.log(`Seeded ${DEFAULT_COMMENTS.length} comments.`);
  }

  console.log(`Seeded ${CATEGORIES.length} categories and default site settings.`);
  console.log('Seed complete.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
