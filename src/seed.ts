import 'dotenv/config';
import pino from 'pino';
import { redisWrapper } from './redis/redis-wrapper';
import { CartRepository } from './modules/cart/cart.repository';

const logger = pino();

const waitForRedis = async () => {
  if (!process.env.REDIS_URL) {
    throw new Error('REDIS_URL must be defined');
  }

  redisWrapper.connect(process.env.REDIS_URL);

  let retries = 0;
  const maxRetries = 10;

  while (retries < maxRetries) {
    if (await redisWrapper.healthCheck()) {
      return;
    }
    retries++;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error('Failed to connect to Redis for cart seed');
};

async function main() {
  logger.info('Seeding Cart Service Redis data...');

  await waitForRedis();

  await CartRepository.saveCart('00000000-0000-0000-0000-000000000003', [
    {
      productId: '00000000-0000-0000-0000-000000000201',
      variantId: '00000000-0000-0000-0000-000000000301',
      quantity: 1,
    },
    {
      productId: '00000000-0000-0000-0000-000000000202',
      variantId: '00000000-0000-0000-0000-000000000303',
      quantity: 1,
    },
  ]);

  logger.info('Cart seed complete: customer cart saved to Redis.');
}

main()
  .catch((error) => {
    logger.error(error);
    throw error;
  })
  .finally(async () => {
    await redisWrapper.disconnect().catch(() => undefined);
  });
