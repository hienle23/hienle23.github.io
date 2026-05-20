// ===== STATE =====
const state = {
  player: null,       // 'leo' or 'marco'
  score: 0,
  stepIndex: 0,
  history: [],
  progress: 0,
};

// ===== STORY DATA =====
const CHARS = {
  leo:   { name: 'Gideon', img: 'gideon.svg', color: '#f43f5e' },
  marco: { name: 'Benji',  img: 'benji.svg',  color: '#8b5cf6' },
  kai:   { name: 'Kai',          emoji: '☕', color: '#f59e0b' },
  narrator: { name: 'Narrator',  emoji: '' },
};

// Each step: { id, type: 'narrate'|'dialogue'|'choice', ... }
const STORY = [
  // ——— ACT 1: THE MEET-CUTE ———
  {
    id: 'intro',
    type: 'narrate',
    location: 'Velvet Grounds Coffee Shop · Seoul',
    time: 'Thursday, 8:47 AM',
    text: 'It\'s a perfectly ordinary Thursday — the kind that smells like roasted coffee and unmet deadlines. You\'re already running seven minutes late to your own life.',
    next: 'intro2',
  },
  {
    id: 'intro2',
    type: 'narrate',
    text: 'The bell above the café door jingles. And then — of course — the universe decides today is the day it gets involved in your love life.',
    next: 'meetcute',
  },
  {
    id: 'meetcute',
    type: 'narrate',
    text: 'A guy walks in carrying a rolled-up set of blueprints, a travel mug already in hand (the audacity), and a jawline that should honestly be illegal before noon. He\'s looking at his phone and not at where he\'s going.',
    next: 'collision',
  },
  {
    id: 'collision',
    type: 'narrate',
    location: 'Velvet Grounds · Front Counter',
    time: 'Still Thursday',
    text: 'You both reach for the last blueberry scone at the exact same moment. Your hands touch. His eyes flick up to yours. Time does that annoying slow-motion thing.',
    next: 'scone_choice',
  },
  {
    id: 'scone_choice',
    type: 'choice',
    text: 'The last blueberry scone. His hand. Your hand. The universe holding its breath.',
    choices: [
      {
        icon: '🎭',
        text: 'Dramatically say: "I\'ve been waiting for this scone my entire life. I hope you understand."',
        score: 10,
        next: 'leo_drama',
      },
      {
        icon: '😅',
        text: 'Nervously laugh, let go, and say: "It\'s yours. I didn\'t even want it. I hate scones."',
        score: 5,
        next: 'nervous_retreat',
      },
      {
        icon: '🤝',
        text: 'Confidently say: "Split it? I\'m Gideon/Benji by the way." and extend your free hand.',
        score: 15,
        next: 'split_scone',
      },
    ],
  },
  // — Branch A: Drama —
  {
    id: 'leo_drama',
    type: 'dialogue',
    speaker: 'stranger',
    text: '"That\'s... a lot of emotional weight for a baked good." He\'s smiling though. A real one, not polite. "I\'m Benji. And this scone is not worth dying on a hill for — but I respect the commitment."',
    next: 'intro_names',
  },
  // — Branch B: Nervous retreat —
  {
    id: 'nervous_retreat',
    type: 'dialogue',
    speaker: 'stranger',
    text: '"You hate scones?" He raises an eyebrow. "Then why were you speed-walking toward this one like it owed you money?"',
    next: 'caught_choice',
  },
  {
    id: 'caught_choice',
    type: 'choice',
    text: 'Busted. He\'s got you.',
    choices: [
      {
        icon: '😂',
        text: '"Fine. I lied. I would commit minor crimes for this scone."',
        score: 10,
        next: 'intro_names',
      },
      {
        icon: '🚪',
        text: 'Grab a plain croissant instead and pretend this never happened.',
        score: 0,
        next: 'croissant_escape',
      },
    ],
  },
  {
    id: 'croissant_escape',
    type: 'narrate',
    text: 'You grab a croissant. It\'s fine. Everything is fine. You definitely don\'t think about that jawline for the rest of the day. (You do.)',
    next: 'day_later',
  },
  {
    id: 'day_later',
    type: 'narrate',
    location: 'Velvet Grounds · Next Friday',
    time: 'Friday, 8:44 AM',
    text: 'You come back three minutes earlier this time. Just in case. The blueberry scones are gone. He\'s not here. But on the counter, a sticky note reads: "Saved you one. — M" with a phone number.',
    next: 'sticky_note_choice',
  },
  {
    id: 'sticky_note_choice',
    type: 'choice',
    text: 'A sticky note. A phone number. The scone sitting there like a tiny miracle.',
    choices: [
      {
        icon: '📱',
        text: 'Text the number immediately: "I\'m at the scone. Come meet me again."',
        score: 15,
        next: 'split_scone',
      },
      {
        icon: '✍️',
        text: 'Leave a note back: "Worth waiting for. Both the scone and you, probably. —L/M"',
        score: 12,
        next: 'note_exchange',
      },
    ],
  },
  {
    id: 'note_exchange',
    type: 'narrate',
    text: 'You leave the note. You eat the scone. You feel ridiculous and wonderful. Your phone buzzes twenty minutes later: "\'Probably\' is doing a lot of work there. Coffee tomorrow? 8:47, same spot."',
    next: 'split_scone',
  },
  // — Branch C: Split scone —
  {
    id: 'split_scone',
    type: 'narrate',
    location: 'Corner Table · Velvet Grounds',
    time: 'Same morning',
    text: 'You split the scone. He introduces himself — Benji, architect, "accidentally funny" by his own admission. You introduce yourself. He says your name once, slowly, like he\'s deciding if he likes the sound of it. He does.',
    next: 'intro_names',
  },
  {
    id: 'intro_names',
    type: 'dialogue',
    speaker: 'marco',
    text: '"So. You always fight strangers for pastries, or is today special?"',
    next: 'comeback_choice',
  },
  {
    id: 'comeback_choice',
    type: 'choice',
    text: 'He\'s teasing you. And you love it already.',
    choices: [
      {
        icon: '✨',
        text: '"Only when the stranger is worth fighting. Jury\'s still out on you."',
        score: 15,
        next: 'coffee_date',
      },
      {
        icon: '☕',
        text: '"Can I buy you a proper coffee? To apologize for the scone incident."',
        score: 10,
        next: 'coffee_date',
      },
      {
        icon: '📓',
        text: '"I\'m actually writing a novel about a man who loses everything in a scone dispute. Research."',
        score: 8,
        next: 'novel_tangent',
      },
    ],
  },
  {
    id: 'novel_tangent',
    type: 'dialogue',
    speaker: 'marco',
    text: '"That is either the best or worst premise I\'ve ever heard." He sits down across from you, uninvited, like he owns the chair. "Tell me about this scone dispute. I need to know everything."',
    next: 'coffee_date',
  },
  // ——— ACT 2: FIRST DATE ———
  {
    id: 'coffee_date',
    type: 'narrate',
    location: 'Golden Gate Park · San Francisco',
    time: 'Saturday, 6:00 PM',
    text: 'He texts you an address at 5:58. Not a restaurant. Golden Gate Park — two coffees already in hand, a bench with a view of the eucalyptus trees and the distant bay, and the smug confidence of someone who planned this perfectly.',
    next: 'date_reaction',
  },
  {
    id: 'date_reaction',
    type: 'choice',
    text: 'He hands you a coffee and says: "I Googled your regular order. Hope that\'s not creepy."',
    choices: [
      {
        icon: '🥹',
        text: '"That\'s either incredibly sweet or mildly alarming. I\'m going with sweet."',
        score: 15,
        next: 'date_flow',
      },
      {
        icon: '😏',
        text: '"You Googled me? What else did you find?"',
        score: 12,
        next: 'date_google',
      },
      {
        icon: '🌊',
        text: 'Take the coffee without a word and look at the river so he can\'t see you smiling.',
        score: 10,
        next: 'date_flow',
      },
    ],
  },
  {
    id: 'date_google',
    type: 'dialogue',
    speaker: 'marco',
    text: '"That you once live-tweeted your own disastrous attempt at making macarons. Forty-seven tweets. The hashtag #MacaronMurder was trending in your friend group." He\'s definitely been following you for a while.',
    next: 'date_flow',
  },
  {
    id: 'date_flow',
    type: 'narrate',
    location: 'Golden Gate Park · The Bench',
    time: 'Two hours later',
    text: 'You talk until the park goes dark and the city lights flicker on across the bay. He laughs too loudly at your stories. You pretend not to love it. You\'re terrible at pretending.',
    next: 'almost_moment',
  },
  {
    id: 'almost_moment',
    type: 'dialogue',
    speaker: 'marco',
    text: '"Hey." He turns to look at you, close enough that you can see the city lights reflected in his eyes. "I want to say something, and I need you to not make it weird."',
    next: 'almost_choice',
  },
  {
    id: 'almost_choice',
    type: 'choice',
    text: 'Your heart is doing something medically irresponsible.',
    choices: [
      {
        icon: '💀',
        text: '"I can\'t promise that. I make everything weird. It\'s my brand."',
        score: 12,
        next: 'confession',
      },
      {
        icon: '🤫',
        text: 'Say nothing. Just hold eye contact. Let the moment breathe.',
        score: 15,
        next: 'confession',
      },
      {
        icon: '🫣',
        text: '"Oh no. Is this where you tell me you\'re actually married to the scone?"',
        score: 8,
        next: 'deflect_confession',
      },
    ],
  },
  {
    id: 'deflect_confession',
    type: 'dialogue',
    speaker: 'marco',
    text: '"The scone and I are just friends." He laughs, shakes his head. "I was going to say I think I like you. But sure, let\'s do the scone thing first."',
    next: 'confession',
  },
  {
    id: 'confession',
    type: 'dialogue',
    speaker: 'marco',
    text: '"I think you\'re the most interesting person I\'ve met in years. And I meet a lot of people." A pause. "I want to do this again. As many times as you\'ll let me."',
    next: 'confession_choice',
  },
  {
    id: 'confession_choice',
    type: 'choice',
    text: 'He said it. He actually said it. The river is very beautiful right now.',
    choices: [
      {
        icon: '💕',
        text: '"I was going to play it cool for at least three more dates. You ruined my plan."',
        score: 15,
        next: 'good_ending_path',
      },
      {
        icon: '🌹',
        text: 'Lean over and kiss him instead. Some things don\'t need words.',
        score: 20,
        next: 'perfect_ending_path',
      },
      {
        icon: '🤔',
        text: '"I need to think about it. Can we get more coffee first?"',
        score: 5,
        next: 'slow_burn_path',
      },
    ],
  },
  // ——— ACT 3: ENDINGS ———
  {
    id: 'slow_burn_path',
    type: 'narrate',
    location: 'Velvet Grounds · Three Weeks Later',
    time: 'Still technically Thursday',
    text: 'You make him wait — not out of cruelty, but because you needed to be sure. He waits. He saves you scones every single Thursday. He doesn\'t push. When you\'re finally sure, you walk in and say: "I thought about it." He already knows. He\'s been smiling since you walked through the door.',
    next: 'slow_burn_ending',
  },
  {
    id: 'slow_burn_ending',
    type: 'ending',
    endingId: 'slowburn',
  },
  {
    id: 'good_ending_path',
    type: 'narrate',
    location: 'Golden Gate Park · The Bench',
    time: 'That same magical evening',
    text: '"You had a plan?" He looks delighted. "What was it?" You tell him it involved being mysterious and unavailable for exactly twenty-one days. He says that sounds exhausting. You agree. You both stay on the bench until they turn the park lights off.',
    next: 'good_ending',
  },
  {
    id: 'good_ending',
    type: 'ending',
    endingId: 'goodending',
  },
  {
    id: 'perfect_ending_path',
    type: 'narrate',
    location: 'Golden Gate Park · The Bench',
    time: 'The exact right moment',
    text: 'It\'s a good kiss. The kind that rewrites Thursday from "ordinary day" to "the day everything changed." When you pull back, he\'s laughing softly, slightly stunned. "That was not what I expected." "Did you like it?" "I\'m going to need about fifty more to form a proper opinion."',
    next: 'perfect_ending',
  },
  {
    id: 'perfect_ending',
    type: 'ending',
    endingId: 'perfectending',
  },
];

// ===== ENDING DEFINITIONS =====
const ENDINGS = {
  slowburn: {
    badge: '🕯️',
    title: 'The Long Game',
    subtitle: '"Some love stories simmer before they catch fire."',
    story: 'You took your time, and it was worth every second. Benji learned patience. You learned to trust the slow, steady warmth of something real. Six months later, he\'ll design you a reading nook in his apartment. You\'ll call it "our corner." He\'ll pretend he doesn\'t cry when you say that. He absolutely cries.',
    scoreLabel: 'Slow Burn Energy',
    minScore: 0,
  },
  goodending: {
    badge: '🌙',
    title: 'Bench in the Dark',
    subtitle: '"The best conversations are the ones that end with the lights turning off around you."',
    story: 'You stayed on that bench until a park employee politely asked if you were okay. You were better than okay. You were the beginning of something. Benji texts you the next morning: "Still thinking about last night." You text back: "Same." It\'s the most honest thing you\'ve ever said.',
    scoreLabel: 'Romance Points',
    minScore: 0,
  },
  perfectending: {
    badge: '✨',
    title: 'The First Kiss Fix',
    subtitle: '"You didn\'t need fifty more. One was enough. But fifty was nice."',
    story: 'You kissed a stranger over a scone, and it turned out to be the best decision your hands ever made. Three months later, his desk has a sticky note that says "Scone Incident: Day 92." He\'s been counting. You\'ve been counting too. You just didn\'t tell him until now.',
    scoreLabel: 'Chaos Cupid Score',
    minScore: 0,
  },
};

// ===== HELPERS =====
function $(id) { return document.getElementById(id); }

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
  });
  const el = $(id);
  if (el) {
    el.classList.add('active');
    el.classList.add('fade-in');
    setTimeout(() => el.classList.remove('fade-in'), 600);
  }
}

function spawnHearts() {
  const container = $('floatingHearts');
  if (!container) return;
  const hearts = ['💕', '💗', '✨', '🌸', '💝', '⭐', '🌷', '💖'];
  for (let i = 0; i < 18; i++) {
    const h = document.createElement('div');
    h.className = 'heart-particle';
    h.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    h.style.left = Math.random() * 100 + 'vw';
    h.style.animationDelay = Math.random() * 6 + 's';
    h.style.animationDuration = (4 + Math.random() * 4) + 's';
    h.style.fontSize = (0.8 + Math.random() * 1.2) + 'rem';
    container.appendChild(h);
  }
}

// ===== PUBLIC: SPLASH =====
function startStory() {
  showScreen('charSelect');
}

// ===== PUBLIC: CHAR SELECT =====
function selectChar(char) {
  state.player = char;
  state.score = 0;
  state.stepIndex = 0;
  state.history = [];
  showScreen('storyScreen');
  setTimeout(() => runStep('intro'), 100);
}

// ===== STORY ENGINE =====
function stepById(id) {
  return STORY.find(s => s.id === id);
}

function runStep(id) {
  const step = stepById(id);
  if (!step) return;
  state.history.push(id);

  // Update progress
  const idx = STORY.findIndex(s => s.id === id);
  const totalStory = STORY.length;
  state.progress = Math.min(95, Math.round((idx / totalStory) * 100));
  updateHUD();

  switch (step.type) {
    case 'narrate': renderNarrate(step); break;
    case 'dialogue': renderDialogue(step); break;
    case 'choice': renderChoice(step); break;
    case 'ending': renderEnding(step.endingId); break;
  }
}

function updateHUD() {
  const p = state.player;
  const other = p === 'leo' ? 'marco' : 'leo';

  $('scoreDisplay').textContent = state.score;
  $('progressFill').style.width = state.progress + '%';

  const playerChar = CHARS[p];
  const otherChar = CHARS[other];

  $('charLeft').innerHTML = `<img src="${playerChar.img}" alt="${playerChar.name}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`;
  $('charLeft').title = playerChar.name;
  $('charRight').innerHTML = `<img src="${otherChar.img}" alt="${otherChar.name}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`;
  $('charRight').title = otherChar.name;
}

function setActiveChar(side) {
  $('charLeft').className = 'char-bubble left ' + (side === 'left' ? 'active' : 'inactive');
  $('charRight').className = 'char-bubble right ' + (side === 'right' ? 'active' : 'inactive');
}

function setScene(location, time) {
  $('sceneLocation').textContent = location || '';
  $('sceneTime').textContent = time || '';
}

function renderNarrate(step) {
  if (step.location) setScene(step.location, step.time);
  $('charLeft').className = 'char-bubble left';
  $('charRight').className = 'char-bubble right';

  const speakerEl = $('speakerName');
  const dialogueEl = $('dialogueText');
  const narratorEl = $('narratorText');
  const choicesEl = $('choicesList');

  speakerEl.classList.remove('show');
  dialogueEl.classList.remove('show');
  narratorEl.classList.add('show');
  narratorEl.textContent = step.text;
  choicesEl.innerHTML = '';

  $('choicesPrompt') && ($('choicesPrompt').style.display = 'none');
  $('choices-prompt') && ($('choices-prompt').style.display = 'none');
  document.querySelector('.choices-prompt').style.display = 'none';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'choice-btn fade-in';
  nextBtn.innerHTML = '<span class="choice-icon">▶</span> Continue...';
  nextBtn.onclick = () => {
    if (step.next) runStep(step.next);
  };
  choicesEl.appendChild(nextBtn);
  document.querySelector('.choices-prompt').style.display = 'none';
}

function renderDialogue(step) {
  const speakerEl = $('speakerName');
  const dialogueEl = $('dialogueText');
  const narratorEl = $('narratorText');
  const choicesEl = $('choicesList');

  const isSelf = step.speaker === state.player;
  const isMarco = step.speaker === 'marco' || step.speaker === 'stranger';
  const charKey = step.speaker === 'stranger' ? 'marco' : step.speaker;
  const char = CHARS[charKey] || CHARS.marco;

  speakerEl.textContent = step.speaker === state.player
    ? 'You'
    : char.name;
  speakerEl.style.color = char.color || '#fff';
  speakerEl.classList.add('show');

  dialogueEl.classList.add('show');
  dialogueEl.textContent = step.text;
  narratorEl.classList.remove('show');

  if (step.speaker === state.player) {
    setActiveChar('left');
  } else {
    setActiveChar('right');
  }

  choicesEl.innerHTML = '';
  document.querySelector('.choices-prompt').style.display = 'none';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'choice-btn fade-in';
  nextBtn.innerHTML = '<span class="choice-icon">▶</span> Continue...';
  nextBtn.onclick = () => {
    if (step.next) runStep(step.next);
  };
  choicesEl.appendChild(nextBtn);
}

function renderChoice(step) {
  const speakerEl = $('speakerName');
  const dialogueEl = $('dialogueText');
  const narratorEl = $('narratorText');
  const choicesEl = $('choicesList');

  speakerEl.classList.remove('show');
  dialogueEl.classList.remove('show');
  narratorEl.classList.add('show');
  narratorEl.textContent = step.text;

  $('charLeft').className = 'char-bubble left active';
  $('charRight').className = 'char-bubble right';

  choicesEl.innerHTML = '';
  document.querySelector('.choices-prompt').style.display = 'block';

  step.choices.forEach((choice, i) => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn slide-in-right';
    btn.style.animationDelay = (i * 0.08) + 's';
    btn.innerHTML = `
      <span class="choice-icon">${choice.icon}</span>
      <span>${choice.text}</span>
    `;
    btn.onclick = () => {
      state.score += choice.score || 0;
      updateHUD();
      runStep(choice.next);
    };
    choicesEl.appendChild(btn);
  });
}

function getStars(score) {
  if (score >= 70) return '💖💖💖💖💖';
  if (score >= 50) return '💖💖💖💖💙';
  if (score >= 30) return '💖💖💖💙💙';
  if (score >= 15) return '💖💖💙💙💙';
  return '💖💙💙💙💙';
}

function renderEnding(endingId) {
  const ending = ENDINGS[endingId];
  if (!ending) return;

  $('endingBadge').textContent = ending.badge;
  $('endingTitle').textContent = ending.title;
  $('endingSubtitle').textContent = ending.subtitle;
  $('endingStory').textContent = ending.story;
  $('scoreFinal').textContent = state.score + ' pts';
  $('scoreStars').textContent = getStars(state.score);

  setTimeout(() => showScreen('endingScreen'), 300);
}

// ===== PUBLIC: RESTART =====
function restartGame() {
  state.score = 0;
  state.stepIndex = 0;
  state.history = [];
  state.progress = 0;
  $('progressFill').style.width = '0%';
  $('scoreDisplay').textContent = '0';
  showScreen('splash');
}

// ===== PUBLIC: SHARE =====
function shareEnding() {
  const ending = Object.values(ENDINGS).find((e, i) => {
    const keys = Object.keys(ENDINGS);
    return true;
  });
  const msg = `I got "${$('endingTitle').textContent}" with ${state.score} pts in Love, Unscripted! 💕`;
  if (navigator.share) {
    navigator.share({ title: 'Love, Unscripted', text: msg });
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(msg).then(() => {
      $('shareMsg').textContent = '✓ Copied to clipboard! Share the love.';
      setTimeout(() => $('shareMsg').textContent = '', 3000);
    });
  } else {
    $('shareMsg').textContent = msg;
  }
}

// ===== INIT =====
window.addEventListener('DOMContentLoaded', () => {
  spawnHearts();
  showScreen('splash');
});
