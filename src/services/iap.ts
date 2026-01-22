import {Platform} from 'react-native';
import type {
  PurchasesOffering,
  PurchasesPackage,
  CustomerInfo,
} from 'react-native-purchases';
import {IAP_PRODUCTS} from '@/config/constants';
import {RUNTIME_SECRETS} from '@/config/secrets';
import type {UserProfile} from '@/types/game';

/**
 * Check if RevenueCat native module is available
 * Returns false when running in Expo Go (which doesn't include native modules)
 */
function isNativeModuleAvailable(): boolean {
  try {
    // Try to require the module - will throw if not available
    require('react-native-purchases');
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get Purchases module (lazy loaded)
 */
function getPurchases() {
  try {
    return require('react-native-purchases').default;
  } catch (error) {
    return null;
  }
}

/**
 * RevenueCat IAP Service for Expo
 * Works with both iOS and Android
 * API keys are loaded from secure environment variables via app.config.js
 * Gracefully handles Expo Go (where native module is not available)
 */
export const IAPService = {
  isAvailable: isNativeModuleAvailable(),

  /**
   * Initialize RevenueCat with platform-specific API key from environment
   */
  async initialize(): Promise<void> {
    if (!this.isAvailable) {
      console.warn(
        'RevenueCat not available - running in Expo Go. Build a development client to test IAP functionality.',
      );
      return;
    }

    const Purchases = getPurchases();
    if (!Purchases) {
      console.warn('RevenueCat module not found');
      return;
    }

    try {
      // Get API key based on platform from runtime secrets
      const apiKey =
        Platform.OS === 'ios'
          ? RUNTIME_SECRETS.REVENUECAT_IOS_API_KEY
          : RUNTIME_SECRETS.REVENUECAT_ANDROID_API_KEY;

      // Debug logging to diagnose API key issues
      console.log('[IAP Debug] Platform:', Platform.OS);
      console.log('[IAP Debug] apiKey exists:', !!apiKey && !apiKey.includes('__'));
      console.log('[IAP Debug] apiKey length:', apiKey?.length || 0);
      console.log('[IAP Debug] apiKey is placeholder:', apiKey?.includes('__') || false);

      // Check if the API key is still a placeholder (not replaced during build)
      if (!apiKey || apiKey.includes('__REVENUECAT_')) {
        throw new Error(
          `RevenueCat API key not found for ${Platform.OS}. The secret was not injected during the build process.`,
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
    if (!this.isAvailable) {
      console.warn('RevenueCat not available');
      return null;
    }

    const Purchases = getPurchases();
    if (!Purchases) return null;

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
    if (!this.isAvailable) {
      throw new Error(
        'RevenueCat not available - build a development client to test purchases',
      );
    }

    const Purchases = getPurchases();
    if (!Purchases) {
      throw new Error('RevenueCat module not found');
    }

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
    if (!this.isAvailable) {
      throw new Error(
        'RevenueCat not available - build a development client to restore purchases',
      );
    }

    const Purchases = getPurchases();
    if (!Purchases) {
      throw new Error('RevenueCat module not found');
    }

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
    if (!this.isAvailable) {
      throw new Error('RevenueCat not available');
    }

    const Purchases = getPurchases();
    if (!Purchases) {
      throw new Error('RevenueCat module not found');
    }

    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return customerInfo;
    } catch (error) {
      console.error('Error getting customer info:', error);
      throw error;
    }
  },

  /**
   * Purchase a product by product ID
   * This method finds the package with the matching product identifier and purchases it
   */
  async purchaseProduct(productId: string): Promise<CustomerInfo> {
    if (!this.isAvailable) {
      throw new Error(
        'RevenueCat not available - build a development client to test purchases',
      );
    }

    try {
      const offering = await this.getOfferings();

      if (!offering) {
        throw new Error('No offerings available');
      }

      // Find package with matching product identifier
      const pkg = offering.availablePackages.find(
        p => p.product.identifier === productId
      );

      if (!pkg) {
        throw new Error(`Product ${productId} not found in offerings`);
      }

      return await this.purchasePackage(pkg);
    } catch (error) {
      console.error('Error purchasing product:', error);
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

/**
 * Helper to check if premium is active
 */
export function isPremiumActive(customerInfo: CustomerInfo): boolean {
  return customerInfo.entitlements.active['premium'] !== undefined;
}

/**
 * Get coin amount for a product ID
 */
export function getCoinAmountForProduct(productId: string): number {
  const {COIN_AMOUNTS} = require('@/config/constants');

  switch (productId) {
    case IAP_PRODUCTS.COINS_SMALL:
      return COIN_AMOUNTS.SMALL;
    case IAP_PRODUCTS.COINS_MEDIUM:
      return COIN_AMOUNTS.MEDIUM;
    case IAP_PRODUCTS.COINS_LARGE:
      return COIN_AMOUNTS.LARGE;
    default:
      return 0;
  }
}

/**
 * Sync purchases from RevenueCat with local user profile
 * This ensures the local state matches what RevenueCat has on record
 */
export async function syncPurchasesWithRevenueCat(
  currentProfile: UserProfile,
): Promise<UserProfile> {
  if (!IAPService.isAvailable) {
    console.warn(
      'RevenueCat not available - skipping purchase sync (running in Expo Go)',
    );
    return currentProfile;
  }

  try {
    const customerInfo = await IAPService.getCustomerInfo();

    const updatedProfile = {...currentProfile};

    // Sync level pack purchases
    const purchasedLevels = new Set<number>(currentProfile.purchasedLevels);

    if (customerInfo.entitlements.active['level_pack_2']) {
      // Add levels 21-40
      for (let i = 21; i <= 40; i++) {
        purchasedLevels.add(i);
      }
    }

    if (customerInfo.entitlements.active['level_pack_3']) {
      // Add levels 41-60
      for (let i = 41; i <= 60; i++) {
        purchasedLevels.add(i);
      }
    }

    updatedProfile.purchasedLevels = Array.from(purchasedLevels).sort(
      (a, b) => a - b,
    );

    // Sync premium status
    updatedProfile.hasPremium = isPremiumActive(customerInfo);

    console.log('Synced purchases with RevenueCat:', {
      purchasedLevels: updatedProfile.purchasedLevels.length,
      hasPremium: updatedProfile.hasPremium,
    });

    return updatedProfile;
  } catch (error) {
    console.error('Error syncing purchases:', error);
    // Return original profile if sync fails
    return currentProfile;
  }
}
