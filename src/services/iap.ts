import {
  initConnection,
  endConnection,
  getProducts,
  requestPurchase,
  purchaseUpdatedListener,
  purchaseErrorListener,
  finishTransaction,
  Product,
  Purchase,
} from 'react-native-iap';
import {IAP_PRODUCTS} from '@/config/constants';

let purchaseUpdateSubscription: any;
let purchaseErrorSubscription: any;

/**
 * In-App Purchase Service
 */
export const IAPService = {
  /**
   * Initialize IAP connection
   */
  async initialize(): Promise<void> {
    try {
      await initConnection();
      console.log('IAP connection initialized');

      // Set up purchase listeners
      purchaseUpdateSubscription = purchaseUpdatedListener(
        async (purchase: Purchase) => {
          const receipt = purchase.transactionReceipt;
          if (receipt) {
            try {
              // Acknowledge the purchase
              await finishTransaction({purchase});
              console.log('Purchase acknowledged:', purchase.productId);

              // Handle the purchase (unlock content, etc.)
              this.handlePurchaseSuccess(purchase);
            } catch (error) {
              console.error('Error finishing transaction:', error);
            }
          }
        },
      );

      purchaseErrorSubscription = purchaseErrorListener((error: any) => {
        console.error('Purchase error:', error);
        this.handlePurchaseError(error);
      });
    } catch (error) {
      console.error('Error initializing IAP:', error);
      throw error;
    }
  },

  /**
   * Clean up IAP connection
   */
  async cleanup(): Promise<void> {
    try {
      if (purchaseUpdateSubscription) {
        purchaseUpdateSubscription.remove();
      }
      if (purchaseErrorSubscription) {
        purchaseErrorSubscription.remove();
      }
      await endConnection();
      console.log('IAP connection closed');
    } catch (error) {
      console.error('Error cleaning up IAP:', error);
    }
  },

  /**
   * Get available products
   */
  async getAvailableProducts(): Promise<Product[]> {
    try {
      const productIds = Object.values(IAP_PRODUCTS);
      const products = await getProducts({skus: productIds});
      return products;
    } catch (error) {
      console.error('Error getting products:', error);
      return [];
    }
  },

  /**
   * Purchase a product
   */
  async purchaseProduct(productId: string): Promise<void> {
    try {
      await requestPurchase({sku: productId});
    } catch (error) {
      console.error('Error purchasing product:', error);
      throw error;
    }
  },

  /**
   * Handle successful purchase
   */
  handlePurchaseSuccess(purchase: Purchase): void {
    // This would be handled by the app's state management
    console.log('Purchase successful:', purchase.productId);

    // You can emit an event here or call a callback
    if (this.onPurchaseSuccess) {
      this.onPurchaseSuccess(purchase.productId);
    }
  },

  /**
   * Handle purchase error
   */
  handlePurchaseError(error: any): void {
    // This would be handled by the app's error handling
    console.error('Purchase failed:', error);

    if (this.onPurchaseError) {
      this.onPurchaseError(error);
    }
  },

  // Callbacks (set by the app)
  onPurchaseSuccess: null as ((productId: string) => void) | null,
  onPurchaseError: null as ((error: any) => void) | null,
};

/**
 * Helper to check if a level pack is purchased
 */
export function isLevelPackPurchased(
  packId: string,
  purchasedProducts: string[],
): boolean {
  return purchasedProducts.includes(packId);
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
