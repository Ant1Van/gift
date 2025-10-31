// Typing configuration
const TYPING_MIN_MS = 36;   // slightly variable speed to feel human
const TYPING_MAX_MS = 78;   // not too fast, not too slow
const PAUSE_AFTER_SENTENCE_MS = 420; // micro pause after ., !, ?
const ERASE_MIN_MS = 14;    // faster than typing to feel natural
const ERASE_MAX_MS = 28;
const PAUSE_AFTER_BREAK_MS = 120; // tiny pause when removing a line break

const textWrapper = document.getElementById('letterText');
const textContentEl = document.getElementById('letterContent');
const caretEl = document.getElementById('caret');
const restartBtn = document.getElementById('restartBtn');

// The love letter text. Use \n for new paragraphs/line breaks.
const letter = (
  "Знаешь, иногда я ловлю себя на мысли, что молчу не потому, что нечего сказать,\n" +
  "а потому что любые слова меркнут рядом с тем, как я чувствую себя рядом с тобой.\n\n" +
  "Я люблю твой голос, когда ты говоришь о самом простом — он делает мир мягче.\n" +
  "Безумно люблю твои глаза.\n" +
  "Люблю твои паузы, в которых есть честность и свет.\n\n" +
  "Мне нравится, что с тобой тишина не гулкая, а тёплая.\n" +
  "И даже будничные вещи рядом с тобой будто обретают вкус — как чай,\n" +
  "который запоминается не сортом, а тем, что мы пили его вместе.\n\n" +
  "Если вдруг у тебя выпадет трудный день, просто вспомни:\n" +
  "я рядом — в словах и между строк, в каждом добром взгляде,\n" +
  "в каждом маленьком «я здесь».\n\n" +
  "Ты — моё тихое счастье."
);

let isTyping = false;
let typingToken = 0; // increments to cancel previous runs atomically

function randomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function typeLetter(text, token) {
  isTyping = true;
  textContentEl.textContent = "";
  caretEl.style.display = 'inline-block';

  for (let i = 0; i < text.length; i++) {
    if (token !== typingToken) return; // cancelled by a newer run

    const ch = text[i];
    textContentEl.textContent += ch;

    // ensure caret stays right after the last character
    if (caretEl.parentElement !== textWrapper) {
      textWrapper.appendChild(caretEl);
    }

    // Slightly longer pause after punctuation or line break
    let delay = randomDelay(TYPING_MIN_MS, TYPING_MAX_MS);
    if (ch === '.' || ch === '!' || ch === '?' || ch === '\n') {
      delay += PAUSE_AFTER_SENTENCE_MS;
    }

    await new Promise(r => setTimeout(r, delay));
  }

  if (token !== typingToken) return; // do not toggle state if superseded
  isTyping = false;
  restartBtn.disabled = false;
  caretEl.style.animation = 'blink 1.05s steps(1, end) infinite';
}

async function eraseLetter(token) {
  isTyping = true;
  caretEl.style.display = 'inline-block';
  while (textContentEl.textContent.length > 0) {
    if (token !== typingToken) return;
    const last = textContentEl.textContent.slice(-1);
    textContentEl.textContent = textContentEl.textContent.slice(0, -1);
    let delay = Math.floor(Math.random() * (ERASE_MAX_MS - ERASE_MIN_MS + 1)) + ERASE_MIN_MS;
    if (last === '\n') delay += PAUSE_AFTER_BREAK_MS;
    await new Promise(r => setTimeout(r, delay));
  }
  if (token !== typingToken) return;
  isTyping = false;
}

function restartTyping() {
  // issue a new token to atomically cancel previous run
  typingToken += 1;
  const token = typingToken;
  restartBtn.disabled = true;
  caretEl.style.display = 'inline-block';
  caretEl.style.animation = 'blink 1.05s steps(1, end) infinite';
  // ensure caret is last inside wrapper
  textWrapper.appendChild(caretEl);
  // If there is text — erase first, then type
  const proceed = async () => {
    if (textContentEl.textContent.length > 0) {
      await eraseLetter(token);
      if (token !== typingToken) return;
    }
    textContentEl.textContent = "";
    await typeLetter(letter, token);
  };
  proceed();
}

restartBtn.addEventListener('click', restartTyping);

// Auto start with a gentle delay for elegance
window.addEventListener('load', () => {
  setTimeout(() => restartTyping(), 420);
});


