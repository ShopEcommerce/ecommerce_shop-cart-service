import 'dotenv/config';
import { app } from './app';
import { rabbitmqWrapper } from '@teleshop/common';
import pino from 'pino';
import { redisWrapper } from './redis/redis-wrapper';
import { OrderCreatedListener } from './events/listeners/order-created-listener';

const logger = pino();

const start = async () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET must be defined');
  }
  if (!process.env.RABBITMQ_URL) {
    throw new Error('RABBITMQ_URL must be defined');
  }
  if (!process.env.REDIS_URL) {
    throw new Error('REDIS_URL must be defined');
  }

  try {
    redisWrapper.connect(process.env.REDIS_URL);

    // Wait for Redis connection to be established
    let isRedisReady = false;
    const maxRetries = 10;
    let retries = 0;

    while (!isRedisReady && retries < maxRetries) {
      const isHealthy = await redisWrapper.healthCheck();
      if (isHealthy) {
        isRedisReady = true;
        logger.info('[Cart Service] Redis connection verified');
      } else {
        retries++;
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    if (!isRedisReady) {
      throw new Error('Failed to connect to Redis after multiple retries');
    }

    await rabbitmqWrapper.connect(process.env.RABBITMQ_URL);

    new OrderCreatedListener(rabbitmqWrapper.channel).listen();

    // Graceful Shutdown
    process.on('SIGINT', async () => {
      logger.info('[Cart Service] Graceful shutdown initiated');
      await redisWrapper.disconnect();
      rabbitmqWrapper.close();
    });

    process.on('SIGTERM', async () => {
      logger.info('[Cart Service] Graceful shutdown initiated');
      await redisWrapper.disconnect();
      rabbitmqWrapper.close();
    });

    const port = process.env.PORT;
    app.listen(port, () => {
      logger.info(`[Cart Service] is running on port ${port}`);
    });
  } catch (err) {
    logger.error({ msg: 'Failed to start Cart Service', error: err });
    process.exit(1);
  }
};

start();
