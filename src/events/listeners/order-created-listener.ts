import { Message } from 'amqplib';
import { BaseListener, QueueGroupNames } from '@teleshop/common';
import { CartService } from '../../modules/cart/cart.service';
import { redisWrapper } from '../../redis/redis-wrapper';
import pino from 'pino';

const logger = pino();

export class OrderCreatedListener extends BaseListener<any> {
  subject: any = 'OrderCreated'; 
  queueGroupName = QueueGroupNames.CartService; 

  async onMessage(data: any, msg: Message) {
    const eventId = data.id || data.eventId; 
    const idempotencyKey = `processed_event:${eventId}`;

    const isNew = await redisWrapper.client.set(idempotencyKey, '1', 'EX', 604800, 'NX');

    if (!isNew) {
      logger.info(`[Cart Service] Event ${eventId} has already been processed. Skipping (Idempotent).`);
      return; 
    }

    logger.info(`[Cart Service] Received order creation event. Cleaning up user's cart: ${data.userId}`);

    await CartService.clearCart(data.userId);

    logger.info(`[Cart Service] Successfully cleaned up user's cart!`);
  }
}