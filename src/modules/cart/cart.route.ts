import express, { RequestHandler } from 'express';
import { CartController } from './cart.controller';
import { requireAuth, asyncHandler } from '@teleshop/common';
import { validateZod } from '../../middlewares/validate.middleware';
import { addItemSchema, removeItemSchema, updateQuantitySchema } from './cart.schema';

const router = express.Router();
const requireAuthMw = requireAuth as unknown as RequestHandler;

router.use(requireAuthMw);

router.get('/', asyncHandler(CartController.getCart as any));

router.post('/items', validateZod(addItemSchema), asyncHandler(CartController.addItem as any));

router.put(
  '/items/:variantId',
  validateZod(updateQuantitySchema),
  asyncHandler(CartController.updateQuantity as any),
);

router.delete(
  '/items/:variantId',
  validateZod(removeItemSchema),
  asyncHandler(CartController.removeItem as any),
);

router.delete('/', asyncHandler(CartController.clearCart as any));

export { router as cartRouter };
