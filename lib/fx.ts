export type Point = { x: number; y: number };

export const centerOf = (el: Element): Point => {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
};

/* ---------------- AUDIO ---------------- */

let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext | null {
  try {
    if (!audioCtx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtx = new AC();
    }
    if (audioCtx.state === "suspended") void audioCtx.resume();
    return audioCtx;
  } catch {
    return null;
  }
}

function burstNoise(ctx: AudioContext, t: number, intense: boolean) {
  const len = Math.floor(ctx.sampleRate * 0.05);
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
  }
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1200 + Math.random() * 1800;
  const gain = ctx.createGain();
  gain.gain.value = (intense ? 0.5 : 0.28) * (0.6 + Math.random() * 0.4);
  src.connect(filter).connect(gain).connect(ctx.destination);
  src.start(t);
}

export function playApplause(big: boolean) {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  const count = big ? 16 : 4;
  const span = big ? 0.9 : 0.28;
  for (let i = 0; i < count; i++) {
    burstNoise(ctx, now + Math.random() * span, big);
  }
}

export function playJingle() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const notes = [523.25, 659.25, 783.99, 1046.5];
  let t = ctx.currentTime + 0.75;
  for (const f of notes) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.3, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
    osc.connect(g).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.34);
    t += 0.16;
  }
}

export function speak(text: string) {
  try {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "es-ES";
    u.rate = 0.92;
    u.pitch = 1.05;
    window.speechSynthesis.speak(u);
  } catch {
    // speech unavailable — the game stays playable without narration
  }
}

export function stopSpeaking() {
  try {
    window.speechSynthesis?.cancel();
  } catch {
    // ignore
  }
}
