/**
 * Cart Service Message Constants (MSG_50+)
 * Centralized message definitions for consistent error/success responses
 * Used across controllers, services, and event listeners
 */

export enum MessageCode {
  // Cart Operations (MSG_50-57)
  MSG_50 = 'MSG_50',
  MSG_51 = 'MSG_51',
  MSG_52 = 'MSG_52',
  MSG_53 = 'MSG_53',
  MSG_54 = 'MSG_54',
  MSG_55 = 'MSG_55',
  MSG_56 = 'MSG_56',
  MSG_57 = 'MSG_57',
  MSG_58 = 'MSG_58',
  MSG_59 = 'MSG_59',
  MSG_60 = 'MSG_60',
  MSG_61 = 'MSG_61',
}

export interface MessageDefinition {
  code: MessageCode;
  message: string;
  httpStatus: number;
  category: 'success' | 'validation' | 'not-found' | 'conflict' | 'server' | 'idempotency';
}

export class CartMessages {
  // Success Messages
  static readonly MSG_50: MessageDefinition = {
    code: MessageCode.MSG_50,
    message: 'Item added to cart successfully',
    httpStatus: 200,
    category: 'success',
  };

  static readonly MSG_51: MessageDefinition = {
    code: MessageCode.MSG_51,
    message: 'Item quantity updated successfully',
    httpStatus: 200,
    category: 'success',
  };

  static readonly MSG_52: MessageDefinition = {
    code: MessageCode.MSG_52,
    message: 'Item removed from cart successfully',
    httpStatus: 200,
    category: 'success',
  };

  static readonly MSG_53: MessageDefinition = {
    code: MessageCode.MSG_53,
    message: 'Cart retrieved successfully',
    httpStatus: 200,
    category: 'success',
  };

  static readonly MSG_54: MessageDefinition = {
    code: MessageCode.MSG_54,
    message: 'Cart cleared successfully',
    httpStatus: 200,
    category: 'success',
  };

  // Validation Errors
  static readonly MSG_55: MessageDefinition = {
    code: MessageCode.MSG_55,
    message: 'Quantity must be greater than 0',
    httpStatus: 400,
    category: 'validation',
  };

  static readonly MSG_56: MessageDefinition = {
    code: MessageCode.MSG_56,
    message: 'Product not found in cart',
    httpStatus: 404,
    category: 'not-found',
  };

  static readonly MSG_57: MessageDefinition = {
    code: MessageCode.MSG_57,
    message: 'Cart is empty',
    httpStatus: 200,
    category: 'success',
  };

  // Event Handling
  static readonly MSG_58: MessageDefinition = {
    code: MessageCode.MSG_58,
    message: 'Order created event processed, cart cleared',
    httpStatus: 200,
    category: 'success',
  };

  static readonly MSG_59: MessageDefinition = {
    code: MessageCode.MSG_59,
    message: 'Duplicate event detected, skipping processing',
    httpStatus: 200,
    category: 'idempotency',
  };

  // Server Errors
  static readonly MSG_60: MessageDefinition = {
    code: MessageCode.MSG_60,
    message: 'Failed to process cart operation',
    httpStatus: 500,
    category: 'server',
  };

  static readonly MSG_61: MessageDefinition = {
    code: MessageCode.MSG_61,
    message: 'Cart is full, cannot add more items',
    httpStatus: 500,
    category: 'validation',
  };

  // Helper Methods
  static buildResponse(code: MessageCode, data?: any) {
    const messageDef = Object.values(this).find(
      (v) => v instanceof Object && 'code' in v && v.code === code,
    ) as MessageDefinition | undefined;

    if (!messageDef) {
      return {
        code: 'UNKNOWN',
        message: 'Unknown message code',
        data,
      };
    }

    return {
      code: messageDef.code,
      message: messageDef.message,
      data,
    };
  }

  static buildSuccessResponse(code: MessageCode, data?: any) {
    return this.buildResponse(code, data);
  }

  static buildErrorResponse(code: MessageCode, details?: string) {
    const messageDef = Object.values(this).find(
      (v) => v instanceof Object && 'code' in v && v.code === code,
    ) as MessageDefinition | undefined;

    return {
      code: messageDef?.code || 'UNKNOWN',
      message: messageDef?.message || 'An error occurred',
      details,
    };
  }
}
