import '@testing-library/react-native/extend-expect';

// Mock Firebase
jest.mock('@react-native-firebase/app', () => ({
  default: jest.fn(() => ({
    onReady: jest.fn(() => Promise.resolve()),
  })),
}));

jest.mock('@react-native-firebase/auth', () => ({
  default: jest.fn(() => ({
    currentUser: null,
    signInAnonymously: jest.fn(() => Promise.resolve()),
  })),
}));

jest.mock('@react-native-firebase/firestore', () => ({
  default: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        set: jest.fn(() => Promise.resolve()),
        get: jest.fn(() => Promise.resolve()),
      })),
    })),
  })),
}));

// Mock IAP
jest.mock('react-native-iap', () => ({
  initConnection: jest.fn(() => Promise.resolve()),
  endConnection: jest.fn(() => Promise.resolve()),
  getProducts: jest.fn(() => Promise.resolve([])),
  requestPurchase: jest.fn(() => Promise.resolve()),
}));

// Mock Haptic Feedback
jest.mock('react-native-haptic-feedback', () => ({
  trigger: jest.fn(),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
}));
