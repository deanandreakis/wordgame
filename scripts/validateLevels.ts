/**
 * Level Validation Script
 * Checks all pre-calculated levels to ensure they have enough valid words
 */

import {LEVELS} from '../src/data/levels';
import {createLetterGrid, findPossibleWords} from '../src/utils/gameLogic';

interface ValidationResult {
  levelId: number;
  difficulty: string;
  targetScore: number;
  wordCount: number;
  words: string[];
  status: 'PASS' | 'FAIL' | 'WARNING';
  issues: string[];
}

const MIN_WORDS_BY_DIFFICULTY = {
  easy: 20,
  medium: 15,
  hard: 12,
  expert: 10,
};

function validateLevel(levelData: any): ValidationResult {
  const letters = createLetterGrid(levelData.letters);
  const possibleWords = findPossibleWords(letters);
  const issues: string[] = [];

  const minWords = MIN_WORDS_BY_DIFFICULTY[levelData.difficulty as keyof typeof MIN_WORDS_BY_DIFFICULTY];

  if (possibleWords.length < minWords) {
    issues.push(`Only ${possibleWords.length} words found (need ${minWords})`);
  }

  if (possibleWords.length === 0) {
    issues.push('NO VALID WORDS FOUND!');
  }

  const status = issues.length === 0 ? 'PASS' :
                 possibleWords.length === 0 ? 'FAIL' : 'WARNING';

  return {
    levelId: levelData.id,
    difficulty: levelData.difficulty,
    targetScore: levelData.targetScore,
    wordCount: possibleWords.length,
    words: possibleWords.sort((a, b) => b.length - a.length).slice(0, 10), // Top 10 longest words
    status,
    issues,
  };
}

console.log('🔍 Validating all 60 levels...\n');

const results: ValidationResult[] = [];
let passCount = 0;
let warnCount = 0;
let failCount = 0;

for (const level of LEVELS) {
  const result = validateLevel(level);
  results.push(result);

  if (result.status === 'PASS') {
    passCount++;
    console.log(`✅ Level ${result.levelId} (${result.difficulty}): ${result.wordCount} words`);
  } else if (result.status === 'WARNING') {
    warnCount++;
    console.log(`⚠️  Level ${result.levelId} (${result.difficulty}): ${result.wordCount} words - ${result.issues.join(', ')}`);
  } else {
    failCount++;
    console.log(`❌ Level ${result.levelId} (${result.difficulty}): ${result.issues.join(', ')}`);
  }
}

console.log('\n' + '='.repeat(60));
console.log('VALIDATION SUMMARY');
console.log('='.repeat(60));
console.log(`✅ PASS:    ${passCount}/60 levels`);
console.log(`⚠️  WARNING: ${warnCount}/60 levels`);
console.log(`❌ FAIL:    ${failCount}/60 levels`);

// Show detailed report for failures
if (failCount > 0) {
  console.log('\n' + '='.repeat(60));
  console.log('FAILED LEVELS (need regeneration)');
  console.log('='.repeat(60));
  results.filter(r => r.status === 'FAIL').forEach(r => {
    console.log(`\nLevel ${r.levelId} (${r.difficulty}):`);
    console.log(`  Letters: ${LEVELS.find(l => l.id === r.levelId)?.letters.join('')}`);
    console.log(`  Issues: ${r.issues.join(', ')}`);
  });
}

// Show levels that passed with word samples
console.log('\n' + '='.repeat(60));
console.log('SAMPLE WORDS FROM PASSING LEVELS');
console.log('='.repeat(60));
results.filter(r => r.status === 'PASS').slice(0, 5).forEach(r => {
  console.log(`\nLevel ${r.levelId} (${r.difficulty}) - ${r.wordCount} total words:`);
  console.log(`  Top words: ${r.words.slice(0, 5).join(', ')}`);
});
