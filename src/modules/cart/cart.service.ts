import { CartRepository, CartItem } from './cart.repository';
import { BadRequestError } from '@teleshop/common';
import { CartMessages } from '../../helpers/messages';

export class CartService {
  static async getCart(userId: string) {
    return CartRepository.getCart(userId);
  }

  static async addItem(userId: string, newItem: CartItem) {
    if (newItem.quantity <= 0) throw new BadRequestError(CartMessages.MSG_55.message);

    const items = await CartRepository.getCart(userId);

    const existingItemIndex = items.findIndex((i) => i.variantId === newItem.variantId);

    if (existingItemIndex > -1) {
      items[existingItemIndex].quantity += newItem.quantity;
    } else {
      if (items.length >= 100) {
        throw new BadRequestError(CartMessages.MSG_61.message);
      }
      items.push(newItem);
    }

    return CartRepository.saveCart(userId, items);
  }

  static async updateItemQuantity(userId: string, variantId: string, quantity: number) {
    if (quantity <= 0) {
      return this.removeItem(userId, variantId);
    }

    const items = await CartRepository.getCart(userId);
    const itemIndex = items.findIndex((i) => i.variantId === variantId);

    if (itemIndex === -1) throw new BadRequestError(CartMessages.MSG_56.message);

    items[itemIndex].quantity = quantity;

    return CartRepository.saveCart(userId, items);
  }

  static async removeItem(userId: string, variantId: string) {
    const items = await CartRepository.getCart(userId);
    const updatedItems = items.filter((i) => i.variantId !== variantId);
    return CartRepository.saveCart(userId, updatedItems);
  }

  static async clearCart(userId: string) {
    await CartRepository.clearCart(userId);
  }
}
