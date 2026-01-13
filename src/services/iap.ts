import {Platform} from 'react-native';
import type {
  PurchasesOffering,
  PurchasesPackage,
  CustomerInfo,
} from 'react-native-purchases';
import Constants from 'expo-constants';
import {IAP_PRODUCTS} from '@/config/constants';
import type {UserProfile} from '@/types/game';
import {RevenueCatError, RevenueCatErrorCode} from './RevenueCatError';

/**
 * Check if RevenueCat native module is available
 * Returns false when running in Expo Go (which doesn't include native modules)
 */
function isNativeModuleAvailable(): boolean {
  try {
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
 * Validate RevenueCat API key format
 */
function validateApiKey(apiKey: string | undefined): boolean {
  if (!apiKey || apiKey.length < 10) {
    return false;
  }

  // Basic format validation - should be alphanumeric with some special chars
  const validFormat = /^[a-zA-Z0-9_]{10,}$/;
  return validFormat.test(apiKey);
}

/**
 * RevenueCat IAP Service for Expo
 * Works with both iOS and Android
 * API keys are loaded from secure environment variables via app.config.js
 * Gracefully handles Expo Go (where native module is not available)
 * Provides robust error handling with user-friendly messages
 */
export const IAPService = {
  isAvailable: isNativeModuleAvailable(),

  /**
   * Initialize RevenueCat with platform-specific API key from environment
   * Validates API key format before attempting configuration
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
      const apiKey =
        Platform.OS === 'ios'
          ? Constants.expoConfig?.extra?.revenueCat?.iosApiKey
          : Constants.expoConfig?.extra?.revenueCat?.androidApiKey;

      // Validate API key format before using it
      if (!validateApiKey(apiKey)) {
        throw new RevenueCatError(
          RevenueCatErrorCode.API_KEY_INVALID,
          `Invalid RevenueCat API key format for ${Platform.OS}. Key should be 10+ characters and alphanumeric.`,
        );
      }

      if (!apiKey) {
        throw new RevenueCatError(
          RevenueCatErrorCode.API_KEY_INVALID,
          `RevenueCat API key not found for ${Platform.OS}. Please check your environment variables and app.config.js`,
        );
      }

      await Purchases.configure({apiKey});
      Purchases.setDebugLogsEnabled(__DEV__);
      console.log('RevenueCat initialized for', Platform.OS);
    } catch (error) {
      console.error('Error initializing RevenueCat:', error);
      throw new RevenueCatError(
        RevenueCatErrorCode.SERVER_ERROR,
        'Failed to initialize RevenueCat. Please check your internet connection.',
      );
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
    } catch (error: any) {
      console.error('Error getting offerings:', error);

      // Provide user-friendly error message
      const errorMessage =
        error.code === 'NETWORK_ERROR' || error.code === 'INTERNET_ERROR'
          ? 'Please check your internet connection and try again.'
          : 'Unable to load purchase options. Please try again later.';

      throw new RevenueCatError(
        RevenueCatErrorCode.NETWORK_ERROR,
        errorMessage,
      );
    }
  },

  /**
   * Purchase a package
   * Added purchase verification to ensure transaction completed successfully
   */
  async purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo> {
    if (!this.isAvailable) {
      throw new RevenueCatError(
        RevenueCatErrorCode.PRODUCT_NOT_FOUND,
        'RevenueCat not available - build a development client to test purchases',
      );
    }

    const Purchases = getPurchases();
    if (!Purchases) {
      throw new RevenueCatError(
        RevenueCatErrorCode.PRODUCT_NOT_FOUND,
        'RevenueCat module not found',
      );
    }

    try {
      console.log(`[IAP] Starting purchase for package: ${pkg.identifier}`);

      const {customerInfo} = await Purchases.purchasePackage(pkg);

      // Verify purchase actually succeeded
      if (!customerInfo || customerInfo.error) {
        throw new RevenueCatError(
          RevenueCatErrorCode.PURCHASE_FAILED,
          'Purchase did not complete. Please try again.',
        );
      }

      console.log('[IAP] Purchase successful:', {
        packageId: pkg.identifier,
        customerInfo,
      });

      if (this.onPurchaseSuccess) {
        this.onPurchaseSuccess(customerInfo);
      }

      return customerInfo;
    } catch (error: any) {
      console.error('[IAP] Error purchasing package:', {
        message: error?.message || 'No message',
        code: error?.code || 'No code',
        name: error?.name || 'No name',
        stack: error?.stack || 'No stack',
        fullError: JSON.stringify(error, Object.getOwnPropertyNames(error)),
      });

      if (this.onPurchaseError) {
        this.onPurchaseError(error);
      }

      // Provide user-friendly error messages
      const userMessage =
        error.code === 'NETWORK_ERROR' || error.code === 'INTERNET_ERROR'
          ? 'Please check your internet connection and try again.'
          : error.code === 'USER_CANCELLED'
            ? 'Purchase was cancelled. You can try again anytime.'
            : 'An unexpected error occurred. Please try again later.';

      throw new RevenueCatError(
        error.code === 'NETWORK_ERROR'
          ? RevenueCatErrorCode.NETWORK_ERROR
          : error.code === 'USER_CANCELLED'
            ? RevenueCatErrorCode.PURCHASE_FAILED
            : RevenueCatErrorCode.SERVER_ERROR,
        userMessage,
      );
    }
  },

  /**
   * Restore purchases
   */
  async restorePurchases(): Promise<CustomerInfo> {
    if (!this.isAvailable) {
      throw new RevenueCatError(
        RevenueCatErrorCode.PRODUCT_NOT_FOUND,
        'RevenueCat not available - build a development client to restore purchases',
      );
    }

    const Purchases = getPurchases();
    if (!Purchases) {
      throw new RevenueCatError(
        RevenueCatErrorCode.PRODUCT_NOT_FOUND,
        'RevenueCat module not found',
      );
    }

    try {
      const customerInfo = await Purchases.restorePurchases();

      // Verify restore actually succeeded
      if (!customerInfo || customerInfo.error) {
        throw new RevenueCatError(
          RevenueCatErrorCode.PURCHASE_FAILED,
          'Restore did not complete. Please try again.',
        );
      }

      console.log('[IAP] Restore successful:', customerInfo);
      return customerInfo;
    } catch (error: any) {
      console.error('[IAP] Error restoring purchases:', {
        message: error?.message || 'No message',
        code: error?.code || 'No code',
        name: error?.name || 'No name',
        stack: error?.stack || 'No stack',
        fullError: JSON.stringify(error, Object.getOwnPropertyNames(error)),
      });

      const userMessage =
        error.code === 'NETWORK_ERROR' || error.code === 'INTERNET_ERROR'
          ? 'Please check your internet connection and try again.'
          : 'Could not restore purchases. Please try again later.';

      throw new RevenueCatError(
        error.code === 'NETWORK_ERROR'
          ? RevenueCatErrorCode.NETWORK_ERROR
          : RevenueCatErrorCode.SERVER_ERROR,
        userMessage,
      );
    }
  },

  /**
   * Get customer info
   */
  async getCustomerInfo(): Promise<CustomerInfo> {
    if (!this.isAvailable) {
      throw new RevenueCatError(
        RevenueCatErrorCode.PRODUCT_NOT_FOUND,
        'RevenueCat not available',
      );
    }

    const Purchases = getPurchases();
    if (!Purchases) {
      throw new RevenueCatError(
        RevenueCatErrorCode.PRODUCT_NOT_FOUND,
        'RevenueCat module not found',
      );
    }

    try {
      const customerInfo = await Purchases.getCustomerInfo();

      if (!customerInfo) {
        throw new RevenueCatError(
          RevenueCatErrorCode.SERVER_ERROR,
          'Could not retrieve customer information.',
        );
      }

      return customerInfo;
    } catch (error: any) {
      console.error('[IAP] Error getting customer info:', {
        message: error?.message || 'No message',
        code: error?.code || 'No code',
        name: error?.name || 'No name',
        stack: error?.stack || 'No stack',
        fullError: JSON.stringify(error, Object.getOwnPropertyNames(error)),
      });

      throw new RevenueCatError(
        RevenueCatErrorCode.SERVER_ERROR,
        'Could not retrieve customer information. Please try again later.',
      );
    }
  },

  /**
   * Purchase a product by product ID
   * Uses RevenueCat offerings to get current pricing
   * No more hardcoded prices - uses live RevenueCat pricing
   */
  async purchaseProduct(productId: string): Promise<CustomerInfo> {
    if (!this.isAvailable) {
      throw new RevenueCatError(
        RevenueCatErrorCode.PRODUCT_NOT_FOUND,
        'RevenueCat not available - build a development client to test purchases',
      );
    }

    const Purchases = getPurchases();
    if (!Purchases) {
      throw new RevenueCatError(
        RevenueCatErrorCode.PRODUCT_NOT_FOUND,
        'RevenueCat module not found',
      );
    }

    try {
      const offering = await this.getOfferings();

      if (!offering) {
        throw new RevenueCatError(
          RevenueCatErrorCode.PRODUCT_NOT_FOUND,
          'Unable to load purchase options. Please try again later.',
        );
      }

      // Find package with matching product identifier
      const pkg = offering.availablePackages.find(
        p => p.productIdentifier === productId,
      );

      if (!pkg) {
        throw new RevenueCatError(
          RevenueCatErrorCode.PRODUCT_NOT_FOUND,
          `Product ${productId} not found in RevenueCat offerings`,
        );
      }

      // Use type assertion to access price property safely
      const price =
        (pkg as any).oneTimePurchasePrice || (pkg as any).product?.price;
      console.log(
        `[IAP] Found package: ${productId} with price: ${price?.amount}`,
      );

      return await this.purchasePackage(pkg);
    } catch (error: any) {
      console.error('[IAP] Error purchasing product:', {
        message: error?.message || 'No message',
        code: error?.code || 'No code',
        name: error?.name || 'No name',
        stack: error?.stack || 'No stack',
        fullError: JSON.stringify(error, Object.getOwnPropertyNames(error)),
      });

      const userMessage =
        error.code === 'NETWORK_ERROR' || error.code === 'INTERNET_ERROR'
          ? 'Please check your internet connection and try again.'
          : 'Could not complete purchase. Please try again later.';

      throw new RevenueCatError(
        error.code === 'NETWORK_ERROR'
          ? RevenueCatErrorCode.NETWORK_ERROR
          : RevenueCatErrorCode.SERVER_ERROR,
        userMessage,
      );
    }
  },

  /**
   * Cleanup RevenueCat resources
   */
  cleanup(): void {
    this.onPurchaseSuccess = null;
    this.onPurchaseError = null;
  },

  /**
   * Callbacks (set by app)
   */
  onPurchaseSuccess: null as ((customerInfo: CustomerInfo) => void) | null,
  onPurchaseError: null as ((error: any) => void) | null,
};
