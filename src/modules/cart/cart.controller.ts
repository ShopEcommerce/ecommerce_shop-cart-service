import { Request, Response } from 'express';
import { CartService } from './cart.service';

export class CartController {
  static async getCart(req: Request, res: Response) {
    const userId = req.currentUser!.id;
    const cart = await CartService.getCart(userId);
    res.status(200).send({ data: cart });
  }

  static async addItem(req: Request, res: Response) {
    const userId = req.currentUser!.id;
    const { productId, variantId, quantity } = req.body;

    const cart = await CartService.addItem(userId, { productId, variantId, quantity });
    res.status(200).send({ message: 'Item added to cart', data: cart });
  }

  static async updateQuantity(
    req: Request<{ variantId: string }, unknown, { quantity: number }>,
    res: Response,
  ) {
    const userId = req.currentUser!.id;
    const { quantity } = req.body;
    const { variantId } = req.params;

    const cart = await CartService.updateItemQuantity(userId, variantId, quantity);
    res.status(200).send({ message: 'Item quantity updated', data: cart });
  }

  static async removeItem(req: Request<{ variantId: string }>, res: Response) {
    const userId = req.currentUser!.id;
    const { variantId } = req.params;

    const cart = await CartService.removeItem(userId, variantId);
    res.status(200).send({ message: 'Item removed from cart', data: cart });
  }
}
