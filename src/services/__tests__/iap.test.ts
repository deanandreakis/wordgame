import {IAPService, isLevelPackPurchased, getLevelPackProductId} from '../iap';
import {IAP_PRODUCTS} from '@/config/constants';

// Note: These tests use the mocked react-native-iap from jest.setup.js

describe('IAPService', () => {
  describe('initialize', () => {
    it('should initialize without error', async () => {
      await expect(IAPService.initialize()).resolves.not.toThrow();
    });
  });

  describe('cleanup', () => {
    it('should cleanup without error', async () => {
      await expect(IAPService.cleanup()).resolves.not.toThrow();
    });
  });

  describe('getAvailableProducts', () => {
    it('should return an array', async () => {
      const products = await IAPService.getAvailableProducts();
      expect(Array.isArray(products)).toBe(true);
    });
  });

  describe('purchaseProduct', () => {
    it('should initiate purchase', async () => {
      await expect(
        IAPService.purchaseProduct(IAP_PRODUCTS.LEVEL_PACK_1),
      ).resolves.not.toThrow();
    });
  });

  describe('callbacks', () => {
    it('should call onPurchaseSuccess when set', () => {
      const mockCallback = jest.fn();
      IAPService.onPurchaseSuccess = mockCallback;
      IAPService.handlePurchaseSuccess({productId: 'test'} as any);
      expect(mockCallback).toHaveBeenCalledWith('test');
    });

    it('should call onPurchaseError when set', () => {
      const mockCallback = jest.fn();
      IAPService.onPurchaseError = mockCallback;
      const error = new Error('Test error');
      IAPService.handlePurchaseError(error);
      expect(mockCallback).toHaveBeenCalledWith(error);
    });
  });
});

describe('isLevelPackPurchased', () => {
  it('should return true if pack is purchased', () => {
    const purchased = ['pack1', 'pack2'];
    expect(isLevelPackPurchased('pack1', purchased)).toBe(true);
  });

  it('should return false if pack is not purchased', () => {
    const purchased = ['pack1'];
    expect(isLevelPackPurchased('pack2', purchased)).toBe(false);
  });

  it('should handle empty purchased array', () => {
    expect(isLevelPackPurchased('pack1', [])).toBe(false);
  });
});

describe('getLevelPackProductId', () => {
  it('should return correct product ID for pack 1', () => {
    expect(getLevelPackProductId(1)).toBe(IAP_PRODUCTS.LEVEL_PACK_1);
  });

  it('should return correct product ID for pack 2', () => {
    expect(getLevelPackProductId(2)).toBe(IAP_PRODUCTS.LEVEL_PACK_2);
  });

  it('should return correct product ID for pack 3', () => {
    expect(getLevelPackProductId(3)).toBe(IAP_PRODUCTS.LEVEL_PACK_3);
  });

  it('should default to pack 1 for invalid pack numbers', () => {
    expect(getLevelPackProductId(99)).toBe(IAP_PRODUCTS.LEVEL_PACK_1);
  });
});
