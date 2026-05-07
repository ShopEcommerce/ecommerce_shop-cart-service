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

    await rabbitmqWrapper.connect(process.env.RABBITMQ_URL);

    new OrderCreatedListener(rabbitmqWrapper.channel).listen();

    // Graceful Shutdown
    process.on('SIGINT', () => rabbitmqWrapper.close());
    process.on('SIGTERM', () => rabbitmqWrapper.close());

    const port = process.env.PORT;
    app.listen(port, () => {
      logger.info(`[Cart Service] is running on port ${port}`);
    });
  } catch (err) {
    logger.error({ msg: 'Failed to start Cart Service', error: err });
  }
};

start();