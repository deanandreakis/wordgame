import type {CustomerInfo} from 'react-native-purchases';

/**
 * Helper to check if a level pack is purchased
 */
export function isLevelPackPurchased(
  packId: string,
  customerInfo: CustomerInfo,
): boolean {
  return customerInfo.entitlements.active[packId] !== undefined;
}

/**
 * Helper to check if premium is active
 */
export function isPremiumActive(customerInfo: CustomerInfo): boolean {
  return customerInfo.entitlements.active['premium'] !== undefined;
}
