import { Message } from 'amqplib';
import { BaseListener, OrderCreatedEvent, QueueGroupNames, Subjects } from '@teleshop/common';
import { CartService } from '../../modules/cart/cart.service';
import { redisWrapper } from '../../redis/redis-wrapper';
import { CartMessages } from '../../helpers/messages';
import pino from 'pino';

const logger = pino();

export class OrderCreatedListener extends BaseListener<OrderCreatedEvent> {
  readonly subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = QueueGroupNames.CartService;

  async onMessage(data: OrderCreatedEvent['data'], _msg: Message) {
    const eventId = data.id || (data as any).eventId;
    const userId = data.userId || (data as any).customerId;

    if (!eventId || !userId) {
      throw new Error('Invalid OrderCreated payload: missing event identifier or user identifier');
    }

    const idempotencyKey = `processed_event:${eventId}`;

    const isNew = await redisWrapper.client.set(idempotencyKey, '1', 'EX', 604800, 'NX');

    if (!isNew) {
      logger.info(
        `[Cart Service] Event ${eventId} has already been processed. Skipping (Idempotent).`,
      );
      logger.info(CartMessages.MSG_59.message);
      return;
    }

    logger.info(`[Cart Service] Received order creation event. Cleaning up user's cart: ${userId}`);

    await CartService.clearCart(userId);

    logger.info(`[Cart Service] Successfully cleaned up user's cart!`);
    logger.info(CartMessages.MSG_58.message);
  }
}
