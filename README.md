# 🎮 LetterLoom - Weave Words, Score Big!

<div align="center">

![LetterLoom](https://img.shields.io/badge/LetterLoom-v1.0.0-purple?style=for-the-badge)
![Expo](https://img.shields.io/badge/Expo-50.0.0-000020?style=for-the-badge&logo=expo)
![React Native](https://img.shields.io/badge/React_Native-0.73.2-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-3178C6?style=for-the-badge&logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-Latest-FFCA28?style=for-the-badge&logo=firebase)
![EAS](https://img.shields.io/badge/EAS_Build-Enabled-4630EB?style=for-the-badge)

**An addictive word puzzle game built with Expo! Develop on Linux, build for iOS!**

</div>

---

## 🌟 Features

### 🎯 Core Gameplay
- **5x5 Letter Grid** - Strategically placed letters with varying frequencies
- **Adjacent Letter Selection** - Connect letters horizontally, vertically, or diagonally
- **Real-time Word Validation** - Instant feedback with a comprehensive 2000+ word dictionary
- **Smart Scoring System** - Points based on letter values, word length, and multipliers
- **100+ Levels** - Progressive difficulty from Easy to Expert

### 💎 Premium Features
- **Free Levels** - First 20 levels completely free
- **Level Packs** - Purchase additional level packs ($2.99 each)
- **Power-ups** - Hints, shuffles, time freeze, and double points
- **In-App Purchases** - Buy coins and unlock premium features

### 🎨 Visual Appeal
- **Stunning Gradients** - Beautiful color schemes throughout
- **Particle Effects** - Celebratory animations on word completion
- **Smooth Animations** - Spring physics and fluid transitions
- **Haptic Feedback** - Tactile responses for selections and validations
- **Modern UI** - Clean, professional design with shadows and depth

### 🔥 Engagement Features
- **Streak System** - Track consecutive correct words
- **Daily Challenges** - New puzzles every day
- **Global Leaderboard** - Compete with players worldwide
- **Achievements** - Unlock rewards for milestones
- **Profile Stats** - Track total score, words found, and highest level

### 🏗️ Technical Features
- **Expo/EAS** - Build iOS apps from Linux!
- **Firebase Backend** - Cloud Firestore for data persistence
- **RevenueCat** - Professional IAP management
- **Anonymous Authentication** - Seamless user experience
- **Offline Support** - Local storage with AsyncStorage
- **Comprehensive Tests** - 70%+ code coverage
- **TypeScript** - Fully typed for reliability
- **No Native Dependencies** - Pure JavaScript/TypeScript

---

## 📱 Screenshots

```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│   Menu Screen       │     │  Level Select       │     │   Game Screen       │
│                     │     │                     │     │                     │
│    LetterLoom       │     │  Pack 1  Pack 2     │     │  Level 5  ⏱ 180s  │
│  Weave Words,       │     │  [===Selected===]   │     │  Score: 450/500    │
│  Score Big!         │     │                     │     │  [█████████▢▢▢]    │
│                     │     │  ┌─┐ ┌─┐ ┌─┐ ┌─┐   │     │                     │
│  Player Stats       │     │  │1│ │2│ │3│ │4│   │     │   C  A  T  S  E    │
│  Score: 10,450      │     │  └─┘ └─┘ └─┘ └─┘   │     │   H  O  R  N  D    │
│  Level: 25          │     │  ┌─┐ ┌─┐ ┌─┐ ┌─┐   │     │   A  L  L  Y  R    │
│  Words: 523         │     │  │5│ │6│ │7│ │8│   │     │   I  N  G  E  A    │
│                     │     │  └─┘ └─┘ └─┘ └─┘   │     │   R  T  S  L  W    │
│  ┌─────────────┐   │     │                     │     │                     │
│  │   ▶ PLAY    │   │     │  ┌─────────────┐   │     │  [CHALLENGE]       │
│  └─────────────┘   │     │  │ Easy: 500pt │   │     │  Words: CAT +30    │
│  ┌───┐   ┌───┐     │     │  │ Medium: 750 │   │     │        HORN +45    │
│  │ 🏆│   │ 🛒│     │     │  └─────────────┘   │     │        ALLY +40    │
│  └───┘   └───┘     │     │                     │     │                     │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
```

---

## 🚀 Getting Started (Linux/Mac/Windows)

### Prerequisites

- **Node.js** >= 18
- **npm** or **yarn**
- **Expo account** (free at https://expo.dev/)
- **Firebase Project** (for backend services)
- **RevenueCat account** (for IAP)

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/letterloom.git
cd letterloom
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure Firebase** (see `EAS_SETUP.md` for details)
   - Create Firebase project
   - Update `src/services/firebase.ts` with your config

4. **Configure RevenueCat** (see `EAS_SETUP.md` for details)
   - Create RevenueCat account
   - Get API keys
   - Update `src/App.tsx`

5. **Start Development Server**
```bash
npm start
```

6. **Test on Device**
   - Install Expo Go on your phone
   - Scan QR code from terminal
   - App loads instantly!

### Building for Production

**See `EAS_SETUP.md` for complete build instructions**

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Build for iOS (runs on EAS servers, works from Linux!)
eas build --platform ios --profile production

# Build for Android
eas build --platform android --profile production

# Build both
eas build --platform all --profile production
```

**No Xcode or Mac required! Build iOS apps from Linux using EAS Build!**

---

## 🎮 How to Play

### Basic Rules

1. **Select Letters** - Tap letters on the grid to select them
2. **Form Words** - Selected letters must be adjacent (including diagonals)
3. **Submit Words** - Press the ✓ button to submit
4. **Score Points** - Earn points based on letter values and word length
5. **Reach Target** - Hit the target score to complete the level

### Scoring

- **Base Score**: Each letter has a point value (A=1, Z=10)
- **Length Bonus**: Longer words earn multipliers
  - 4 letters: 1.5x
  - 5 letters: 2x
  - 6 letters: 2.5x
  - 7 letters: 3x
  - 8+ letters: 4x
- **Multiplier Tiles**: Some tiles have 2x or 3x multipliers
- **Base Multiplier**: All scores are multiplied by 10

### Power-ups

- **💡 Hint** (50 coins) - Reveals a valid word
- **🔄 Shuffle** (30 coins) - Rearranges all letters
- **⏸️ Time Freeze** (100 coins) - Stops timer for 30 seconds
- **⚡ Double Points** (75 coins) - Next word scores 2x

### Stars System

- ⭐ (1 star): Reach target score
- ⭐⭐ (2 stars): Score 1.5x target
- ⭐⭐⭐ (3 stars): Score 2x target

---

## 🏗️ Project Structure

```
letterloom/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── LetterTile.tsx  # Individual letter tile
│   │   ├── GameBoard.tsx   # 5x5 game grid
│   │   ├── WordInput.tsx   # Current word display
│   │   ├── ScoreDisplay.tsx # Score and progress
│   │   └── ParticleEffect.tsx # Celebration particles
│   ├── screens/            # Main app screens
│   │   ├── MenuScreen.tsx  # Home menu
│   │   ├── LevelSelectScreen.tsx # Level picker
│   │   └── GameScreen.tsx  # Main gameplay
│   ├── services/           # External services
│   │   ├── firebase.ts     # Firebase integration
│   │   └── iap.ts         # In-app purchases
│   ├── utils/             # Utilities
│   │   ├── gameLogic.ts   # Core game mechanics
│   │   ├── dictionary.ts  # Word validation
│   │   └── storage.ts     # Local persistence
│   ├── types/             # TypeScript types
│   │   └── game.ts        # Game type definitions
│   ├── config/            # Configuration
│   │   └── constants.ts   # Game constants
│   └── App.tsx            # Root component
├── ios/                   # iOS native code
├── android/              # Android native code
├── __tests__/           # Test files
└── package.json         # Dependencies
```

---

## 🧪 Testing

### Run Tests
```bash
npm test
# or
yarn test
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### Test Structure
- **Unit Tests**: Core game logic and utilities
- **Component Tests**: UI component behavior
- **Integration Tests**: Firebase and IAP services

**Coverage Goals**: 70%+ for all metrics

---

## 💰 Monetization Strategy

### Free-to-Play Model
- **20 Free Levels** - Generous free content to hook players
- **Rewarded Ads** - Watch ads for power-ups (future feature)

### In-App Purchases

| Product | Description | Price |
|---------|-------------|-------|
| Level Pack 1 | Levels 21-40 | $2.99 |
| Level Pack 2 | Levels 41-60 | $2.99 |
| Level Pack 3 | Levels 61-80 | $2.99 |
| Small Coins | 500 coins | $0.99 |
| Medium Coins | 1,500 coins | $2.99 |
| Large Coins | 5,000 coins | $7.99 |
| Premium Unlock | All levels + no ads | $9.99 |

### Engagement Loop
1. **Free levels** hook players
2. **Daily challenges** bring them back
3. **Leaderboard** creates competition
4. **Level packs** convert to paid users
5. **Power-ups** provide ongoing monetization

---

## 🔥 Going Viral - Growth Strategy

### Built-in Viral Features

1. **Social Sharing**
   - Share scores on social media (future feature)
   - Challenge friends to beat your score
   - Daily challenge results

2. **Competitive Elements**
   - Global leaderboard creates FOMO
   - Daily/weekly tournaments
   - Streak achievements

3. **Addictive Mechanics**
   - Quick gameplay loops (1-3 minutes per level)
   - Progressive difficulty keeps it challenging
   - Satisfying animations and feedback
   - "Just one more level" design

4. **Marketing Hooks**
   - Catchy name: "LetterLoom"
   - Beautiful screenshots for App Store
   - Gameplay videos showing particle effects
   - Influencer partnerships

### Launch Strategy

1. **Soft Launch**: Test in select markets
2. **ASO Optimization**: Keywords like "word game", "puzzle", "addictive"
3. **PR Campaign**: Reach out to gaming blogs and review sites
4. **App Store Features**: Target "Games We Love" and "New Games We Love"
5. **Community Building**: Discord/Reddit for engaged players

---

## 🛠️ Technologies Used

- **Expo** 50.0.0 - Managed React Native framework
- **EAS Build** - Cloud-based iOS/Android builds from Linux
- **React Native** 0.73.2 - Cross-platform mobile framework
- **TypeScript** 5.3.3 - Type-safe JavaScript
- **Firebase (Web SDK)** 10.7.1
  - Authentication - Anonymous sign-in
  - Cloud Firestore - Real-time database
  - No native dependencies required!
- **RevenueCat** 7.0.0 - Professional IAP management
- **Expo Linear Gradient** - Beautiful gradients
- **Expo Haptics** - Tactile feedback
- **Expo Secure Store** - Encrypted local storage
- **React Native Reanimated** 3.6.0 - Smooth animations
- **AsyncStorage** - Local data persistence
- **Jest** + **jest-expo** - Testing framework
- **React Native Testing Library** - Component testing

---

## 📊 Analytics & Metrics

Track these KPIs for success:

- **DAU/MAU** - Daily/Monthly Active Users
- **Retention** - D1, D7, D30 retention rates
- **ARPU** - Average Revenue Per User
- **Conversion Rate** - Free to paid conversion
- **Session Length** - Average playtime
- **Levels Completed** - Progression metrics
- **IAP Revenue** - Purchase breakdown

---

## 🚧 Future Features

- [ ] **Social Features**
  - Friend challenges
  - Share achievements
  - Multiplayer mode

- [ ] **Additional Content**
  - Themed level packs (holidays, seasons)
  - Custom word categories
  - User-generated levels

- [ ] **Monetization**
  - Rewarded video ads
  - Battle pass system
  - Limited-time events

- [ ] **Gameplay**
  - Power-up combinations
  - Boss levels
  - Endless mode

- [ ] **Technical**
  - Android version
  - Tablet optimization
  - Cloud save sync

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👏 Acknowledgments

- Word dictionary compiled from public domain sources
- Inspired by classic word games like Boggle and Wordament
- Design inspiration from modern mobile games

---

## 📞 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/letterloom/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/letterloom/discussions)
- **Email**: support@letterloom.com (example)

---

<div align="center">

**Made with ❤️ by the LetterLoom Team**

⭐ Star this repo if you like it! ⭐

</div>
