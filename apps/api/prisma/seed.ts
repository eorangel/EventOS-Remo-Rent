import { seedDevelopment } from './seed.development';
import { seedProduction } from './seed.production';

async function main() {
  const mode = process.env.SEED_MODE === 'production' ? 'production' : 'development';

  if (mode === 'production') {
    await seedProduction();
    return;
  }

  await seedDevelopment();
}

main()
  .catch(console.error);
