/**
 * Validated Level Generator (OPTIMIZED)
 * Generates 60 levels with guaranteed valid English words from the dictionary
 *
 * Run with: node scripts/generateValidatedLevels.js
 */

// Simulate the dictionary (copy from actual dictionary.ts)
const VALID_WORDS = new Set([
  // 3-letter words
  'ace', 'act', 'add', 'age', 'ago', 'aid', 'aim', 'air', 'all', 'and', 'ant', 'any', 'ape', 'arc', 'are', 'ark', 'arm', 'art', 'ash', 'ask', 'ate', 'awe', 'axe', 'aye',
  'bad', 'bag', 'ban', 'bar', 'bat', 'bay', 'bed', 'bee', 'bet', 'bid', 'big', 'bin', 'bit', 'bow', 'box', 'boy', 'bud', 'bug', 'bus', 'but', 'buy',
  'cab', 'cam', 'can', 'cap', 'car', 'cat', 'cob', 'cod', 'cog', 'cop', 'cot', 'cow', 'cry', 'cub', 'cue', 'cup', 'cur', 'cut',
  'dad', 'dam', 'day', 'den', 'dew', 'did', 'die', 'dig', 'dim', 'dip', 'dog', 'dot', 'dry', 'dub', 'dud', 'due', 'dug', 'dye',
  'ear', 'eat', 'eel', 'egg', 'ego', 'elf', 'elk', 'elm', 'emu', 'end', 'era', 'eve', 'eye',
  'fad', 'fan', 'far', 'fat', 'fax', 'fed', 'fee', 'few', 'fig', 'fin', 'fir', 'fit', 'fix', 'fly', 'foe', 'fog', 'for', 'fox', 'fry', 'fun', 'fur',
  'gag', 'gap', 'gas', 'gel', 'gem', 'get', 'gig', 'gin', 'gnu', 'god', 'got', 'gum', 'gun', 'gut', 'guy', 'gym',
  'had', 'hag', 'ham', 'has', 'hat', 'hay', 'hem', 'hen', 'her', 'hew', 'hex', 'hey', 'hid', 'him', 'hip', 'his', 'hit', 'hog', 'hop', 'hot', 'how', 'hub', 'hue', 'hug', 'hum', 'hut',
  'ice', 'icy', 'ill', 'imp', 'ink', 'inn', 'ion', 'ire', 'irk', 'its', 'ivy',
  'jab', 'jag', 'jam', 'jar', 'jaw', 'jay', 'jet', 'jig', 'job', 'jog', 'jot', 'joy', 'jug',
  'keg', 'ken', 'key', 'kid', 'kin', 'kit',
  'lab', 'lad', 'lag', 'lap', 'law', 'lax', 'lay', 'lea', 'led', 'leg', 'let', 'lid', 'lie', 'lip', 'lit', 'log', 'lot', 'low', 'lug',
  'mad', 'man', 'map', 'mar', 'mat', 'maw', 'max', 'may', 'men', 'met', 'mid', 'mix', 'mob', 'mod', 'mom', 'mop', 'mow', 'mud', 'mug', 'mum',
  'nab', 'nag', 'nap', 'net', 'new', 'nib', 'nil', 'nit', 'nod', 'nor', 'not', 'now', 'nub', 'nun', 'nut',
  'oak', 'oar', 'oat', 'odd', 'ode', 'off', 'oft', 'oil', 'old', 'one', 'opt', 'orb', 'ore', 'our', 'out', 'owe', 'owl', 'own',
  'pac', 'pad', 'pal', 'pan', 'pap', 'par', 'pat', 'paw', 'pax', 'pay', 'pea', 'peg', 'pen', 'pep', 'per', 'pet', 'pew', 'pie', 'pig', 'pin', 'pit', 'ply', 'pod', 'pop', 'pot', 'pox', 'pry', 'pub', 'pug', 'pun', 'pup', 'put',
  'rag', 'ram', 'ran', 'rap', 'rat', 'raw', 'ray', 'red', 'ref', 'rep', 'rib', 'rid', 'rig', 'rim', 'rip', 'rob', 'rod', 'roe', 'rot', 'row', 'rub', 'rug', 'rum', 'run', 'rut', 'rye',
  'sac', 'sad', 'sag', 'sap', 'sat', 'saw', 'sax', 'say', 'sea', 'see', 'set', 'sew', 'she', 'shy', 'sin', 'sip', 'sir', 'sis', 'sit', 'six', 'ski', 'sky', 'sly', 'sob', 'sod', 'son', 'sop', 'sot', 'sow', 'sox', 'soy', 'spa', 'spy', 'sty', 'sub', 'sue', 'sum', 'sun', 'sup',
  'tab', 'tad', 'tag', 'tan', 'tap', 'tar', 'tat', 'tax', 'tea', 'ten', 'the', 'thy', 'tic', 'tie', 'tin', 'tip', 'tit', 'toe', 'ton', 'too', 'top', 'tot', 'tow', 'toy', 'try', 'tub', 'tug', 'tux', 'two',
  'ugh', 'ump', 'urn', 'use',
  'van', 'vat', 'vet', 'vex', 'via', 'vie', 'vow',
  'wad', 'wag', 'war', 'was', 'wax', 'way', 'web', 'wed', 'wee', 'wet', 'who', 'why', 'wig', 'win', 'wit', 'woe', 'wok', 'won', 'woo', 'wow',
  'yak', 'yam', 'yap', 'yaw', 'yea', 'yen', 'yes', 'yet', 'yew', 'yin', 'you', 'yow',
  'zap', 'zen', 'zip', 'zit', 'zoo',

  // 4-letter words (common ones) - abbreviated for space
  'able', 'acid', 'aged', 'also', 'area', 'army', 'away', 'baby', 'back', 'ball', 'band', 'bank', 'base', 'bath', 'bear', 'beat', 'been', 'beer', 'bell', 'belt', 'bent', 'best', 'bill', 'bird', 'bite', 'blow', 'blue', 'boat', 'body', 'bone', 'book', 'born', 'both', 'bowl', 'bulk', 'burn', 'bush', 'busy', 'cage', 'cake', 'call', 'calm', 'came', 'camp', 'card', 'care', 'cart', 'case', 'cash', 'cast', 'cell', 'chat', 'chip', 'city', 'clay', 'club', 'coal', 'coat', 'code', 'cold', 'come', 'cool', 'cope', 'copy', 'core', 'corn', 'cost', 'crew', 'crop', 'dare', 'dark', 'data', 'date', 'dawn', 'days', 'dead', 'deal', 'dean', 'dear', 'debt', 'deep', 'deny', 'desk', 'diet', 'disc', 'disk', 'does', 'done', 'door', 'dose', 'down', 'draw', 'drew', 'drop', 'drug', 'dual', 'dull', 'dust', 'duty', 'each', 'earn', 'ease', 'east', 'easy', 'edge', 'edit', 'else', 'even', 'ever', 'evil', 'exit', 'face', 'fact', 'fail', 'fair', 'fall', 'fame', 'fare', 'farm', 'fast', 'fate', 'fear', 'feed', 'feel', 'feet', 'fell', 'felt', 'file', 'fill', 'film', 'find', 'fine', 'fire', 'firm', 'fish', 'five', 'flag', 'flat', 'fled', 'flow', 'folk', 'food', 'foot', 'ford', 'form', 'fort', 'four', 'free', 'from', 'fuel', 'full', 'fund', 'gain', 'game', 'gate', 'gave', 'gear', 'gene', 'gift', 'girl', 'give', 'glad', 'goal', 'goes', 'gold', 'golf', 'gone', 'good', 'gray', 'grew', 'grey', 'grid', 'grow', 'gulf', 'half', 'hall', 'hand', 'hang', 'hard', 'harm', 'hate', 'have', 'head', 'hear', 'heat', 'held', 'hell', 'help', 'here', 'hero', 'hide', 'high', 'hill', 'hire', 'hold', 'hole', 'holy', 'home', 'hope', 'host', 'hour', 'huge', 'hung', 'hunt', 'hurt', 'idea', 'inch', 'into', 'iron', 'item', 'jack', 'jane', 'jazz', 'jean', 'john', 'join', 'joke', 'jump', 'june', 'jury', 'just', 'keen', 'keep', 'kent', 'kept', 'kick', 'kill', 'kind', 'king', 'knee', 'knew', 'know', 'lack', 'lady', 'laid', 'lake', 'land', 'lane', 'last', 'late', 'lead', 'left', 'lend', 'lens', 'less', 'lest', 'life', 'lift', 'like', 'line', 'link', 'list', 'live', 'load', 'loan', 'lock', 'long', 'look', 'lord', 'lose', 'loss', 'lost', 'lots', 'loud', 'love', 'luck', 'made', 'mail', 'main', 'make', 'male', 'mall', 'many', 'mark', 'mass', 'mate', 'math', 'meal', 'mean', 'meat', 'meet', 'menu', 'mere', 'mike', 'mild', 'mile', 'milk', 'mill', 'mind', 'mine', 'miss', 'mode', 'moon', 'more', 'most', 'move', 'much', 'must', 'myth', 'name', 'navy', 'near', 'neck', 'need', 'news', 'next', 'nice', 'nine', 'none', 'noon', 'nose', 'note', 'once', 'only', 'onto', 'open', 'oral', 'over', 'pace', 'pack', 'page', 'paid', 'pain', 'pair', 'pale', 'palm', 'park', 'part', 'pass', 'past', 'path', 'peak', 'pick', 'pile', 'pine', 'pink', 'pipe', 'plan', 'play', 'plot', 'plus', 'poem', 'poet', 'pole', 'poll', 'pond', 'pool', 'poor', 'pope', 'port', 'pose', 'post', 'pour', 'pray', 'prey', 'pure', 'push', 'race', 'rail', 'rain', 'rank', 'rare', 'rate', 'read', 'real', 'rear', 'rely', 'rent', 'rest', 'rice', 'rich', 'ride', 'ring', 'rise', 'risk', 'road', 'rock', 'role', 'roll', 'rome', 'roof', 'room', 'root', 'rope', 'rose', 'rule', 'rush', 'ruth', 'safe', 'sage', 'said', 'sail', 'sake', 'sale', 'salt', 'same', 'sand', 'save', 'seat', 'seed', 'seek', 'seem', 'seen', 'self', 'sell', 'send', 'sent', 'ship', 'shop', 'shot', 'show', 'shut', 'sick', 'side', 'sign', 'sing', 'sink', 'site', 'size', 'skin', 'slip', 'slow', 'snow', 'soft', 'soil', 'sold', 'sole', 'some', 'song', 'soon', 'sort', 'soul', 'spot', 'star', 'stay', 'stem', 'step', 'stop', 'such', 'suit', 'sure', 'take', 'tale', 'talk', 'tall', 'tank', 'tape', 'task', 'team', 'tear', 'tell', 'tend', 'term', 'test', 'text', 'than', 'that', 'them', 'then', 'they', 'thin', 'this', 'thus', 'tide', 'tied', 'tier', 'till', 'time', 'tiny', 'told', 'toll', 'tone', 'took', 'tool', 'tops', 'torn', 'tour', 'town', 'tree', 'trim', 'trip', 'true', 'tune', 'turn', 'twin', 'type', 'unit', 'upon', 'used', 'user', 'vary', 'vast', 'very', 'vice', 'view', 'vote', 'wage', 'wait', 'wake', 'walk', 'wall', 'want', 'ward', 'warm', 'warn', 'wash', 'wave', 'ways', 'weak', 'wear', 'week', 'well', 'went', 'were', 'west', 'what', 'when', 'whom', 'wide', 'wife', 'wild', 'will', 'wind', 'wine', 'wing', 'wire', 'wise', 'wish', 'with', 'wood', 'word', 'wore', 'work', 'worn', 'yard', 'yeah', 'year', 'york', 'your', 'zero', 'zone',

  // 5+ letter words (selection)
  'about', 'above', 'abuse', 'actor', 'acute', 'admit', 'adopt', 'adult', 'after', 'again', 'agent', 'agree', 'ahead', 'alarm', 'album', 'alert', 'alike', 'alive', 'allow', 'alone', 'along', 'alter', 'among', 'angel', 'anger', 'angle', 'angry', 'apart', 'apple', 'apply', 'arena', 'argue', 'arise', 'array', 'aside', 'asset', 'avoid', 'awake', 'award', 'aware', 'badly', 'baker', 'bases', 'basic', 'basis', 'beach', 'began', 'begin', 'being', 'below', 'bench', 'billy', 'birth', 'black', 'blade', 'blame', 'blind', 'block', 'blood', 'board', 'boost', 'booth', 'bound', 'brain', 'brand', 'brave', 'bread', 'break', 'breed', 'brief', 'bring', 'broad', 'broke', 'brown', 'build', 'built', 'buyer', 'cable', 'calif', 'carry', 'catch', 'cause', 'chain', 'chair', 'chaos', 'charm', 'chart', 'chase', 'cheap', 'check', 'chest', 'chief', 'child', 'china', 'chose', 'civil', 'claim', 'class', 'clean', 'clear', 'click', 'climb', 'clock', 'close', 'cloud', 'coach', 'coast', 'could', 'count', 'court', 'cover', 'crack', 'craft', 'crash', 'crazy', 'cream', 'crime', 'cross', 'crowd', 'crown', 'crude', 'curve', 'cycle', 'daily', 'dance', 'dated', 'dealt', 'death', 'debut', 'delay', 'delta', 'dense', 'depot', 'depth', 'doing', 'doubt', 'dozen', 'draft', 'drama', 'drank', 'drawn', 'dream', 'dress', 'drill', 'drink', 'drive', 'drove', 'dying', 'eager', 'early', 'earth', 'eight', 'elect', 'elite', 'empty', 'enemy', 'enjoy', 'enter', 'entry', 'equal', 'error', 'event', 'every', 'exact', 'exist', 'extra', 'faith', 'false', 'fault', 'fiber', 'field', 'fifth', 'fifty', 'fight', 'final', 'first', 'fixed', 'flash', 'fleet', 'floor', 'fluid', 'focus', 'force', 'forth', 'forty', 'forum', 'found', 'frame', 'frank', 'fraud', 'fresh', 'front', 'fruit', 'fully', 'funny', 'giant', 'given', 'glass', 'globe', 'going', 'grace', 'grade', 'grand', 'grant', 'grass', 'great', 'green', 'gross', 'group', 'grown', 'guard', 'guess', 'guest', 'guide', 'happy', 'harry', 'heart', 'heavy', 'hence', 'henry', 'horse', 'hotel', 'house', 'human', 'ideal', 'image', 'imply', 'index', 'inner', 'input', 'issue', 'japan', 'jimmy', 'joint', 'jones', 'judge', 'known', 'label', 'large', 'laser', 'later', 'laugh', 'layer', 'learn', 'lease', 'least', 'leave', 'legal', 'lemon', 'level', 'lewis', 'light', 'limit', 'links', 'lives', 'local', 'logic', 'loose', 'lotus', 'louis', 'lower', 'loyal', 'lucky', 'lunch', 'lying', 'magic', 'major', 'maker', 'march', 'maria', 'match', 'maybe', 'mayor', 'meant', 'media', 'metal', 'might', 'minor', 'minus', 'mixed', 'model', 'money', 'month', 'moral', 'motor', 'mount', 'mouse', 'mouth', 'movie', 'music', 'needs', 'never', 'newly', 'night', 'noble', 'noise', 'north', 'noted', 'novel', 'nurse', 'occur', 'ocean', 'offer', 'often', 'order', 'other', 'ought', 'paint', 'panel', 'paper', 'party', 'peace', 'peter', 'phase', 'phone', 'photo', 'piano', 'piece', 'pilot', 'pitch', 'place', 'plain', 'plane', 'plant', 'plate', 'point', 'pound', 'power', 'press', 'price', 'pride', 'prime', 'print', 'prior', 'prize', 'proof', 'proud', 'prove', 'queen', 'quick', 'quiet', 'quite', 'quote', 'radio', 'raise', 'range', 'rapid', 'ratio', 'reach', 'ready', 'refer', 'right', 'rival', 'river', 'robin', 'roger', 'roman', 'rough', 'round', 'route', 'royal', 'rural', 'scale', 'scene', 'scope', 'score', 'sense', 'serve', 'seven', 'shall', 'shape', 'share', 'sharp', 'sheet', 'shelf', 'shell', 'shift', 'shine', 'shirt', 'shock', 'shoot', 'short', 'shown', 'sight', 'since', 'sixth', 'sixty', 'sized', 'skill', 'sleep', 'slide', 'small', 'smart', 'smile', 'smith', 'smoke', 'solid', 'solve', 'sorry', 'sound', 'south', 'space', 'spare', 'speak', 'speed', 'spend', 'spent', 'split', 'spoke', 'sport', 'staff', 'stage', 'stake', 'stand', 'start', 'state', 'steam', 'steel', 'stick', 'still', 'stock', 'stone', 'stood', 'store', 'storm', 'story', 'strip', 'stuck', 'study', 'stuff', 'style', 'sugar', 'suite', 'super', 'sweet', 'table', 'taken', 'taste', 'taxes', 'teach', 'terry', 'texas', 'thank', 'theft', 'their', 'theme', 'there', 'these', 'thick', 'thing', 'think', 'third', 'those', 'three', 'threw', 'throw', 'tight', 'times', 'tired', 'title', 'today', 'topic', 'total', 'touch', 'tough', 'tower', 'track', 'trade', 'trail', 'train', 'trait', 'treat', 'trend', 'trial', 'tribe', 'tried', 'tries', 'truck', 'truly', 'trump', 'trust', 'truth', 'twice', 'under', 'undue', 'union', 'unity', 'until', 'upper', 'upset', 'urban', 'usage', 'usual', 'valid', 'value', 'video', 'virus', 'visit', 'vital', 'vocal', 'voice', 'waste', 'watch', 'water', 'wheel', 'where', 'which', 'while', 'white', 'whole', 'whose', 'woman', 'women', 'world', 'worry', 'worse', 'worst', 'worth', 'would', 'wound', 'write', 'wrong', 'wrote', 'young', 'youth',

  // 6+ letter words
  'puzzle', 'letter', 'score', 'point', 'bonus', 'level', 'challenge', 'victory', 'winner', 'forest', 'nature', 'garden', 'flower', 'mountain', 'river', 'ocean', 'sunset', 'sunrise', 'rainbow', 'crystal', 'emerald', 'silver', 'golden',
]);

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

// OPTIMIZED: Reduced max depth and added early termination
function findPossibleWords(letters, minWords) {
  const letterObjs = letters.map((letter, i) => ({
    letter,
    position: { x: i % 5, y: Math.floor(i / 5) },
    id: i
  }));

  const possibleWords = new Set();
  const targetWords = minWords * 1.5; // Early termination when we have 1.5x minimum

  function generateCombinations(current, remaining) {
    // Early termination if we found enough words
    if (possibleWords.size >= targetWords) {
      return;
    }

    if (current.length >= 3) {
      const word = current.map(l => l.letter).join('');
      if (isValidWord(word)) {
        possibleWords.add(word.toUpperCase());
      }
    }

    // OPTIMIZATION: Reduced from 12 to 8
    if (current.length >= 8) return;

    for (let i = 0; i < remaining.length; i++) {
      // Early exit if we have enough words
      if (possibleWords.size >= targetWords) {
        return;
      }

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

function generateValidatedLevel(levelNumber, difficulty, isPremium, targetScore, timeLimit) {
  const minWords = { easy: 20, medium: 15, hard: 12, expert: 10 }[difficulty];
  let attempts = 0;
  const maxAttempts = 100; // Reduced from 1000

  while (attempts < maxAttempts) {
    attempts++;
    const letters = generateLetterGrid(difficulty);
    const words = findPossibleWords(letters, minWords);

    if (words.length >= minWords) {
      console.log(`✅ Level ${levelNumber} (${difficulty}): ${words.length} words found on attempt ${attempts}`);
      console.log(`   Sample words: ${words.slice(0, 5).join(', ')}`);
      return { id: levelNumber, difficulty, letters, targetScore, timeLimit, isPremium, words };
    }

    if (attempts % 10 === 0) {
      console.log(`   Attempt ${attempts}: ${words.length} words (need ${minWords})`);
    }
  }

  console.log(`❌ Level ${levelNumber}: Could not generate valid level after ${maxAttempts} attempts`);
  return null;
}

console.log('🔧 Generating 60 validated levels (OPTIMIZED)...\n');
console.log('='.repeat(70));

const levels = [];

// Easy levels (1-10)
console.log('\n📗 Generating EASY levels (1-10)...');
for (let i = 1; i <= 10; i++) {
  const targetScore = Math.floor(500 * (1 + i * 0.1));
  const level = generateValidatedLevel(i, 'easy', false, targetScore, undefined);
  if (level) levels.push(level);
}

// Medium levels (11-30)
console.log('\n📘 Generating MEDIUM levels (11-30)...');
for (let i = 11; i <= 30; i++) {
  const isPremium = i >= 21;
  const targetScore = Math.floor(500 * 1.5 * (1 + i * 0.1));
  const level = generateValidatedLevel(i, 'medium', isPremium, targetScore, undefined);
  if (level) levels.push(level);
}

// Hard levels (31-50)
console.log('\n📙 Generating HARD levels (31-50)...');
for (let i = 31; i <= 50; i++) {
  const targetScore = Math.floor(500 * 2 * (1 + i * 0.1));
  const timeLimit = 180 - i * 2;
  const level = generateValidatedLevel(i, 'hard', true, targetScore, timeLimit);
  if (level) levels.push(level);
}

// Expert levels (51-60)
console.log('\n📕 Generating EXPERT levels (51-60)...');
for (let i = 51; i <= 60; i++) {
  const targetScore = Math.floor(500 * 2.5 * (1 + i * 0.1));
  const timeLimit = 180 - i * 2;
  const level = generateValidatedLevel(i, 'expert', true, targetScore, timeLimit);
  if (level) levels.push(level);
}

console.log('\n' + '='.repeat(70));
console.log(`✅ Generated ${levels.length}/60 levels successfully!\n`);

// Generate TypeScript file content
const tsContent = `/**
 * Pre-calculated validated levels for LetterLoom
 * All levels have been validated against the English dictionary
 * Each level is guaranteed to have a minimum number of valid words
 *
 * Generated: ${new Date().toISOString()}
 */

export interface LevelData {
  id: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  letters: string[];
  targetScore: number;
  timeLimit?: number;
  isPremium: boolean;
}

export const LEVELS: LevelData[] = [
${levels.map(level => `  {
    id: ${level.id},
    difficulty: '${level.difficulty}',
    letters: ${JSON.stringify(level.letters)},
    targetScore: ${level.targetScore},${level.timeLimit ? `\n    timeLimit: ${level.timeLimit},` : ''}
    isPremium: ${level.isPremium},
  }`).join(',\n')}
];
`;

console.log('Writing to src/data/levels.ts...');
const fs = require('fs');
fs.writeFileSync('src/data/levels.ts', tsContent);
console.log('✅ Done! Levels file updated with validated levels.\n');

// Print summary
console.log('='.repeat(70));
console.log('SUMMARY BY DIFFICULTY');
console.log('='.repeat(70));
const summary = levels.reduce((acc, level) => {
  if (!acc[level.difficulty]) acc[level.difficulty] = { count: 0, totalWords: 0 };
  acc[level.difficulty].count++;
  acc[level.difficulty].totalWords += level.words.length;
  return acc;
}, {});

Object.entries(summary).forEach(([diff, stats]) => {
  console.log(`${diff.toUpperCase()}: ${stats.count} levels, avg ${Math.floor(stats.totalWords / stats.count)} words per level`);
});
