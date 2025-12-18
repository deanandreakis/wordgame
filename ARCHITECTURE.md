# 🏗️ LetterLoom Architecture Documentation

## System Overview

LetterLoom is a **cross-platform word puzzle game** built with Expo/React Native. The architecture is designed for:
- ✅ Compile-time level generation (guaranteed quality)
- ✅ Real-time gameplay (smooth 60 FPS animations)
- ✅ Persistent user data (Firebase + AsyncStorage)
- ✅ Monetization (RevenueCat IAP integration)
- ✅ Offline playability (local storage fallback)

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         APP LAYER                               │
│                        App.tsx                                  │
│  (Root state, IAP sync, Firebase auth, screen navigation)       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ MenuScreen   │  │ GameScreen   │  │ShopScreen    │           │
│  │              │  │              │  │              │           │
│  │ • Stats      │  │ • 5x5 Grid   │  │ • Premium    │           │
│  │ • Nav        │  │ • Word Entry │  │ • Level Pack │           │
│  │              │  │ • Scoring    │  │ • Coins      │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │LevelSelect   │  │HelpScreen    │  │LeaderScreen  │           │
│  │              │  │              │  │              │           │
│  │ • 4 Packs    │  │ • How to Play│  │ • Rankings   │           │
│  │ • Level Grid │  │ • Controls   │  │ • User Stats │           │
│  │ • Lock Icons │  │              │  │              │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                    COMPONENTS LAYER                             │
│                                                                 │
│  GameBoard      WordInput      ScoreDisplay      LetterTile    │
│  GameTimerbar   ShopCard       ParticleEffect    ...           │
├─────────────────────────────────────────────────────────────────┤
│                    SERVICES LAYER                               │
│                                                                 │
│  firebase.ts ──────────→ Cloud Firestore                        │
│              Auth (Anonymous)                                   │
│                                                                 │
│  iap.ts ────────────────→ RevenueCat SDK                        │
│           Purchases, Entitlements                               │
│                                                                 │
│  storage.ts ────────────→ AsyncStorage + SecureStore           │
│             Local Persistence                                  │
├─────────────────────────────────────────────────────────────────┤
│                   UTILITIES LAYER                               │
│                                                                 │
│  gameLogic.ts  – Core game mechanics (word validation, scoring) │
│  dictionary.ts – Word lookup utilities                          │
│  storage.ts    – AsyncStorage helpers                          │
├─────────────────────────────────────────────────────────────────┤
│                    DATA LAYER                                   │
│                                                                 │
│  src/data/levels.ts ──────→ 80 Pre-calculated Levels           │
│                            (13,067 clean words)                │
│                                                                 │
│  src/config/constants.ts ─→ Game constants                     │
│                            Product IDs                         │
│                            IAP pricing                         │
│                            Difficulty configs                  │
│                                                                 │
│  src/types/game.ts ───────→ TypeScript interfaces              │
│                            GameState, Level, User              │
├─────────────────────────────────────────────────────────────────┤
│                  EXTERNAL SERVICES                              │
│                                                                 │
│  Firebase Auth ───────────→ Anonymous login                    │
│  Cloud Firestore ─────────→ User profiles, scores              │
│  RevenueCat ───────────────→ IAP, subscriptions               │
│  Analytics ───────────────→ Events, crash reporting           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### User Starts App

```
App Launch
    ↓
App.tsx:useEffect()
    ├─ Initialize Firebase (anonymous auth)
    ├─ Sync user profile from Firestore
    ├─ Restore purchases via RevenueCat
    ├─ Update IAP entitlements
    └─ Render MenuScreen
    ↓
MenuScreen
    ├─ Display stats (score, level, words)
    ├─ Show "PLAY" button → LevelSelectScreen
    ├─ Show "SHOP" button → ShopScreen
    └─ Show "HELP" button → HelpScreen
```

### User Plays Level

```
LevelSelectScreen
    │
    ├─ User taps level
    ├─ Check if unlocked:
    │  ├─ Is it FREE (1-20)?  → Always unlocked
    │  ├─ Has user purchased pack? → Check purchasedLevels[]
    │  └─ Has premium?  → Check hasPremium flag
    │
    ├─ If locked → Show purchase dialog
    │  ├─ Call RevenueCat IAP
    │  ├─ Handle purchase
    │  └─ Update profile → Try again
    │
    └─ If unlocked → Proceed
        ↓
    GameScreen
        ├─ Load level from src/data/levels.ts
        ├─ Render 5x5 grid with LetterTiles
        ├─ Listen to letter selections
        ├─ Validate words via gameLogic.validateWord()
        │  └─ Word must be in level.validWords[]
        ├─ Update score in real-time
        ├─ Check win condition (score ≥ targetScore)
        └─ On level complete:
            ├─ Calculate stars (1/2/3)
            ├─ Call App.handleLevelComplete()
            ├─ Update userProfile with:
            │  ├─ lastPackPlayed
            │  ├─ completedLevels[]
            │  └─ totalScore
            ├─ Save to Firebase
            ├─ Show completion screen
            └─ Return to LevelSelectScreen
```

### User Makes Purchase

```
ShopScreen
    │
    └─ User taps "BUY LEVEL PACK 1"
        ↓
    Calls iap.purchaseProduct(LEVEL_PACK_1)
        ↓
    RevenueCat SDK
        ├─ Show system payment sheet
        ├─ Process payment
        └─ Return PurchaseTransaction
        ↓
    App.onPurchaseSuccess()
        ├─ Get updated CustomerInfo
        ├─ Check entitlements
        ├─ Update purchasedLevels[]
        ├─ Set hasPremium if applicable
        ├─ Save to profile
        ├─ Persist to Firebase
        └─ Trigger LevelSelectScreen update
        ↓
    LevelSelectScreen
        └─ Re-render with new unlocked levels
```

### Word Validation Flow

```
GameScreen: User selects letters and submits
    ↓
User taps ✓ button with selected letters
    ↓
GameScreen calls gameLogic.validateWord()
    ↓
gameLogic.validateWord(word, levelId)
    │
    ├─ Get current level: const level = LEVELS[levelId]
    ├─ Convert letters to uppercase: "CAT"
    ├─ Check: level.validWords.includes("CAT")
    │
    ├─ If YES → Valid word! ✓
    │   ├─ Calculate score:
    │   │  ├─ Base = letter values (C:3 + A:1 + T:1) = 5
    │   │  ├─ Length bonus = 1.5x for 3 letters
    │   │  ├─ Multiplier = check if tiles are on multiplier positions
    │   │  └─ Final = (5 × 1.5) × multiplier × 10
    │   ├─ Add to score
    │   ├─ Check win condition
    │   └─ Show particles/feedback
    │
    └─ If NO → Invalid word! ✗
        └─ Show error, deduct penalty
```

---

## State Management

### UserProfile (Persistent)

```typescript
interface UserProfile {
  // Identity
  userId: string;           // Firebase UID

  // Progress
  totalScore: number;       // All-time score
  currentLevel: number;     // Highest level reached
  lastPackPlayed?: number;  // Which pack user was last in (0-3)

  // Completion Tracking
  completedLevels: number[];        // Level IDs completed
  levelScores: Record<number, number>; // Best score per level

  // Purchases
  purchasedLevels: number[];   // Level pack IDs user owns
  hasPremium: boolean;         // Premium unlock purchased
  coinsBalance: number;        // Current coin count

  // Stats
  totalWordsFound: number;     // Lifetime words
  streak: number;              // Current day streak
  bestStreak: number;          // Record streak

  // Metadata
  createdAt: number;           // Timestamp
  lastPlayedAt: number;        // Timestamp
  favoriteLevel?: number;      // User preference
}
```

### GameState (Runtime/Local)

```typescript
interface GameState {
  // Current level
  currentLevel: Level;
  selectedLetters: Letter[];
  currentWord: string;
  score: number;

  // UI
  targetScore: number;
  timeRemaining: number;
  stars: number;

  // Power-ups
  activePowerups: PowerUp[];
  powerupCooldowns: Record<string, number>;
}
```

### Level Structure

```typescript
interface Level {
  id: number;
  letters: string[];        // 25-letter grid
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  targetScore: number;
  isPremium: boolean;

  // Pre-calculated at build time
  validWords: string[];      // All findable words
  multiplierPositions: Array<{
    position: number;        // 0-24
    value: 2 | 3;           // Multiplier
  }>;
}
```

---

## Screen Navigation

```
┌─────────────────────┐
│   MenuScreen        │
│ (Home/Hub)          │
├─────────────────────┤
│  ┌───────────────┐  │
│  │    PLAY ▶     │  │
│  └───────────────┘  │
│        │            │
│        └─→ LevelSelectScreen
│               │
│               └─→ GameScreen
│                    │
│                    └─→ LevelComplete (modal)
│                         │
│                         └─→ back to LevelSelectScreen
│
│  ┌───────────────┐  │
│  │   SHOP 🛒     │  │
│  └───────────────┘  │
│        │            │
│        └─→ ShopScreen
│               │
│               └─→ IAP Purchase
│                    │
│                    └─→ back to ShopScreen
│
│  ┌───────────────┐  │
│  │  HELP ❓      │  │
│  └───────────────┘  │
│        │            │
│        └─→ HelpScreen
│               │
│               └─→ back to MenuScreen
│
│  ┌───────────────┐  │
│  │ LEADERBOARD   │  │
│  └───────────────┘  │
│        │            │
│        └─→ LeaderboardScreen
│               │
│               └─→ back to MenuScreen
│
└─────────────────────┘
```

---

## File Organization

### Core Screens (`src/screens/`)

```
MenuScreen.tsx (150 lines)
├─ Display player stats
├─ Show main navigation (PLAY, SHOP, HELP)
├─ Show achievements
└─ Theme display (season, daily challenge)

LevelSelectScreen.tsx (280 lines)
├─ Pack selector (Free, Pack 1, Pack 2, Pack 3)
├─ Level grid (5 levels per row × 4 rows)
├─ Lock indicators (🔒 for locked, ✓ for completed)
├─ Remember last pack played (lastPackPlayed)
└─ IAP purchase flow for locked levels

GameScreen.tsx (400 lines)
├─ GameBoard component (5×5 grid)
├─ WordInput display (current word)
├─ ScoreDisplay (current/target)
├─ Timer bar
├─ PowerUp buttons
├─ Core game loop
│  ├─ Letter selection
│  ├─ Word validation
│  ├─ Score calculation
│  └─ Win detection
└─ Level completion handling

ShopScreen.tsx (520 lines)
├─ Premium bundle card
├─ Level packs section (Pack 1, 2, 3)
├─ Coin packs (small, medium, large)
├─ Purchase buttons
├─ Restore purchases
└─ Purchase confirmation dialogs

HelpScreen.tsx (180 lines)
├─ How to Play instructions
├─ Scoring explanation
├─ Power-ups guide
└─ Contact/support links
```

### Components (`src/components/`)

```
LetterTile.tsx (80 lines)
├─ Individual letter display
├─ Selection state (highlighted)
├─ Multiplier badge (2×, 3×)
└─ Animation on tap/validation

GameBoard.tsx (150 lines)
├─ 5×5 grid layout
├─ Letter arrangement
├─ Selection path visualization
└─ Renders LetterTile children

WordInput.tsx (100 lines)
├─ Display current selected letters
├─ Show word as user types
├─ Highlight invalid sequences
└─ Clear button

ScoreDisplay.tsx (80 lines)
├─ Current score
├─ Target score
├─ Progress bar
└─ Star preview

ParticleEffect.tsx (120 lines)
├─ Celebration animations
├─ Word validation feedback
├─ Score popup animations
└─ Reanimated integration
```

### Services (`src/services/`)

```
firebase.ts (200 lines)
├─ Initialize Firebase
├─ Anonymous authentication
├─ User profile persistence
│  ├─ Save profile to Firestore
│  ├─ Load profile from Firestore
│  └─ Real-time listener setup
└─ Leaderboard updates

iap.ts (339 lines)
├─ RevenueCat initialization
├─ Purchase handling
├─ Entitlements checking
├─ Restore purchases
├─ Product fetching
└─ Error handling
```

### Utilities (`src/utils/`)

```
gameLogic.ts (180 lines)
├─ generateLevel(levelId)
│  └─ Return Level data from levels.ts
├─ validateWord(word, levelId)
│  └─ Check if word in level.validWords[]
├─ calculateScore(word, multipliers)
│  ├─ Letter values
│  ├─ Length bonus
│  └─ Multiplier application
├─ checkWinCondition(score, target)
│  └─ Determine star count
└─ createLetterGrid(letters)
   ├─ Arrange 25 letters in 5×5
   ├─ Calculate adjacencies
   └─ Create Letter objects

dictionary.ts (80 lines)
├─ loadDictionary() – Load from levels.ts
├─ isValidWord(word) – Check validity
└─ getWordDefinition(word) – Get definition

storage.ts (100 lines)
├─ saveProfile(profile)
│  ├─ Local (AsyncStorage)
│  └─ Cloud (Firestore)
├─ loadProfile()
│  ├─ Try Firestore
│  └─ Fallback to AsyncStorage
└─ clearCache()
```

### Data (`src/data/`)

```
levels.ts (AUTO-GENERATED)
├─ 80 level objects
├─ Pre-calculated letter grids
├─ Valid word arrays per level
├─ Multiplier positions
└─ Target scores
```

### Configuration (`src/config/`)

```
constants.ts (150 lines)
├─ GAME_CONFIG
│  ├─ TESTING_MODE
│  ├─ FREE_LEVELS (20)
│  ├─ TOTAL_LEVELS (80)
│  └─ DIFFICULTY_NAMES
│
├─ PRODUCT_IDS
│  ├─ LEVEL_PACK_1
│  ├─ LEVEL_PACK_2
│  ├─ LEVEL_PACK_3
│  ├─ PREMIUM_UNLOCK
│  ├─ COINS_SMALL
│  ├─ COINS_MEDIUM
│  └─ COINS_LARGE
│
├─ IAP_PRICING
│  └─ Static prices for each product
│
└─ DIFFICULTY_CONFIG
   └─ Parameters per difficulty
```

### Types (`src/types/`)

```
game.ts (100 lines)
├─ GameState interface
├─ Level interface
├─ Letter interface
├─ UserProfile interface
├─ PowerUp interface
├─ Achievement interface
├─ MenuItem interface
└─ Purchase-related types
```

---

## Data Persistence

### Local Storage (AsyncStorage)

```
AsyncStorage Keys:
├─ "user_profile" → Last known profile JSON
├─ "game_state" → Current game session state
├─ "level_cache" → Cached level data
└─ "settings" → User preferences
```

### Cloud Storage (Firestore)

```
Firestore Structure:
firestore
├─ users/
│  └─ {userId}/
│     ├─ profile → UserProfile data
│     ├─ scores → Detailed level scores
│     └─ purchases → IAP receipt tracking
│
├─ leaderboard/
│  └─ users/ → Ranked by totalScore
│
└─ analytics/
   └─ events/ → Player events/telemetry
```

### Secure Storage (SecureStore)

```
Secure Keys:
├─ "app_session_token" → Firebase auth token
├─ "revenucat_token" → RevenueCat user ID
└─ "iap_receipt_validation" → Purchase receipts
```

---

## Performance Considerations

### Build-Time Optimization

```
✅ Level Generation (src/scripts/generateValidatedLevels.js)
   ├─ Runs once at build time
   ├─ Generates 80 levels in ~5 seconds
   ├─ Output: src/data/levels.ts (~2 MB)
   └─ Zero runtime cost

✅ Pre-calculated Data
   ├─ All valid words pre-computed
   ├─ No word validation algorithm at runtime
   ├─ O(1) lookup for word validation
   └─ Guarantees all words are legitimate
```

### Runtime Performance

```
✅ Word Validation: O(1)
   └─ Simple array lookup

✅ Score Calculation: O(n) where n = selected letters (≤8)
   └─ Negligible for typical gameplay

✅ Rendering: Smooth 60 FPS
   ├─ Reanimated for animations
   ├─ Optimized component updates
   └─ Minimal re-renders

✅ Memory Usage
   ├─ Levels loaded on-demand
   ├─ User profile cached locally
   └─ No memory leaks in navigation
```

### Bundle Size

```
Base Expo Build: ~15 MB
├─ React Native: ~3 MB
├─ Expo SDK: ~5 MB
├─ Firebase SDK: ~2 MB
└─ Other deps: ~5 MB

Additions:
├─ levels.ts: ~2 MB
├─ RevenueCat: ~0.5 MB
└─ Reanimated: ~0.3 MB

Total: ~20 MB (typical for games)
```

---

## Scalability

### Adding New Features

**New Screen:**
1. Create `src/screens/NewScreen.tsx`
2. Add navigation logic in `App.tsx`
3. Import utilities as needed
4. Style with theme constants

**New Level Pack:**
1. Modify `scripts/generateValidatedLevels.js` to generate more levels
2. Run: `node scripts/generateValidatedLevels.js`
3. Add new pack IAP product to RevenueCat
4. Update PRODUCT_IDS in constants.ts
5. Update ShopScreen to display new pack

**Expanding to 100+ Levels:**
1. Update script to generate 100 levels (no other changes needed)
2. Add new IAP products for additional packs
3. Everything else scales automatically!

---

## Testing Strategy

### Unit Tests

```
gameLogic.ts ✓
├─ validateWord() with various inputs
├─ calculateScore() with multipliers
└─ checkWinCondition() star logic

constants.ts ✓
└─ Verify all product IDs and pricing
```

### Component Tests

```
LetterTile.tsx ✓
├─ Selection state
├─ Multiplier display
└─ Tap interaction

GameBoard.tsx ✓
└─ Grid arrangement
```

### Integration Tests

```
Full gameplay flow ✓
├─ Select level
├─ Play level
├─ Validate word
├─ Complete level
└─ Update profile

IAP flow ✓
├─ Purchase product
├─ Verify entitlement
└─ Unlock content
```

---

## Security

### Authentication

```
App Launch
    ↓
Firebase Anonymous Auth
    ├─ Creates anonymous user
    ├─ Returns unique userId
    └─ Session persists across app restarts
    ↓
All data tied to userId
    └─ Prevents unauthorized access
```

### Data Encryption

```
Firestore (Server-side)
├─ TLS in transit
├─ Encryption at rest
└─ Firebase security rules

SecureStore (Client-side)
├─ Platform-specific encryption
│  ├─ iOS: Keychain
│  └─ Android: Keystore
└─ Sensitive tokens only
```

### IAP Security

```
RevenueCat handles:
├─ Receipt validation (Apple/Google)
├─ Fraud detection
├─ Entitlement verification
└─ Sensitive credential management
```

---

## Summary

LetterLoom's architecture achieves:

✅ **Modularity** - Clear separation of concerns
✅ **Scalability** - Easy to add levels, features, packs
✅ **Performance** - Compile-time optimization, runtime efficiency
✅ **Security** - Anonymous auth, encrypted storage
✅ **Reliability** - Pre-calculated levels, validated words
✅ **Maintainability** - Well-organized, documented codebase

The design prioritizes **compile-time work** (level generation) over **runtime work** (word validation), ensuring players experience smooth, lag-free gameplay with instant word validation.
