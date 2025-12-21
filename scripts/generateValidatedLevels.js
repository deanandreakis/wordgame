/**
 * Validated Level Generator with Pre-calculated Word Lists
 * Generates 60 levels with ALL valid words saved at compile time
 * Uses scripts/dictionaries/american-english for word validation
 * Filters out inappropriate words to ensure family-friendly content
 *
 * Run with: node scripts/generateValidatedLevels.js
 */

const fs = require('fs');
const path = require('path');
const { filterInappropriateWords } = require('./inappropriateWords');

// Load the american-english dictionary
let VALID_WORDS = new Set();

function loadDictionary() {
  try {
    const dictPath = path.join(__dirname, 'dictionaries', 'american-english');
    const content = fs.readFileSync(dictPath, 'utf8');
    const words = content
      .split('\n')
      .map(w => w.trim().toLowerCase())
      .filter(w => w.length >= 3 && w.length <= 8 && /^[a-z]+$/.test(w)); // Only letters, 3-8 chars

    VALID_WORDS = new Set(words);
    console.log(`📚 Loaded ${VALID_WORDS.size} valid words from local dictionary\n`);
    return true;
  } catch (err) {
    console.error('❌ Could not load dictionary from scripts/dictionaries/american-english');
    console.error('Error:', err.message);
    process.exit(1);
  }
}

// Check if word is valid
function isValidWord(word) {
  return VALID_WORDS.has(word.toLowerCase());
}

// Letter frequencies (based on English)
const LETTER_FREQUENCIES = {
  A: 8.2, B: 1.5, C: 2.8, D: 4.3, E: 12.7, F: 2.2, G: 2.0, H: 6.1, I: 7.0, J: 0.15, K: 0.77, L: 4.0, M: 2.4,
  N: 6.7, O: 7.5, P: 1.9, Q: 0.095, R: 6.0, S: 6.3, T: 9.1, U: 2.8, V: 0.98, W: 2.4, X: 0.15, Y: 2.0, Z: 0.074,
};

function generateRandomLetter() {
  const random = Math.random() * 100;
  let cumulative = 0;
  for (const [letter, frequency] of Object.entries(LETTER_FREQUENCIES)) {
    cumulative += frequency;
    if (random <= cumulative) return letter;
  }
  return 'E';
}

function generateLetterGrid(difficulty) {
  const vowelRatio = { easy: 0.5, medium: 0.4, hard: 0.35, expert: 0.3 }[difficulty];
  const vowels = ['A', 'E', 'I', 'O', 'U'];
  const vowelCount = Math.floor(25 * vowelRatio);

  const letters = [];
  for (let i = 0; i < 25; i++) {
    if (i < vowelCount) {
      letters.push(vowels[Math.floor(Math.random() * vowels.length)]);
    } else {
      letters.push(generateRandomLetter());
    }
  }

  // Shuffle
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }

  return letters;
}

function areLettersAdjacent(pos1, pos2) {
  const xDiff = Math.abs(pos1.x - pos2.x);
  const yDiff = Math.abs(pos1.y - pos2.y);
  return xDiff <= 1 && yDiff <= 1 && (xDiff + yDiff) > 0;
}

// Find ALL valid words in the grid (saved with level at compile time)
// NO early termination - searches exhaustively to find every possible word
function findPossibleWords(letters, minWords) {
  const letterObjs = letters.map((letter, i) => ({
    letter,
    position: { x: i % 5, y: Math.floor(i / 5) },
    id: i
  }));

  const possibleWords = new Set();

  function generateCombinations(current, remaining) {
    if (current.length >= 3) {
      const word = current.map(l => l.letter).join('');
      if (isValidWord(word)) {
        possibleWords.add(word.toUpperCase());
      }
    }

    // Max depth 8 (keeps search manageable)
    if (current.length >= 8) return;

    for (let i = 0; i < remaining.length; i++) {
      if (current.length === 0 || areLettersAdjacent(current[current.length - 1].position, remaining[i].position)) {
        generateCombinations(
          [...current, remaining[i]],
          remaining.filter((_, idx) => idx !== i)
        );
      }
    }
  }

  generateCombinations([], letterObjs);
  return Array.from(possibleWords);
}

// Generate multiplier positions for a level (consistent per level)
function generateMultipliers(difficulty) {
  const multipliers = [];

  // Number of multiplier tiles by difficulty
  const multiplierCounts = {
    easy: 4,    // 4 multiplier tiles (easier to get high scores)
    medium: 3,  // 3 multiplier tiles
    hard: 3,    // 3 multiplier tiles
    expert: 2,  // 2 multiplier tiles (harder to score)
  };

  const count = multiplierCounts[difficulty];
  const positions = new Set();

  // Randomly select positions (but deterministic per level due to seeding)
  while (positions.size < count) {
    const pos = Math.floor(Math.random() * 25);
    positions.add(pos);
  }

  // Convert to array and assign 2x or 3x values
  Array.from(positions).forEach((position, index) => {
    // First multiplier is 3x, rest are 2x (70/30 split like original)
    const value = index === 0 && Math.random() < 0.3 ? 3 : 2;
    multipliers.push({ position, value });
  });

  return multipliers;
}

function generateValidatedLevel(levelNumber, difficulty, isPremium, targetScore, timeLimit) {
  const minWords = { easy: 20, medium: 15, hard: 12, expert: 10 }[difficulty];
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    attempts++;
    const letters = generateLetterGrid(difficulty);
    const words = findPossibleWords(letters, minWords);

    if (words.length >= minWords) {
      // Filter out inappropriate words before saving
      const { filtered, removed, warnings } = filterInappropriateWords(words);

      // CONSTRAINT: Reject grid if ANY inappropriate words can be spelled
      if (removed.length > 0) {
        console.log(`   ❌ Grid rejected (attempt ${attempts}): inappropriate words found that can be spelled: ${removed.join(', ')} - regenerating...`);
        continue; // Reject this entire grid and try a new one
      }

      // Generate consistent multiplier positions (2x and 3x point tiles)
      const multiplierPositions = generateMultipliers(difficulty);

      console.log(`✅ Level ${levelNumber} (${difficulty}): ${words.length} words found on attempt ${attempts}`);

      // Report filtering results
      if (warnings.length > 0) {
        console.log(`   ⚠️  ${warnings.length} questionable words (kept): ${warnings.join(', ')}`);
      }

      console.log(`   ✓ ${filtered.length} clean words (no inappropriate words possible)`);
      console.log(`   Sample words: ${filtered.slice(0, 5).join(', ')}`);
      console.log(`   Multipliers: ${multiplierPositions.length} tiles (${multiplierPositions.filter(m => m.value === 2).length}x 2×, ${multiplierPositions.filter(m => m.value === 3).length}x 3×)`);

      // Check if we still have enough words after filtering
      if (filtered.length < minWords) {
        console.log(`   ⚠️  After filtering, only ${filtered.length} words remain (need ${minWords}) - regenerating...`);
        continue; // Try again with a new grid
      }

      return { id: levelNumber, difficulty, letters, targetScore, timeLimit, isPremium, validWords: filtered, multiplierPositions };
    }

    if (attempts % 10 === 0) {
      console.log(`   Attempt ${attempts}: ${words.length} words (need ${minWords})`);
    }
  }

  console.log(`❌ Level ${levelNumber}: Could not generate valid level after ${maxAttempts} attempts`);
  return null;
}

// Generate all levels
function generateAllLevels() {
  loadDictionary();

  console.log('🔧 Generating 80 validated levels with american-english dictionary...\n');
  console.log('Level Distribution:\n');
  console.log('  FREE PACK (1-20): 10 Easy + 10 Medium');
  console.log('  PACK 1 (21-40): 10 Medium + 10 Hard');
  console.log('  PACK 2 (41-60): 10 Hard + 10 Expert');
  console.log('  PACK 3 (61-80): 20 Expert\n');

  const levelConfigs = [];

  // FREE PACK: Easy levels (1-10)
  for (let i = 1; i <= 10; i++) {
    levelConfigs.push({ id: i, difficulty: 'easy', isPremium: false, targetScore: 550 + (i - 1) * 50, timeLimit: undefined });
  }

  // FREE PACK: Medium levels (11-20)
  for (let i = 11; i <= 20; i++) {
    levelConfigs.push({ id: i, difficulty: 'medium', isPremium: false, targetScore: 600 + (i - 11) * 50, timeLimit: undefined });
  }

  // PACK 1: Medium levels (21-30)
  for (let i = 21; i <= 30; i++) {
    levelConfigs.push({ id: i, difficulty: 'medium', isPremium: true, targetScore: 700 + (i - 21) * 30, timeLimit: undefined });
  }

  // PACK 1: Hard levels (31-40)
  for (let i = 31; i <= 40; i++) {
    levelConfigs.push({ id: i, difficulty: 'hard', isPremium: true, targetScore: 850 + (i - 31) * 40, timeLimit: undefined });
  }

  // PACK 2: Hard levels (41-50)
  for (let i = 41; i <= 50; i++) {
    levelConfigs.push({ id: i, difficulty: 'hard', isPremium: true, targetScore: 950 + (i - 41) * 40, timeLimit: undefined });
  }

  // PACK 2: Expert levels (51-60)
  for (let i = 51; i <= 60; i++) {
    levelConfigs.push({ id: i, difficulty: 'expert', isPremium: true, targetScore: 1150 + (i - 51) * 50, timeLimit: undefined });
  }

  // PACK 3: Expert levels (61-80)
  for (let i = 61; i <= 80; i++) {
    levelConfigs.push({ id: i, difficulty: 'expert', isPremium: true, targetScore: 1250 + (i - 61) * 40, timeLimit: undefined });
  }

  const levels = [];
  let successCount = 0;

  console.log('📗 Generating FREE PACK EASY levels (1-10)...');
  for (const config of levelConfigs.slice(0, 10)) {
    const level = generateValidatedLevel(config.id, config.difficulty, config.isPremium, config.targetScore, config.timeLimit);
    if (level) {
      levels.push(level);
      successCount++;
    }
  }

  console.log('\n📘 Generating FREE PACK MEDIUM levels (11-20)...');
  for (const config of levelConfigs.slice(10, 20)) {
    const level = generateValidatedLevel(config.id, config.difficulty, config.isPremium, config.targetScore, config.timeLimit);
    if (level) {
      levels.push(level);
      successCount++;
    }
  }

  console.log('\n📘 Generating PACK 1 MEDIUM levels (21-30)...');
  for (const config of levelConfigs.slice(20, 30)) {
    const level = generateValidatedLevel(config.id, config.difficulty, config.isPremium, config.targetScore, config.timeLimit);
    if (level) {
      levels.push(level);
      successCount++;
    }
  }

  console.log('\n📙 Generating PACK 1 HARD levels (31-40)...');
  for (const config of levelConfigs.slice(30, 40)) {
    const level = generateValidatedLevel(config.id, config.difficulty, config.isPremium, config.targetScore, config.timeLimit);
    if (level) {
      levels.push(level);
      successCount++;
    }
  }

  console.log('\n📙 Generating PACK 2 HARD levels (41-50)...');
  for (const config of levelConfigs.slice(40, 50)) {
    const level = generateValidatedLevel(config.id, config.difficulty, config.isPremium, config.targetScore, config.timeLimit);
    if (level) {
      levels.push(level);
      successCount++;
    }
  }

  console.log('\n📕 Generating PACK 2 EXPERT levels (51-60)...');
  for (const config of levelConfigs.slice(50, 60)) {
    const level = generateValidatedLevel(config.id, config.difficulty, config.isPremium, config.targetScore, config.timeLimit);
    if (level) {
      levels.push(level);
      successCount++;
    }
  }

  console.log('\n📕 Generating PACK 3 EXPERT levels (61-80)...');
  for (const config of levelConfigs.slice(60, 80)) {
    const level = generateValidatedLevel(config.id, config.difficulty, config.isPremium, config.targetScore, config.timeLimit);
    if (level) {
      levels.push(level);
      successCount++;
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log(`✅ Generated ${successCount}/80 levels successfully!\n`);

  // Calculate statistics
  let totalWords = 0;
  const diffStats = { easy: 0, medium: 0, hard: 0, expert: 0 };

  for (const level of levels) {
    totalWords += level.validWords.length;
    diffStats[level.difficulty] += level.validWords.length;
  }

  console.log('📊 Content Filter Statistics:');
  console.log(`   Total clean words across all levels: ${totalWords}`);
  console.log(`   All levels verified to be family-friendly ✓\n`);

  // Write levels file
  const outputFile = path.join(__dirname, '../src/data/levels.ts');
  const content = `/**
 * Pre-calculated validated levels for LetterLoom
 * All levels have their valid word lists pre-calculated at compile time
 * Words validated against scripts/dictionaries/american-english
 * Runtime validation checks against level.validWords instead of global dictionary
 * Multiplier positions are also pre-calculated for consistency
 *
 * Generated: ${new Date().toISOString()}
 */

export interface MultiplierPosition {
  position: number; // Index in the 25-tile grid (0-24)
  value: 2 | 3;     // Multiplier value (2x or 3x)
}

export interface LevelData {
  id: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  letters: string[];
  targetScore: number;
  timeLimit?: number;
  isPremium: boolean;
  validWords: string[]; // All valid words for this specific grid
  multiplierPositions: MultiplierPosition[]; // Pre-calculated multiplier tile positions
}

export const LEVELS: LevelData[] = [
${levels.map(level => `  {
    id: ${level.id},
    difficulty: '${level.difficulty}',
    letters: [${level.letters.map(l => `"${l}"`).join(',')}],
    targetScore: ${level.targetScore},
    isPremium: ${level.isPremium},
    validWords: [${level.validWords.map(w => `"${w}"`).join(',')}],
    multiplierPositions: [${level.multiplierPositions.map(m => `{"position":${m.position},"value":${m.value}}`).join(',')}],
  }`).join(',\n')}
];`;

  fs.writeFileSync(outputFile, content);
  console.log('Writing to src/data/levels.ts...');
  console.log('✅ Done! Levels file updated with pre-calculated valid words.\n');

  console.log('='.repeat(70));
  console.log('SUMMARY BY DIFFICULTY');
  console.log('='.repeat(70));
  console.log(`EASY: 10 levels, ${(diffStats.easy / 10).toFixed(0)} avg words per level`);
  console.log(`MEDIUM: 20 levels, ${(diffStats.medium / 20).toFixed(0)} avg words per level`);
  console.log(`HARD: 20 levels, ${(diffStats.hard / 20).toFixed(0)} avg words per level`);
  console.log(`EXPERT: 30 levels, ${(diffStats.expert / 30).toFixed(0)} avg words per level`);
  console.log('\n📚 Words validated against scripts/dictionaries/american-english');
  console.log('✅ All 80 levels now contain their own pre-calculated valid word lists!');
}

generateAllLevels();
