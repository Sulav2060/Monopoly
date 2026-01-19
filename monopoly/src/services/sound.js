// Lightweight Web Audio sound helpers (no asset files needed)
let audioCtx;

function getCtx() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (Ctx) {
      audioCtx = new Ctx();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playTone({ freq = 440, duration = 0.12, type = "sine", gain = 0.06, when = 0 }) {
  const ctx = getCtx();
  if (!ctx) return;

  const t0 = ctx.currentTime + when;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);

  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + Math.max(0.03, duration));

  osc.connect(g);
  g.connect(ctx.destination);

  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

function playSequence(steps) {
  let offset = 0;
  for (const s of steps) {
    playTone({ when: offset, ...s });
    offset += (s.duration ?? 0.12) * (s.gapMultiplier ?? 1.0);
  }
}

export function playDiceRoll() {
  // A few quick randomized ticks
  const base = 500 + Math.random() * 100;
  playSequence([
    { freq: base + 100, duration: 0.06, type: "triangle", gain: 0.07 },
    { freq: base + 180, duration: 0.06, type: "triangle", gain: 0.07 },
    { freq: base + 260, duration: 0.06, type: "triangle", gain: 0.07 },
    { freq: base + 80, duration: 0.08, type: "triangle", gain: 0.07 },
  ]);
}

export function playMove() {
  // Short whoosh-like up then down
  playSequence([
    { freq: 220, duration: 0.08, type: "sine", gain: 0.05 },
    { freq: 330, duration: 0.08, type: "sine", gain: 0.05 },
    { freq: 280, duration: 0.1, type: "sine", gain: 0.05 },
  ]);
}

export function playPropertyBought() {
  // Simple "ka-ching"-ish two-note
  playSequence([
    { freq: 880, duration: 0.1, type: "square", gain: 0.06 },
    { freq: 1320, duration: 0.12, type: "square", gain: 0.06 },
  ]);
}

export function playGoToJail() {
  // Descending alert
  playSequence([
    { freq: 600, duration: 0.12, type: "sawtooth", gain: 0.05 },
    { freq: 420, duration: 0.12, type: "sawtooth", gain: 0.05 },
    { freq: 300, duration: 0.14, type: "sawtooth", gain: 0.05 },
  ]);
}

export function playTurnEnd() {
  // Soft confirmation blip
  playSequence([
    { freq: 520, duration: 0.08, type: "sine", gain: 0.04 },
    { freq: 660, duration: 0.08, type: "sine", gain: 0.04 },
  ]);
}

export function playMoney(amount = 100) {
  // Upward arpeggio; amount slightly influences pitch
  const base = 400 + Math.min(600, Math.max(0, amount / 2));
  playSequence([
    { freq: base, duration: 0.08, type: "triangle", gain: 0.06 },
    { freq: base + 120, duration: 0.08, type: "triangle", gain: 0.06 },
    { freq: base + 220, duration: 0.1, type: "triangle", gain: 0.06 },
  ]);
}

export function playTax(amount = 100) {
  // Slightly downward tones for paying
  const base = 500 + Math.min(400, Math.max(0, amount / 3));
  playSequence([
    { freq: base, duration: 0.08, type: "triangle", gain: 0.05 },
    { freq: base - 140, duration: 0.08, type: "triangle", gain: 0.05 },
  ]);
}
