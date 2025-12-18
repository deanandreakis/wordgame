import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {GAME_CONFIG, IAP_PRODUCTS, COIN_AMOUNTS, IAP_PRICING} from '@/config/constants';
import {IAPService, isPremiumActive} from '@/services/iap';
import {getUserProfile} from '@/utils/storage';
import {UserProfile} from '@/types/game';
import type {
  PurchasesOffering,
  PurchasesPackage,
} from 'react-native-purchases';

interface Props {
  onBack: () => void;
  userProfile: UserProfile | null;
}

export const ShopScreen: React.FC<Props> = ({onBack, userProfile}) => {
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    try {
      setLoading(true);
      const currentOffering = await IAPService.getOfferings();
      setOffering(currentOffering);
    } catch (error) {
      console.error('Error loading offerings:', error);
      Alert.alert('Error', 'Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (pkg: PurchasesPackage) => {
    try {
      setPurchasing(true);
      await IAPService.purchasePackage(pkg);
      Alert.alert('Success!', 'Purchase completed successfully!');
    } catch (error: any) {
      if (error.code !== 'USER_CANCELLED') {
        Alert.alert('Purchase Failed', error.message || 'Please try again.');
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    try {
      setPurchasing(true);
      const customerInfo = await IAPService.restorePurchases();

      // Trigger the purchase success callback to sync
      if (IAPService.onPurchaseSuccess) {
        IAPService.onPurchaseSuccess(customerInfo);
      }

      Alert.alert(
        'Restore Complete',
        'Your purchases have been restored successfully!',
      );
    } catch (error: any) {
      Alert.alert('Restore Failed', error.message || 'Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const findPackage = (productId: string): PurchasesPackage | undefined => {
    return offering?.availablePackages.find(
      pkg => pkg.product.identifier === productId,
    );
  };

  const formatPrice = (productId: string | undefined, pkg?: PurchasesPackage | undefined): string => {
    if (!productId) return '$?.??';
    // Use static pricing from IAP_PRICING config
    return IAP_PRICING[productId as keyof typeof IAP_PRICING] || (pkg?.product.priceString ?? '$?.??');
  };

  const hasPremium = userProfile?.hasPremium ?? false;

  const coinPackages = [
    {
      productId: IAP_PRODUCTS.COINS_SMALL,
      amount: COIN_AMOUNTS.SMALL,
      badge: null,
    },
    {
      productId: IAP_PRODUCTS.COINS_MEDIUM,
      amount: COIN_AMOUNTS.MEDIUM,
      badge: null,
    },
    {
      productId: IAP_PRODUCTS.COINS_LARGE,
      amount: COIN_AMOUNTS.LARGE,
      badge: 'Best Value',
    },
  ];

  const levelPackages = [
    {productId: IAP_PRODUCTS.LEVEL_PACK_1, levels: '1-20'},
    {productId: IAP_PRODUCTS.LEVEL_PACK_2, levels: '21-40'},
    {productId: IAP_PRODUCTS.LEVEL_PACK_3, levels: '41-60'},
  ];

  if (loading) {
    return (
      <LinearGradient
        colors={[
          GAME_CONFIG.COLORS.background,
          GAME_CONFIG.COLORS.backgroundLight,
        ]}
        style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ActivityIndicator size="large" color={GAME_CONFIG.COLORS.primary} />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[
        GAME_CONFIG.COLORS.background,
        GAME_CONFIG.COLORS.backgroundLight,
      ]}
      style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Shop</Text>
          <View style={styles.coinBalance}>
            <Text style={styles.coinIcon}>🪙</Text>
            <Text style={styles.coinText}>{userProfile?.coins ?? 0}</Text>
          </View>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Premium Card */}
          {!hasPremium && (
            <View style={styles.section}>
              <LinearGradient
                colors={[GAME_CONFIG.COLORS.gradient1, GAME_CONFIG.COLORS.gradient2]}
                style={styles.premiumCard}>
                <Text style={styles.premiumBadge}>⭐ PREMIUM</Text>
                <Text style={styles.premiumTitle}>Premium Unlock</Text>
                <Text style={styles.premiumDescription}>
                  • Double coin rewards from gameplay{'\n'}
                  • Unlock all levels instantly
                </Text>
                <TouchableOpacity
                  style={styles.premiumButton}
                  onPress={() => {
                    const pkg = findPackage(IAP_PRODUCTS.PREMIUM_UNLOCK);
                    if (pkg) handlePurchase(pkg);
                  }}
                  disabled={purchasing}>
                  <Text style={styles.premiumButtonText}>
                    {formatPrice(IAP_PRODUCTS.PREMIUM_UNLOCK)}
                  </Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          )}

          {hasPremium && (
            <View style={styles.section}>
              <LinearGradient
                colors={[GAME_CONFIG.COLORS.success, GAME_CONFIG.COLORS.glowGreen]}
                style={styles.premiumCard}>
                <Text style={styles.premiumBadge}>👑 PREMIUM ACTIVE</Text>
                <Text style={styles.premiumTitle}>You're a Premium Member!</Text>
                <Text style={styles.premiumDescription}>
                  Thank you for your support!{'\n'}
                  Enjoy ad-free gameplay and 2x coin rewards.
                </Text>
              </LinearGradient>
            </View>
          )}

          {/* Coin Packs */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🪙 Coin Packs</Text>
            <View style={styles.grid}>
              {coinPackages.map(item => {
                const pkg = findPackage(item.productId);
                return (
                  <View key={item.productId} style={styles.productCard}>
                    <LinearGradient
                      colors={[GAME_CONFIG.COLORS.cardBg, GAME_CONFIG.COLORS.tile]}
                      style={styles.productGradient}>
                      {item.badge && (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>{item.badge}</Text>
                        </View>
                      )}
                      <Text style={styles.productIcon}>🪙</Text>
                      <Text style={styles.productAmount}>{item.amount}</Text>
                      <Text style={styles.productLabel}>Coins</Text>
                      <TouchableOpacity
                        style={styles.buyButton}
                        onPress={() => pkg && handlePurchase(pkg)}
                        disabled={purchasing || !pkg}>
                        <LinearGradient
                          colors={[GAME_CONFIG.COLORS.primary, GAME_CONFIG.COLORS.secondary]}
                          style={styles.buyButtonGradient}>
                          <Text style={styles.buyButtonText}>
                            {formatPrice(item.productId, pkg)}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </LinearGradient>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Level Packs */}
          {!hasPremium && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📚 Level Packs</Text>
              <View style={styles.grid}>
                {levelPackages.map(item => {
                  const pkg = findPackage(item.productId);
                  const packNumber = item.productId === IAP_PRODUCTS.LEVEL_PACK_1 ? 1 : item.productId === IAP_PRODUCTS.LEVEL_PACK_2 ? 2 : 3;
                  const isOwned = userProfile?.purchasedLevels?.some(
                    level => level >= (packNumber - 1) * 20 + 1 && level <= packNumber * 20
                  );

                  return (
                    <View key={item.productId} style={styles.productCard}>
                      <LinearGradient
                        colors={[GAME_CONFIG.COLORS.cardBg, GAME_CONFIG.COLORS.tile]}
                        style={styles.productGradient}>
                        {isOwned && (
                          <View style={styles.ownedBadge}>
                            <Text style={styles.ownedBadgeText}>✓ Owned</Text>
                          </View>
                        )}
                        <Text style={styles.productIcon}>📚</Text>
                        <Text style={styles.productTitle}>Level Pack {packNumber}</Text>
                        <Text style={styles.productSubtitle}>Levels {item.levels}</Text>
                        <Text style={styles.productDetail}>20 challenging levels</Text>
                        <TouchableOpacity
                          style={styles.buyButton}
                          onPress={() => pkg && handlePurchase(pkg)}
                          disabled={purchasing || !pkg || isOwned}>
                          <LinearGradient
                            colors={
                              isOwned
                                ? [GAME_CONFIG.COLORS.textSecondary, GAME_CONFIG.COLORS.textSecondary]
                                : [GAME_CONFIG.COLORS.primary, GAME_CONFIG.COLORS.secondary]
                            }
                            style={styles.buyButtonGradient}>
                            <Text style={styles.buyButtonText}>
                              {isOwned ? 'Owned' : formatPrice(item.productId, pkg)}
                            </Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      </LinearGradient>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Restore Button */}
          <TouchableOpacity
            style={styles.restoreButton}
            onPress={handleRestore}
            disabled={purchasing}>
            <Text style={styles.restoreButtonText}>
              Restore Purchases
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {purchasing && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={GAME_CONFIG.COLORS.primary} />
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(111, 216, 142, 0.15)',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: GAME_CONFIG.COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: GAME_CONFIG.COLORS.text,
  },
  coinBalance: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GAME_CONFIG.COLORS.cardBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  coinIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  coinText: {
    color: GAME_CONFIG.COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: GAME_CONFIG.COLORS.text,
    marginBottom: 12,
  },
  premiumCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  premiumBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    color: GAME_CONFIG.COLORS.text,
    backgroundColor: 'rgba(111, 216, 142, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  premiumTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: GAME_CONFIG.COLORS.text,
    marginBottom: 12,
  },
  premiumDescription: {
    fontSize: 14,
    color: GAME_CONFIG.COLORS.text,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  premiumButton: {
    width: '100%',
  },
  premiumButtonText: {
    backgroundColor: GAME_CONFIG.COLORS.text,
    color: GAME_CONFIG.COLORS.primary,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  productCard: {
    width: '50%',
    padding: 6,
  },
  productGradient: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minHeight: 180,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: GAME_CONFIG.COLORS.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: GAME_CONFIG.COLORS.text,
    fontSize: 10,
    fontWeight: 'bold',
  },
  ownedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: GAME_CONFIG.COLORS.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ownedBadgeText: {
    color: GAME_CONFIG.COLORS.text,
    fontSize: 10,
    fontWeight: 'bold',
  },
  productIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  productAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: GAME_CONFIG.COLORS.text,
  },
  productLabel: {
    fontSize: 12,
    color: GAME_CONFIG.COLORS.textSecondary,
    marginBottom: 12,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: GAME_CONFIG.COLORS.text,
    marginBottom: 4,
  },
  productSubtitle: {
    fontSize: 14,
    color: GAME_CONFIG.COLORS.textSecondary,
    marginBottom: 2,
  },
  productDetail: {
    fontSize: 12,
    color: GAME_CONFIG.COLORS.textSecondary,
    marginBottom: 12,
  },
  buyButton: {
    width: '100%',
    marginTop: 'auto',
  },
  buyButtonGradient: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buyButtonText: {
    color: GAME_CONFIG.COLORS.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  restoreButton: {
    marginTop: 8,
    marginBottom: 24,
    padding: 16,
    backgroundColor: 'rgba(111, 216, 142, 0.15)',
    borderRadius: 12,
    alignItems: 'center',
  },
  restoreButtonText: {
    color: GAME_CONFIG.COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(13, 31, 18, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
