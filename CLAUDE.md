# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 🎮 Project Overview

**LetterLoom** is an addictive word puzzle game built with Expo/React Native. The app features:
- 80 pre-calculated levels across 4 packs (Free + 3 Premium)
- Real-time word validation against level-specific word lists
- Firebase backend for user profiles and leaderboards
- RevenueCat integration for in-app purchases
- Cross-platform: iOS and Android builds via EAS (no Mac required)

**Architecture Principle**: Compile-time level generation with pre-calculated word lists enables fast runtime performance.

---

## 🚀 Development Commands

### Starting Development
```bash
npm install              # Install dependencies
npm start               # Start Expo dev server (builds from Linux for iOS/Android)
npm run test            # Run Jest tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Generate coverage report
npm run lint            # Run ESLint on codebase
```

### Level Generation
```bash
node scripts/generateValidatedLevels.js   # Regenerate all 80 levels (auto-run on pre-commit)
```

### Building & Deployment
```bash
npm install -g eas-cli                    # Install EAS CLI (one-time)
eas login                                  # Authenticate with Expo account
eas build --platform ios --profile preview  # Build iOS for testing
eas build --platform android --profile preview  # Build Android for testing
eas build --platform all --profile production   # Build both for production
```

### Debugging
- **Expo Go**: Scan QR code from `npm start` terminal output to run app instantly on device
- **Dev Client**: EAS creates a custom Expo client with all native modules pre-installed
- **Network**: On Linux, use `adb reverse` or `expo start --localhost` if IP-based connection fails

### Testing Mode
Set `GAME_CONFIG.TESTING_MODE = true` in `src/config/constants.ts` to unlock all 80 levels in development builds. This auto-enables when `__DEV__ = true`.

---

## 🏗️ Architecture Summary

### Layered Architecture
```
App.tsx (Root state, navigation, IAP sync)
    ↓
Screens (MenuScreen, GameScreen, LevelSelectScreen, ShopScreen, etc.)
    ↓
Components (LetterTile, GameBoard, WordInput, ScoreDisplay, etc.)
    ↓
Services (firebase.ts, iap.ts) + Utilities (gameLogic, dictionary, storage)
    ↓
Data (levels.ts, constants.ts) + Types (game.ts)
```

### Data Flow: Level Completion
```
User completes level
  ↓ GameScreen
  ├─ Calculate stars (1/2/3 based on score multiplier)
  ├─ Call App.handleLevelComplete(levelId, stars, score)
  │   ├─ Update UserProfile (completedLevels[], totalScore, currentLevel)
  │   ├─ Save to AsyncStorage (immediate)
  │   └─ Sync to Firestore (background)
  └─ Show completion modal → Return to LevelSelectScreen
```

### Word Validation: Pre-calculated at Build Time
```
Build Phase:
  scripts/generateValidatedLevels.js
    ├─ Generate 80 level letter grids
    ├─ Find all valid words from dictionary (using depth-first search)
    ├─ Pre-validate against family-friendly word list
    └─ Output: src/data/levels.ts (80 Level objects with validWords[])

Runtime: O(1) lookup
  GameScreen receives selected letters
    ↓
  gameLogic.validateWord(letters, levelId)
    ├─ const level = LEVELS[levelId]
    ├─ const word = joinLetters(letters).toUpperCase()
    └─ return level.validWords.includes(word)  // Simple array lookup!
```

---

## 📁 Key Files & Their Responsibilities

### Screens (`src/screens/`)
- **MenuScreen.tsx** - Home menu with player stats and navigation
- **LevelSelectScreen.tsx** - Pack selector and level grid; remembers last pack played via `lastPackPlayed`
- **GameScreen.tsx** - Core gameplay loop: letter selection, word validation, scoring, win detection
- **ShopScreen.tsx** - Level packs, coin bundles, and IAP purchases
- **HelpScreen.tsx** - Game rules, scoring, and power-ups guide

### Core Utilities (`src/utils/`)
- **gameLogic.ts** - `validateWord()`, `calculateScore()`, `checkWinCondition()`
  - No dictionary lookup here! Uses `LEVELS[levelId].validWords[]`
  - Score calculation: `(baseScore × lengthBonus × tileMultipliers) × 10`
- **dictionary.ts** - Simple word list helpers
- **storage.ts** - AsyncStorage + Firestore sync for user profile persistence

### Services (`src/services/`)
- **firebase.ts** - Anonymous auth, profile sync, leaderboard updates
- **iap.ts** - RevenueCat integration, purchase handling, entitlement checking

### Data & Config (`src/data/` and `src/config/`)
- **levels.ts** (AUTO-GENERATED) - 80 Level objects with letter grids and `validWords[]` arrays
- **constants.ts** - Game config (grid size, colors, TESTING_MODE), product IDs, letter scores

---

## 🔄 Common Development Tasks

### Adding a New Level Pack
1. Update `TOTAL_LEVELS` in `src/config/constants.ts` (e.g., 100 instead of 80)
2. Run: `node scripts/generateValidatedLevels.js`
3. Add new product to RevenueCat dashboard
4. Update `PRODUCT_IDS` in `constants.ts`
5. Update `ShopScreen.tsx` to display new pack

### Modifying Scoring System
1. Edit `LETTER_SCORES` and `BONUS_MULTIPLIERS` in `src/config/constants.ts`
2. Update score calculation in `src/utils/gameLogic.ts:calculateScore()`
3. Test with: `npm run test -- gameLogic.test.ts`

### Changing Game Colors/Theme
1. Update `GAME_CONFIG.COLORS` in `src/config/constants.ts`
2. Gradients are defined in components; search for hardcoded color values if needed
3. Current theme: Forest Green (nature-inspired)

### Adding UI Features (Buttons, Modals, etc.)
1. Create new component in `src/components/` (e.g., `NewComponent.tsx`)
2. Import and use in screens
3. Use colors from `GAME_CONFIG.COLORS` for consistency
4. Style with React Native `StyleSheet` or inline styles

---

## 🧪 Testing

### Test Structure
- Unit tests: `src/**/__tests__/*.test.ts`
- Component tests: React Native Testing Library for UI components
- Integration tests: Firebase and IAP flow tests

### Running Tests
```bash
npm test                    # Run all tests once
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report (target: 70%+ for all metrics)
npm test -- gameLogic.test.ts  # Single file
```

### Writing Tests
- Mock Firebase in tests using `jest.mock()`
- Mock RevenueCat using `jest.mock('react-native-purchases')`
- Test gameLogic functions with various word/multiplier scenarios

---

## 💾 State Management & Data Persistence

### UserProfile (Persistent Across Sessions)
```typescript
{
  userId: string           // Firebase UID
  totalScore: number       // All-time score
  currentLevel: number     // Highest level reached
  lastPackPlayed?: number  // Remember which pack (0-3)
  completedLevels: number[]      // Levels 1-80 completed
  levelScores: Record<number, number>  // Best score per level
  purchasedLevels: number[]       // Purchased level pack IDs
  hasPremium: boolean             // Premium unlock flag
  coinsBalance: number            // Current coins
  totalWordsFound: number         // Lifetime words
  streak: number                  // Current day streak
  createdAt: number               // Timestamp
}
```

### GameState (Runtime Only)
```typescript
{
  currentLevel: Level
  selectedLetters: Letter[]   // Currently tapped letters
  currentWord: string         // Joined selectedLetters
  score: number              // Current level score
  targetScore: number        // Level goal
  timeRemaining: number      // Seconds left
  stars: number              // 1/2/3 star count
}
```

### Sync Strategy
1. **Local First**: Save to AsyncStorage immediately on change
2. **Cloud Sync**: Periodically sync to Firestore (with exponential backoff on failure)
3. **Offline**: App works fully offline, syncs when connection returns

---

## 🔐 Security & Secrets

### Environment Variables
- `.env` file (gitignored) contains local development secrets
- `app.config.js` reads from `process.env` and passes to Expo
- Production builds use EAS Secrets (cloud-encrypted)

### Protected Credentials
- Firebase config (API keys, project ID)
- RevenueCat API keys (iOS and Android)
- App signing certificates (in EAS)

### Access Pattern
```
.env or EAS Secrets
  ↓
app.config.js (read via process.env)
  ↓
expo-constants (runtime access)
  ↓
firebase.ts & iap.ts (consumed here)
```

---

## 📊 Performance Notes

### Optimization Strategy: Build-Time Work
- **Level generation**: 80 levels generated at build time (~5 seconds)
- **Word validation**: Pre-calculated validWords[] arrays (zero runtime cost)
- **Result**: O(1) word validation (simple array lookup) vs. algorithm-based lookup

### Runtime Performance Targets
- Word validation: < 1ms (array lookup)
- Rendering: 60 FPS (Reanimated for animations)
- Memory: Levels loaded on-demand, ~20 MB bundle size

---

## 🔗 Dependencies & Integration Points

### External Services
- **Firebase**: Anonymous auth, Firestore for profiles/leaderboards
- **RevenueCat**: IAP abstraction layer (handles App Store & Play Store receipts)
- **Expo**: React Native managed framework, EAS Build for CI/CD

### Key Packages
- `react-native-reanimated` - Smooth animations
- `expo-secure-store` - Encrypted token storage
- `expo-haptics` - Vibration feedback
- `jest-expo` - Testing environment

---

## 🐛 Debugging Tips

### Common Issues
1. **Word not validating?** Check that `src/data/levels.ts` was regenerated. Run: `node scripts/generateValidatedLevels.js`
2. **IAP not working?** Verify RevenueCat API keys in `.env` and entitlements in RevenueCat dashboard
3. **Firestore sync failing?** Check Firebase rules and network connection (use AsyncStorage fallback)
4. **Build fails?** Run `npm install` and ensure all EAS secrets are set via `eas secret:list`

### Enable Debug Logging
- `gameLogic.ts`: Add `console.log()` in `validateWord()` to see word validation
- `firebase.ts`: Log Firestore queries and sync status
- `iap.ts`: RevenueCat has built-in logging in dev mode

---

## 📝 Notes for Future Work

### Scalability
- To add more levels: Update `TOTAL_LEVELS` in constants and regenerate
- To add new screens: Create in `src/screens/`, add navigation in `App.tsx`
- To add features: Keep utilities generic and reusable

### Known Limitations
- Tablet support disabled (portrait-only)
- Android API 24+ required
- Requires TypeScript 5.3.3+ for strict mode

---

## 🔄 Git Workflow

- Main branch is `main` (production-ready)
- Pre-commit hooks auto-run: linting, tests, level generation
- Commit messages: Use conventional format (feat:, fix:, docs:, etc.)

---

## Resources

- **Architecture Details**: See `ARCHITECTURE.md` for data flow diagrams and state management
- **Level Generation**: See `LEVEL_GENERATION.md` for word validation and difficulty distribution
- **Build Setup**: See `EAS_SETUP.md` for iOS/Android build instructions
- **Assets**: See `ASSETS_SUMMARY.md` for icon and splash screen specifications
