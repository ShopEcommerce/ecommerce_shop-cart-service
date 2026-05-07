import { z } from 'zod';

export const addItemSchema = z.object({
  body: z.object({
    productId: z.string({ error: 'Product ID is required' }).uuid('Product ID must be a valid UUID'),
    variantId: z.string({ error: 'Variant ID is required' }).uuid('Variant ID must be a valid UUID'),
    quantity: z.number({ error: 'Quantity is required' })
      .int('Quantity must be an integer')
      .positive('Added quantity must be a positive number'),
  }),
});

export const updateQuantitySchema = z.object({
  params: z.object({
    variantId: z.string({ error: 'Variant ID is required' }).uuid('Variant ID must be a valid UUID'),
  }),
  body: z.object({
    quantity: z.number({ error: 'Quantity is required' })
      .int('Quantity must be an integer')
      .nonnegative('Quantity cannot be a negative number'),
  }),
});

export const removeItemSchema = z.object({
  params: z.object({
    variantId: z.string({ error: 'Variant ID is required' }).uuid('Variant ID must be a valid UUID'),
  }),
});