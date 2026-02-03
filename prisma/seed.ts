import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import chalk from 'chalk';

const prisma = new PrismaClient();

// Types
type SeedUser = {
  id: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
};

// Sample data
const users: Omit<SeedUser, 'id' | 'password'>[] = [
  { email: 'admin@example.com', role: 'admin' },
  { email: 'sarah.miller@example.com', role: 'user' },
  { email: 'james.wilson@example.com', role: 'user' },
  { email: 'emma.davis@example.com', role: 'user' },
  { email: 'michael.brown@example.com', role: 'user' },
  { email: 'olivia.jones@example.com', role: 'user' },
  { email: 'william.taylor@example.com', role: 'user' },
];

// Seed function
async function seed() {
  try {
    // Clear existing data (optional)
    console.log(chalk.yellow('🗑️  Clearing existing data...'));
    await prisma.user.deleteMany();
    console.log(chalk.green('✓ Existing data cleared'));

    // Seed users
    console.log(chalk.yellow('🌱 Seeding users...'));
    const createdUsers = await Promise.all(
      users.map(async (user) => {
        const hashedPassword = await hash('Password123!', 10);
        return prisma.user.create({
          data: {
            id: uuidv4(),
            email: user.email,
            password: hashedPassword,
            role: user.role,
          },
        });
      })
    );
    console.log(chalk.green(`✓ Created ${createdUsers.length} users`));

    console.log(chalk.green('✓ Database seeding completed successfully'));
  } catch (error) {
    console.error(chalk.red('Error seeding database:'), error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Export seed function
export default seed;

// Execute if running directly
if (require.main === module) {
  seed()
    .catch((error) => {
      console.error(chalk.red('Failed to seed database:'), error);
      process.exit(1);
    });
}