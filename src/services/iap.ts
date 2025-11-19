import {Platform} from 'react-native';
import Purchases, {
  PurchasesOffering,
  PurchasesPackage,
  CustomerInfo,
} from 'react-native-purchases';
import Constants from 'expo-constants';
import {IAP_PRODUCTS} from '@/config/constants';

/**
 * RevenueCat IAP Service for Expo
 * Works with both iOS and Android
 * API keys are loaded from secure environment variables via app.config.js
 */
export const IAPService = {
  /**
   * Initialize RevenueCat with platform-specific API key from environment
   */
  async initialize(): Promise<void> {
    try {
      // Get API key based on platform from expo-constants
      const apiKey =
        Platform.OS === 'ios'
          ? Constants.expoConfig?.extra?.revenueCat?.iosApiKey
          : Constants.expoConfig?.extra?.revenueCat?.androidApiKey;

      if (!apiKey) {
        throw new Error(
          `RevenueCat API key not found for ${Platform.OS}. Please check your environment variables and app.config.js`,
        );
      }

      await Purchases.configure({apiKey});
      Purchases.setDebugLogsEnabled(__DEV__);
      console.log('RevenueCat initialized for', Platform.OS);
    } catch (error) {
      console.error('Error initializing RevenueCat:', error);
      throw error;
    }
  },

  /**
   * Get available offerings
   */
  async getOfferings(): Promise<PurchasesOffering | null> {
    try {
      const offerings = await Purchases.getOfferings();
      return offerings.current;
    } catch (error) {
      console.error('Error getting offerings:', error);
      return null;
    }
  },

  /**
   * Purchase a package
   */
  async purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo> {
    try {
      const {customerInfo} = await Purchases.purchasePackage(pkg);

      if (this.onPurchaseSuccess) {
        this.onPurchaseSuccess(customerInfo);
      }

      return customerInfo;
    } catch (error) {
      console.error('Error purchasing package:', error);

      if (this.onPurchaseError) {
        this.onPurchaseError(error);
      }

      throw error;
    }
  },

  /**
   * Restore purchases
   */
  async restorePurchases(): Promise<CustomerInfo> {
    try {
      const customerInfo = await Purchases.restorePurchases();
      return customerInfo;
    } catch (error) {
      console.error('Error restoring purchases:', error);
      throw error;
    }
  },

  /**
   * Get customer info
   */
  async getCustomerInfo(): Promise<CustomerInfo> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return customerInfo;
    } catch (error) {
      console.error('Error getting customer info:', error);
      throw error;
    }
  },

  /**
   * Cleanup RevenueCat resources
   */
  cleanup(): void {
    // RevenueCat doesn't require explicit cleanup, but we can reset callbacks
    this.onPurchaseSuccess = null;
    this.onPurchaseError = null;
  },

  // Callbacks (set by the app)
  onPurchaseSuccess: null as ((customerInfo: CustomerInfo) => void) | null,
  onPurchaseError: null as ((error: any) => void) | null,
};

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
 * Get level pack product ID by pack number
 */
export function getLevelPackProductId(packNumber: number): string {
  switch (packNumber) {
    case 1:
      return IAP_PRODUCTS.LEVEL_PACK_1;
    case 2:
      return IAP_PRODUCTS.LEVEL_PACK_2;
    case 3:
      return IAP_PRODUCTS.LEVEL_PACK_3;
    default:
      return IAP_PRODUCTS.LEVEL_PACK_1;
  }
}
