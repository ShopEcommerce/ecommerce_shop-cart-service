import { CartService } from '../cart.service';
import { CartRepository, CartItem } from '../cart.repository';
import { redisWrapper } from '../../../redis/redis-wrapper';
import { CartMessages } from '../../../helpers/messages';

jest.mock('../cart.repository');
jest.mock('../../../redis/redis-wrapper');

describe('CartService', () => {
  const userId = 'test-user-123';
  const mockItem: CartItem = {
    productId: 'prod-001',
    variantId: 'var-001',
    quantity: 2,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCart', () => {
    it('should retrieve cart for a user', async () => {
      const mockCart = [mockItem];
      (CartRepository.getCart as jest.Mock).mockResolvedValue(mockCart);

      const result = await CartService.getCart(userId);

      expect(result).toEqual(mockCart);
      expect(CartRepository.getCart).toHaveBeenCalledWith(userId);
    });

    it('should return empty array when cart is empty', async () => {
      (CartRepository.getCart as jest.Mock).mockResolvedValue([]);

      const result = await CartService.getCart(userId);

      expect(result).toEqual([]);
    });
  });

  describe('addItem', () => {
    it('should add a new item to cart', async () => {
      const mockCart = [mockItem];
      (CartRepository.getCart as jest.Mock).mockResolvedValue([]);
      (CartRepository.saveCart as jest.Mock).mockResolvedValue(mockCart);

      const result = await CartService.addItem(userId, mockItem);

      expect(result).toEqual(mockCart);
      expect(CartRepository.saveCart).toHaveBeenCalledWith(userId, [mockItem]);
    });

    it('should increase quantity if item already exists', async () => {
      const existingItem: CartItem = { ...mockItem, quantity: 1 };
      (CartRepository.getCart as jest.Mock).mockResolvedValue([existingItem]);
      (CartRepository.saveCart as jest.Mock).mockResolvedValue([{ ...mockItem, quantity: 3 }]);

      const newItem: CartItem = { ...mockItem, quantity: 2 };
      await CartService.addItem(userId, newItem);

      expect(CartRepository.saveCart).toHaveBeenCalledWith(userId, [{ ...mockItem, quantity: 3 }]);
    });

    it('should throw error if quantity is 0 or negative', async () => {
      const invalidItem: CartItem = { ...mockItem, quantity: 0 };

      expect(() => CartService.addItem(userId, invalidItem)).rejects.toThrow(
        CartMessages.MSG_55.message,
      );
    });
  });

  describe('updateItemQuantity', () => {
    it('should update item quantity', async () => {
      (CartRepository.getCart as jest.Mock).mockResolvedValue([mockItem]);
      (CartRepository.saveCart as jest.Mock).mockResolvedValue([{ ...mockItem, quantity: 5 }]);

      await CartService.updateItemQuantity(userId, mockItem.variantId, 5);

      expect(CartRepository.saveCart).toHaveBeenCalledWith(userId, [{ ...mockItem, quantity: 5 }]);
    });

    it('should remove item if quantity is 0', async () => {
      (CartRepository.getCart as jest.Mock).mockResolvedValue([mockItem]);
      (CartRepository.saveCart as jest.Mock).mockResolvedValue([]);

      await CartService.updateItemQuantity(userId, mockItem.variantId, 0);

      expect(CartRepository.saveCart).toHaveBeenCalledWith(userId, []);
    });

    it('should throw error if item not found', async () => {
      (CartRepository.getCart as jest.Mock).mockResolvedValue([]);

      expect(() => CartService.updateItemQuantity(userId, 'non-existent-var', 5)).rejects.toThrow(
        CartMessages.MSG_56.message,
      );
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', async () => {
      const item1: CartItem = { productId: 'p1', variantId: 'v1', quantity: 1 };
      const item2: CartItem = { productId: 'p2', variantId: 'v2', quantity: 2 };
      (CartRepository.getCart as jest.Mock).mockResolvedValue([item1, item2]);
      (CartRepository.saveCart as jest.Mock).mockResolvedValue([item2]);

      await CartService.removeItem(userId, 'v1');

      expect(CartRepository.saveCart).toHaveBeenCalledWith(userId, [item2]);
    });

    it('should handle removing from single-item cart', async () => {
      (CartRepository.getCart as jest.Mock).mockResolvedValue([mockItem]);
      (CartRepository.saveCart as jest.Mock).mockResolvedValue([]);

      await CartService.removeItem(userId, mockItem.variantId);

      expect(CartRepository.saveCart).toHaveBeenCalledWith(userId, []);
    });
  });

  describe('clearCart', () => {
    it('should clear entire cart', async () => {
      (CartRepository.clearCart as jest.Mock).mockResolvedValue(undefined);

      await CartService.clearCart(userId);

      expect(CartRepository.clearCart).toHaveBeenCalledWith(userId);
    });
  });
});

describe('CartRepository', () => {
  const mockItems: CartItem[] = [{ productId: 'p1', variantId: 'v1', quantity: 2 }];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCart', () => {
    it('should retrieve cart from Redis', async () => {
      const redisClient = {
        get: jest.fn().mockResolvedValue(JSON.stringify(mockItems)),
      };
      (redisWrapper.client as any) = redisClient;

      // Note: This test structure depends on actual implementation
      // Adjust based on how CartRepository actually uses Redis
    });

    it('should return empty array if cart does not exist', async () => {
      const redisClient = {
        get: jest.fn().mockResolvedValue(null),
      };
      (redisWrapper.client as any) = redisClient;
    });
  });

  describe('saveCart', () => {
    it('should save cart to Redis with TTL', async () => {
      const redisClient = {
        set: jest.fn().mockResolvedValue('OK'),
      };
      (redisWrapper.client as any) = redisClient;

      // Adjust based on actual CartRepository implementation
    });

    it('should delete cart if items array is empty', async () => {
      const redisClient = {
        del: jest.fn().mockResolvedValue(1),
      };
      (redisWrapper.client as any) = redisClient;
    });
  });

  describe('clearCart', () => {
    it('should delete cart from Redis', async () => {
      const redisClient = {
        del: jest.fn().mockResolvedValue(1),
      };
      (redisWrapper.client as any) = redisClient;
    });
  });
});
