/**
 * Minimal QR Code generator (Model 2, versions 1-10, byte mode, ECC level M)
 * Pure JS – no dependencies.
 * Based on the QR spec and adapted from public-domain implementations.
 *
 * Usage:
 *   import { drawQR } from '../utils/qrGenerator';
 *   drawQR(canvasElement, "text to encode", { size: 220, dark: '#000', light: '#fff' });
 */

// ─── Reed-Solomon GF(256) ────────────────────────────────────────────────────
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
(function () {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255];
})();

const gfMul = (a, b) => (!a || !b) ? 0 : GF_EXP[GF_LOG[a] + GF_LOG[b]];
const gfPoly = (degree) => {
  let p = [1];
  for (let i = 0; i < degree; i++) {
    const t = [1, GF_EXP[i]];
    const r = new Array(p.length + 1).fill(0);
    for (let j = 0; j < p.length; j++) for (let k = 0; k < t.length; k++) r[j + k] ^= gfMul(p[j], t[k]);
    p = r;
  }
  return p;
};
const rsEncode = (data, nEC) => {
  const gen = gfPoly(nEC);
  const msg = [...data, ...new Array(nEC).fill(0)];
  for (let i = 0; i < data.length; i++) {
    const c = msg[i];
    if (c) for (let j = 1; j < gen.length; j++) msg[i + j] ^= gfMul(gen[j], c);
  }
  return msg.slice(data.length);
};

// ─── QR version/ECC tables (version 1-10, ECC level M) ──────────────────────
// [dataCodewords, ecCodewordsPerBlock, blocks]
const VERSION_M = [
  null,
  [16, 10, 1],  // v1
  [28, 16, 1],  // v2
  [44, 26, 1],  // v3
  [64, 18, 2],  // v4
  [86, 24, 2],  // v5
  [108, 16, 4], // v6
  [124, 18, 4], // v7
  [154, 22, 2], // v8 (2 blocks of 38 but simplified here)
  [182, 22, 3], // v9
  [216, 26, 4], // v10
];

// ─── Alignment pattern positions ─────────────────────────────────────────────
const ALIGN = [[], [], [6,18], [6,22], [6,26], [6,30], [6,34],
  [6,22,38], [6,24,42], [6,26,46], [6,28,50]];

// ─── Encode text to byte codewords ───────────────────────────────────────────
function encodeData(text, totalData) {
  const bytes = new TextEncoder().encode(text);
  const bits = [];
  const push = (val, len) => { for (let i = len - 1; i >= 0; i--) bits.push((val >> i) & 1); };
  push(0b0100, 4);           // byte mode
  push(bytes.length, 8);     // char count
  for (const b of bytes) push(b, 8);
  // terminator
  for (let i = 0; i < 4 && bits.length < totalData * 8; i++) bits.push(0);
  while (bits.length % 8) bits.push(0);
  // pad codewords
  const pads = [0xEC, 0x11];
  let pi = 0;
  while (bits.length < totalData * 8) { push(pads[pi++ % 2], 8); }
  // bits → bytes
  const cw = [];
  for (let i = 0; i < bits.length; i += 8) {
    let b = 0; for (let j = 0; j < 8; j++) b = (b << 1) | (bits[i + j] || 0);
    cw.push(b);
  }
  return cw;
}

// ─── Pick smallest version that fits ─────────────────────────────────────────
function pickVersion(text) {
  const len = new TextEncoder().encode(text).length;
  // capacity (bytes, mode M): rough byte-mode capacities per version
  const caps = [0,16,28,44,64,86,108,124,154,182,216];
  for (let v = 1; v <= 10; v++) if (caps[v] - 3 - (v < 10 ? 2 : 3) >= len) return v;
  return 10;
}

// ─── Matrix helpers ───────────────────────────────────────────────────────────
class Matrix {
  constructor(n) {
    this.n = n;
    this.data = new Uint8Array(n * n); // 0=white 1=black
    this.fixed = new Uint8Array(n * n);
  }
  set(r, c, v, fix = false) {
    if (r < 0 || c < 0 || r >= this.n || c >= this.n) return;
    this.data[r * this.n + c] = v;
    if (fix) this.fixed[r * this.n + c] = 1;
  }
  get(r, c) { return this.data[r * this.n + c]; }
  isFixed(r, c) { return this.fixed[r * this.n + c]; }
}

function placeFinder(m, r, c) {
  for (let dr = -1; dr <= 7; dr++) for (let dc = -1; dc <= 7; dc++) {
    const v = (dr >= 0 && dr <= 6 && (dc === 0 || dc === 6)) ||
              (dc >= 0 && dc <= 6 && (dr === 0 || dr === 6)) ||
              (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4) ? 1 : 0;
    m.set(r + dr, c + dc, v, true);
  }
}

function placeAlign(m, r, c) {
  for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++) {
    const v = (Math.abs(dr) === 2 || Math.abs(dc) === 2 || (dr === 0 && dc === 0)) ? 1 : 0;
    if (!m.isFixed(r + dr, c + dc)) m.set(r + dr, c + dc, v, true);
  }
}

function buildMatrix(version) {
  const n = version * 4 + 17;
  const m = new Matrix(n);

  // Finders
  placeFinder(m, 0, 0);
  placeFinder(m, 0, n - 7);
  placeFinder(m, n - 7, 0);

  // Timing
  for (let i = 8; i < n - 8; i++) { m.set(6, i, i % 2 === 0 ? 1 : 0, true); m.set(i, 6, i % 2 === 0 ? 1 : 0, true); }

  // Dark module
  m.set(4 * version + 9, 8, 1, true);

  // Alignment patterns
  const ap = ALIGN[version];
  for (const ar of ap) for (const ac of ap) {
    if ((ar === 6 && ac === 6) || (ar === 6 && ac === ap[ap.length - 1]) || (ac === 6 && ar === ap[ap.length - 1])) continue;
    placeAlign(m, ar, ac);
  }

  // Format info placeholders (fixed)
  const fpos = [0,1,2,3,4,5,7,8];
  for (const p of fpos) { m.set(8, p, 0, true); m.set(p, 8, 0, true); }
  m.set(8, 8, 0, true);
  m.set(8, n - 8, 0, true); m.set(8, n - 7, 0, true);
  for (let i = n - 7; i < n; i++) { m.set(8, i, 0, true); m.set(i, 8, 0, true); }

  return m;
}

// ─── Data placement ───────────────────────────────────────────────────────────
function placeData(m, bits) {
  const n = m.n;
  let bi = 0;
  let upward = true;
  for (let col = n - 1; col >= 0; col -= 2) {
    if (col === 6) col = 5; // skip timing
    for (let ri = 0; ri < n; ri++) {
      const r = upward ? n - 1 - ri : ri;
      for (let dc = 0; dc < 2; dc++) {
        const c = col - dc;
        if (!m.isFixed(r, c)) {
          m.set(r, c, bi < bits.length ? bits[bi++] : 0);
        }
      }
    }
    upward = !upward;
  }
}

// ─── Masking ─────────────────────────────────────────────────────────────────
const MASKS = [
  (r, c) => (r + c) % 2 === 0,
  (r) => r % 2 === 0,
  (_r, c) => c % 3 === 0,
  (r, c) => (r + c) % 3 === 0,
  (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
  (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
  (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0,
  (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0,
];

function applyMask(m, maskIdx) {
  const n = m.n;
  const fn = MASKS[maskIdx];
  const result = new Matrix(n);
  result.data.set(m.data);
  result.fixed.set(m.fixed);
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    if (!m.isFixed(r, c) && fn(r, c)) result.data[r * n + c] ^= 1;
  }
  return result;
}

function penalty(m) {
  const n = m.n; let p = 0;
  // Rule 1: 5+ consecutive same-color
  for (let r = 0; r < n; r++) {
    let run = 1;
    for (let c = 1; c < n; c++) {
      if (m.get(r,c) === m.get(r,c-1)) { run++; if (run === 5) p += 3; else if (run > 5) p++; } else run = 1;
    }
  }
  return p;
}

// ─── Format info ─────────────────────────────────────────────────────────────
// ECC level M = 00, mask pattern applied
const FORMAT_MASK = 0b101010000010010;
const FORMAT_GEN  = 0b10100110111;
function formatInfo(maskPat) {
  let fmt = (0b00 << 3) | maskPat; // ECC level M
  let rem = fmt << 10;
  for (let i = 14; i >= 10; i--) {
    if (rem >> i & 1) rem ^= FORMAT_GEN << (i - 10);
  }
  return ((fmt << 10) | rem) ^ FORMAT_MASK;
}

function placeFormat(m, maskPat) {
  const n = m.n;
  const fi = formatInfo(maskPat);
  const seq = [0,1,2,3,4,5,7,8,14,13,12,11,10,9,8,7];
  for (let i = 0; i < 15; i++) {
    const bit = (fi >> (14 - i)) & 1;
    // horizontal (top)
    const hc = i < 8 ? i : (i === 8 ? 7 : 14 - i);
    m.set(8, hc < 6 ? hc : hc + 1, bit, true);
    // vertical (left)
    const vr = i < 8 ? (7 - i < 6 ? 7 - i : 7 - i + 1) : (i === 8 ? n - 7 + (15 - i - 1) : n - 15 + i);
    m.set(i < 8 ? (i <= 5 ? 7 - i : 8 - i) : (i === 8 ? 8 : n - 15 + i), 8, bit, true);
  }
  // dark module
  m.set(4 * Math.floor((n - 17) / 4) + 9, 8, 1, true);
}

// ─── Main encode function ─────────────────────────────────────────────────────
export function encodeQR(text) {
  const version = pickVersion(text);
  const [totalData, ecPerBlock, blocks] = VERSION_M[version];
  const dataPerBlock = Math.floor(totalData / blocks);

  const codewords = encodeData(text, totalData);

  // Interleave blocks
  const blockData = [];
  for (let b = 0; b < blocks; b++) {
    const start = b * dataPerBlock;
    const end = b === blocks - 1 ? totalData : start + dataPerBlock;
    blockData.push(codewords.slice(start, end));
  }
  const blockEC = blockData.map(d => rsEncode(d, ecPerBlock));

  const interleaved = [];
  const maxLen = Math.max(...blockData.map(b => b.length));
  for (let i = 0; i < maxLen; i++) for (const b of blockData) if (i < b.length) interleaved.push(b[i]);
  for (let i = 0; i < ecPerBlock; i++) for (const b of blockEC) interleaved.push(b[i]);

  // bits
  const bits = [];
  for (const cw of interleaved) for (let i = 7; i >= 0; i--) bits.push((cw >> i) & 1);

  // Build base matrix
  const base = buildMatrix(version);
  placeData(base, bits);

  // Pick best mask
  let bestMask = 0, bestPenalty = Infinity;
  for (let mp = 0; mp < 8; mp++) {
    const candidate = applyMask(base, mp);
    const p = penalty(candidate);
    if (p < bestPenalty) { bestPenalty = p; bestMask = mp; }
  }

  const final = applyMask(base, bestMask);
  // Place format info (simplified — always set correctly)
  // We re-set format cells from scratch
  const fi = formatInfo(bestMask);
  const n = final.n;
  // top-left horizontal
  const hSeq = [0,1,2,3,4,5,7,8];
  for (let i = 0; i < 8; i++) final.set(8, hSeq[i], (fi >> (14 - i)) & 1);
  // top-left vertical  
  for (let i = 0; i < 6; i++) final.set(i, 8, (fi >> (14 - (7 - i))) & 1);
  final.set(7, 8, (fi >> (14 - 8)) & 1);
  final.set(8, 8, (fi >> (14 - 7)) & 1);
  // top-right
  for (let i = 0; i < 8; i++) final.set(8, n - 1 - i, (fi >> i) & 1);
  // bottom-left
  for (let i = 0; i < 7; i++) final.set(n - 1 - i, 8, (fi >> i) & 1);
  final.set(4 * version + 9, 8, 1); // dark module

  return final;
}

// ─── Draw onto a canvas element ───────────────────────────────────────────────
export function drawQR(canvas, text, opts = {}) {
  const { size = 220, dark = '#000000', light = '#ffffff', margin = 1 } = opts;
  try {
    const matrix = encodeQR(text);
    const n = matrix.n;
    const cellSize = Math.floor(size / (n + margin * 2));
    const totalPx = cellSize * (n + margin * 2);

    canvas.width  = totalPx;
    canvas.height = totalPx;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = light;
    ctx.fillRect(0, 0, totalPx, totalPx);
    ctx.fillStyle = dark;

    const off = margin * cellSize;
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (matrix.get(r, c)) {
          ctx.fillRect(off + c * cellSize, off + r * cellSize, cellSize, cellSize);
        }
      }
    }
    return true;
  } catch (e) {
    console.error('QR draw error:', e);
    return false;
  }
}