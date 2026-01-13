# 🧪 RevenueCat Testing Plan

## 📋 Overview

Comprehensive testing strategy for LetterLoom's RevenueCat IAP integration to ensure production readiness.

---

## 🎯 Success Criteria

**Production Launch Requires:**

- ✅ All purchase flows complete successfully
- ✅ Error messages are user-friendly
- ✅ No app crashes during any test
- ✅ Purchases persist across app restarts
- ✅ Restores work correctly
- ✅ Entitlements granted immediately after purchase
- ✅ Network errors handled gracefully
- ✅ Cancelled purchases handled gracefully

---

## 📅 Phase 1: RevenueCat Dashboard Setup (1-2 hours)

### 1.1 Create Sandbox Products

- [ ] Login to RevenueCat: https://app.revenuecat.com
- [ ] Navigate to Products: Dashboard > Products
- [ ] Create test products matching code:
  - `com.letterloom.levels.pack1` - Level Pack 1 ($2.99)
  - `com.letterloom.levels.pack2` - Level Pack 2 ($2.99)
  - `com.letterloom.levels.pack3` - Level Pack 3 ($2.99)
  - `com.letterloom.coins.small` - 250 coins ($0.99)
  - `com.letterloom.coins.medium` - 1000 coins ($2.99)
  - `com.letterloom.coins.large` - 3000 coins ($7.99)
  - `com.letterloom.premium.unlock` - Premium unlock ($9.99)

### 1.2 Get Sandbox API Keys

- [ ] Navigate to Settings: Dashboard > Settings > API Keys
- [ ] Note current keys (or create sandbox-specific ones)
- [ ] Add to .env file:

```bash
REVENUECAT_IOS_API_KEY=sandbox_ios_key_here
REVENUECAT_ANDROID_API_KEY=sandbox_android_key_here
```

### 1.3 Configure App Store Products

- [ ] Login to App Store Connect: https://appstoreconnect.apple.com
- [ ] Create identical product IDs matching RevenueCat setup
- [ ] Upload screenshots for each IAP product
- [ ] Submit for review (takes 1-3 days)

---

## 📅 Phase 2: Local Testing Environment (30 minutes)

### 2.1 Build Development Client

```bash
# Build with sandbox configuration
npm run ios

# Or via GitHub Actions:
# Trigger workflow with "adhoc" build type
```

### 2.2 Install Test Build

- [ ] Delete old app first from device
- [ ] Install new IPA from GitHub Actions artifacts
- [ ] Grant app permissions (GameCenter, Notifications)
- [ ] Login to GameCenter with your sandbox test account

### 2.3 Enable Debug Logging

**In your app code, ensure:**

```typescript
// In constants.ts - should already be set:
SHOW_DEBUG_LOGS: (true,
  // In IAP service - verify debug logs are on:
  Purchases.setDebugLogsEnabled(__DEV__));
```

---

## 📅 Phase 3: Purchase Flow Testing (2-3 hours)

### 3.1 Basic Purchase Test

**Test Case**: Purchase level pack

**Manual Steps:**

1. Navigate to ShopScreen
2. Tap "Level Pack 1 - $2.99"
3. Verify price matches RevenueCat dashboard
4. Complete Apple purchase flow (Face ID/passcode)
5. Wait for purchase completion
6. Check console logs for success message
7. Verify level pack unlocks in app
8. Check UserProfile.purchasedLevels includes levels 21-40
9. Restart app and verify purchase persists

**Expected Console Output:**

```
[IAP] Found package: com.letterloom.levels.pack1 with price: 2.99
[IAP] Starting purchase for package: com.letterloom.levels.pack1
[IAP] Purchase successful: {packageId: '...', customerInfo: {...}}
```

**Verification Checklist:**

- [ ] Price matches RevenueCat dashboard
- [ ] Purchase completes without crashes
- [ ] Levels 21-40 unlock immediately
- [ ] Profile saves automatically
- [ ] Purchase persists after app restart
- [ ] Console shows clear success messages

### 3.2 Coin Purchase Test

**Test Case**: Purchase coin bundle

**Manual Steps:**

1. Navigate to ShopScreen
2. Tap "250 Coins - $0.99"
3. Complete Apple purchase
4. Verify coins increase in app
5. Check UserProfile.coins balance updated
6. Test spending coins (purchase hints, etc.)

**Expected Behavior:**

- Coins balance increases by 250
- Purchase completes without crashes
- Profile saves immediately
- Coin spending works
- Balance displays correctly in ShopScreen

**Verification Checklist:**

- [ ] Coins balance increases correctly
- [ ] No delay between purchase and availability
- [ ] Coin spending works properly
- [ ] Balance updates in real-time
- [ ] Multiple purchases work correctly

### 3.3 Premium Unlock Test

**Test Case**: Purchase premium unlock

**Manual Steps:**

1. Navigate to ShopScreen
2. Tap "Premium Unlock - $9.99"
3. Complete Apple purchase
4. Verify premium status enabled
5. Check all premium features unlock

**Expected Behavior:**

- UserProfile.hasPremium = true
- All premium features accessible
- Premium badge shows in UI
- No price display for premium items
- All ads removed (if implemented)

**Verification Checklist:**

- [ ] Premium status enables immediately
- [ ] All premium features accessible
- [ ] UI updates to show premium status
- [ ] No crashes during purchase
- [ ] Purchase persists after app restart

---

## 📅 Phase 4: Error Case Testing (1-2 hours)

### 4.1 Network Failure Test

**Test Case**: Purchase without internet

**Manual Steps:**

1. Enable Airplane Mode on device
2. Attempt to purchase any item
3. Verify user-friendly error message appears
4. Verify app doesn't crash

**Expected Error Message:**
"Please check your internet connection and try again."

**Console Output:**

```
[IAP] Error purchasing package: {...code: 'NETWORK_ERROR'...}
```

**Verification Checklist:**

- [ ] Error message is clear and helpful
- [ ] No app crash or freeze
- [ ] User can try again after fixing connection
- [ ] Error appears in appropriate UI location

### 4.2 Cancelled Purchase Test

**Test Case**: User cancels mid-purchase

**Manual Steps:**

1. Start purchase flow
2. Cancel in Apple's native sheet (press outside area)
3. Verify graceful error handling

**Expected Behavior:**

- App shows "Purchase was cancelled" message
- No crash or freezing
- User can try again

**Console Output:**

```
[IAP] Error purchasing package: {...code: 'USER_CANCELLED'...}
```

**Verification Checklist:**

- [ ] Cancel handled gracefully
- [ ] App doesn't crash or freeze
- [ ] User can attempt purchase again
- [ ] No confusing error messages
- [ ] Return to normal app state

### 4.3 Invalid API Key Test

**Test Case**: Malformed API key

**Manual Steps:**

1. Temporarily modify .env:

```bash
REVENUECAT_IOS_API_KEY=invalid
```

2. Restart app
3. Attempt purchase
4. Verify error message

**Expected Behavior:**

- App shows "Invalid RevenueCat API key format"
- Clear guidance on what's wrong
- No crash

**Console Output:**

```
[RevenueCat] Invalid RevenueCat API key format for ios...
```

**Verification Checklist:**

- [ ] API key validation works correctly
- [ ] Clear error message shown to user
- [ ] No crash on invalid key
- [ ] Guidance on how to fix the issue

### 4.4 Purchase Verification Test

**Test Case**: Ensure entitlements actually granted

**Manual Steps:**

1. Purchase level pack
2. Immediately check UserProfile.purchasedLevels
3. Try to access levels 21-40
4. Verify they're unlocked

**Expected Behavior:**

- Levels 21-40 unlock immediately
- No delay between purchase and access
- Entitlement verification passes
- Purchase is recorded in profile

**Verification Checklist:**

- [ ] Entitlements granted immediately
- [ ] No delay between purchase and unlock
- [ ] Purchase verification succeeds
- [ ] User can access content immediately
- [ ] Profile updates correctly

---

## 📅 Phase 5: Restore & Multi-Device Testing (1-2 hours)

### 5.1 Restore Purchases Test

**Test Case**: Restore previous purchases

**Manual Steps:**

1. Delete app from device
2. Reinstall app
3. Navigate to ShopScreen
4. Tap "Restore Purchases"
5. Verify previous purchases appear
6. Check UserProfile updates

**Expected Behavior:**

- All previous purchases restored
- Levels, coins, premium status all back
- Console shows "[IAP] Restore successful"
- No crashes or errors

**Verification Checklist:**

- [ ] All previous purchases restored
- [ ] Levels, coins, premium status correct
- [ ] Console shows restore success
- [ ] Profile updates properly
- [ ] No missing purchases
- [ ] No duplicate purchases

### 5.2 Multiple Device Test

**Test Case**: Purchase on device A, verify on device B

**Manual Steps:**

1. Install app on device A (logged into GameCenter)
2. Purchase level pack
3. Login to GameCenter on device B (same account)
4. Install app on device B
5. Verify purchase shows on device B

**Expected Behavior:**

- Purchase syncs across devices (requires iCloud sync)
- Both devices show purchased items
- No purchase duplication
- Entitlements work on both devices

**Verification Checklist:**

- [ ] Purchase appears on device B
- [ ] No duplicate charges
- [ ] Both devices show same items
- [ ] Cross-device synchronization works
- [ ] User accounts properly linked

---

## 📅 Phase 6: Edge Cases & Stress Testing (1-2 hours)

### 6.1 Rapid Purchases Test

**Test Case**: Quick successive purchases

**Manual Steps:**

1. Purchase level pack 1
2. Immediately purchase level pack 2
3. Purchase coins
4. Verify all purchases recorded correctly

**Expected Behavior:**

- All purchases complete successfully
- No race conditions or conflicts
- Profile updates correctly
- All items accessible

**Verification Checklist:**

- [ ] All purchases complete successfully
- [ ] No race conditions
- [ ] Profile handles rapid updates
- [ ] No missing purchases
- [ ] No payment errors
- [ ] App remains stable

### 6.2 Background/Foreground Test

**Test Case**: Purchase while app backgrounded

**Manual Steps:**

1. Start purchase flow
2. Press home button (background app)
3. Return to app (foreground)
4. Verify purchase completes or handles interruption

**Expected Behavior:**

- Purchase continues in background
- Returns gracefully to app when foregrounded
- No crashes on return
- Proper state management

**Verification Checklist:**

- [ ] Purchase completes in background
- [ ] App returns to foreground gracefully
- [ ] No crashes on state change
- [ ] Purchase status maintained
- [ ] UI updates correctly

### 6.3 Low Balance Test

**Test Case**: Purchase with insufficient funds

**Manual Steps:**

1. Ensure Apple sandbox account has limited funds
2. Attempt to purchase level pack
3. Verify Apple's "Insufficient Funds" error
4. Verify app handles this gracefully

**Expected Behavior:**

- App shows Apple's native insufficient funds error
- No app crash
- Clear message about payment issue
- User can try again when funds available

**Verification Checklist:**

- [ ] Insufficient funds handled gracefully
- [ ] No app crash
- [ ] Clear error message
- [ ] Payment gateway error shown
- [ ] User understands what happened
- [ ] App remains stable

---

## 📊 Test Tracking

### Console Log Monitoring

**During testing, watch for these specific log patterns:**

**Success indicators:**

```bash
[IAP] Found package: ...
[IAP] Purchase successful: ...
[IAP] Restore successful: ...
[RevenueCat initialized for ios
```

**Error indicators (should have user-friendly messages):**

```bash
[IAP] Error purchasing package: {...userMessage: '...'}
[RevenueCat] Invalid RevenueCat API key format...
Please check your internet connection and try again.
```

### RevenueCat Dashboard Monitoring

1. **Navigate to**: Dashboard > Events
2. **Watch for real-time events**:
   - `purchases` - Successful purchases
   - `app_transferred` - New app installations
   - `subscriber_alerts` - Subscription changes
   - `revenue_cat_error` - API errors

### Test Tracking Spreadsheet

**Create spreadsheet to track all tests:**

| Test Case             | Status | Issues Found | Date | Notes |
| --------------------- | ------ | ------------ | ---- | ----- |
| Basic Purchase        | [ ]    |              |      |       |
| Coin Purchase         | [ ]    |              |      |
| Premium Unlock        | [ ]    |              |      |
| Network Failure       | [ ]    |              |      |
| Cancelled Purchase    | [ ]    |              |      |
| Invalid API Key       | [ ]    |              |      |
| Purchase Verification | [ ]    |              |      |
| Restore Purchases     | [ ]    |              |      |
| Multiple Device Sync  | [ ]    |              |      |
| Rapid Purchases       | [ ]    |              |      |
| Background/Foreground | [ ]    |              |      |
| Insufficient Funds    | [ ]    |              |      |

---

## 🚨 Critical Success Criteria

**Production Launch Requires:**

- ✅ All purchase flows complete successfully
- ✅ Error messages are user-friendly
- ✅ No app crashes during any test
- ✅ Purchases persist across app restarts
- ✅ Restores work correctly
- ✅ Entitlements granted immediately after purchase
- ✅ Network errors handled gracefully
- ✅ Cancelled purchases handled gracefully

**Optional but Recommended:**

- ✅ Cross-device sync working (iCloud)
- ✅ Performance < 2 seconds for purchase completion
- ✅ No memory leaks during purchases
- ✅ Clean revenue tracking in dashboard

---

## 📝 Notes & Observations

**Add your own notes during testing:**

### Issues Found:

- Record any bugs or unexpected behavior
- Note any edge cases not covered
- Document performance issues
- Track user experience problems

### Improvements Needed:

- Error handling adjustments
- UI/UX improvements
- Performance optimizations
- Additional test cases

### Production Decision:

- Ready to launch: [ ] Yes/No
- Remaining issues: [ ] None/Describe
- Launch date target: [ ] Date

---

## 🎯 Next Steps After Testing

**If All Tests Pass:**

1. Update app version number
2. Prepare App Store submission
3. Create marketing screenshots
4. Write release notes
5. Schedule launch date

**If Issues Found:**

1. Prioritize by severity
2. Fix critical issues first
3. Re-test failed scenarios
4. Document workarounds
5. Consider phased release

---

**Testing Progress:**

- Phase 1 (Dashboard Setup): [ ] 0%
- Phase 2 (Environment Prep): [ ] 0%
- Phase 3 (Purchase Flows): [ ] 0%
- Phase 4 (Error Cases): [ ] 0%
- Phase 5 (Restore & Multi-Device): [ ] 0%
- Phase 6 (Edge Cases): [ ] 0%

**Overall Progress:** 0% Complete
