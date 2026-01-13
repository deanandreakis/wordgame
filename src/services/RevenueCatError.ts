/**
 * Custom RevenueCat error types for better error handling
 */

export class RevenueCatError extends Error {
  code: string;
  userMessage: string;

  constructor(code: string, userMessage: string) {
    super(userMessage);
    this.code = code;
    this.name = 'RevenueCatError';
    this.userMessage = userMessage;
  }
}

export const RevenueCatErrorCode = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  PURCHASE_FAILED: 'PURCHASE_FAILED',
  INVALID_RECEIPT: 'INVALID_RECEIPT',
  ENTITLEMENT_NOT_GRANTED: 'ENTITLEMENT_NOT_GRANTED',
  PRODUCT_NOT_FOUND: 'PRODUCT_NOT_FOUND',
  API_KEY_INVALID: 'API_KEY_INVALID',
  SERVER_ERROR: 'SERVER_ERROR',
} as const;
