import { redisWrapper } from '../../redis/redis-wrapper';

export interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
}

export class CartRepository {
  // Time To Live: 7 days
  private static TTL = 7 * 24 * 60 * 60; 

  private static getKey(userId: string) {
    return `cart:${userId}`;
  }

  static async getCart(userId: string): Promise<CartItem[]> {
    const data = await redisWrapper.client.get(this.getKey(userId));
    if (!data) return []; 
    return JSON.parse(data);
  }

  static async saveCart(userId: string, items: CartItem[]) {
    if (items.length === 0) {
      await redisWrapper.client.del(this.getKey(userId));
      return [];
    }

    await redisWrapper.client.set(
      this.getKey(userId), 
      JSON.stringify(items), 
      'EX',
      this.TTL
    );
    return items;
  }

  static async clearCart(userId: string) {
    await redisWrapper.client.del(this.getKey(userId));
  }
}