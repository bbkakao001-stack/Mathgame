/*
 * math-scene-kit.js — zone-based scene layout for the Stage 7 Maths deck.
 *
 * Layout contract for every kit scene (SVG viewBox 1200 x 640):
 *   - ICON column   x  40..230   one large context object, vertically centred
 *   - MAIN area     x 270..1150  all data / objects / labels
 *   - HEADING row   y  ~64       short label, never lower than y 80
 *   - TRY zone      x 900..1150, y 20..70   (tap button, top-right)
 *   - Step caption  lives in HTML below the SVG, never inside it.
 * Text is never smaller than 22 viewBox units. Positions are computed from the
 * data (lane/spread helpers) instead of hand-placed per build.
 */
(() => {
  const C = '#f4f3ed', M = '#aab4c8', G = '#2dd4bf', Y = '#fbbf24', R = '#fb7185', INK = '#10172a';
  const esc = s => String(s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

  const T = (x, y, s, size = 26, color = C, weight = 800, anchor = 'middle') =>
    `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${color}" font-size="${Math.max(26, size)}" font-weight="${weight}" class="${/^\d+$/.test(String(s)) ? 'numeric-svg' : ''}" font-family="${/^\d+$/.test(String(s)) ? 'Arial,sans-serif' : 'Mali,Arial,sans-serif'}">${esc(s)}</text>`;
  const L = (x1, y1, x2, y2, color = M, w = 4, extra = '') =>
    `<path d="M${x1} ${y1} L${x2} ${y2}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" ${extra}/>`;
  const dot = (x, y, r, color, label, size = 28, op = 1) =>
    `<g opacity="${op}"><circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>${label === undefined ? '' : T(x, y + size * 0.36, String(label), size, INK, 900)}</g>`;
  const icon = (name, x, y, s) => `<use href="#icon-${name}" x="${x}" y="${y}" width="${s}" height="${s}"/>`;
  const sideIcon = name => `<g class="kit-icon">${icon(name, 55, 245, 150)}</g>`;
  const B = (n, inner) => `<g data-build="${n}">${inner}</g>`;
  const spread = (n, x0, x1) => Array.from({length: n}, (_, i) => n === 1 ? (x0 + x1) / 2 : x0 + i * (x1 - x0) / (n - 1));
  const pill = (label, name, extra = '') =>
    `<g class="try-hit try-pill" data-try="${name}" ${extra} role="button" tabindex="0" aria-label="${esc(label)}"><rect x="840" y="18" width="310" height="52" rx="26"/>${T(995, 52, label, 23, INK, 900)}</g>`;
  const dyn = (name, inner) => `<g data-dyn="${name}">${inner}</g>`;

  const scenes = {};

  /* ---------- Chapter 12 opener ---------- */
  scenes['chapter-preview'] = {
    only: slide => slide.dataset.chapter === 'c12',
    markup(slide, A) {
      const vals = [3, 7, 7, 9, 12], cols = [A, G, Y, R, A], xs = spread(5, 330, 1090);
      const dots = y => vals.map((v, i) => dot(xs[i], y, y < 200 ? 32 : 40, cols[i], v, y < 200 ? 28 : 34)).join('');
      const bx = [0, 1, 2, 3].map(i => 420 + i * 170);
      const bars = [0, 1, 2, 3].map(i => `<rect x="${bx[i]}" y="${470 - (i + 1) * 62}" width="96" height="${(i + 1) * 62}" rx="6" fill="${[A, G, Y, R][i]}"/>`).join('') + L(330, 472, 1100, 472, M, 4);
      const span = `<path d="M330 512 V536 H1090 V512" fill="none" stroke="${Y}" stroke-width="6" stroke-linejoin="round"/>`;
      return {
        aria: 'Five data values, a frequency bar chart and a spread bracket',
        base: sideIcon('book-2'),
        builds: [
          dots(260),
          dots(150) + bars + T(700, 570, 'FREQUENCY', 26, M),
          dots(150) + bars + span + T(700, 600, 'TYPICAL VALUE  ·  FREQUENCY  ·  SPREAD', 26, C)
        ]
      };
    }
  };

  /* ---------- Three averages ---------- */
  scenes['averages-comparison'] = {
    markup(slide, A) {
      const X = v => 300 + (v - 1) * 100, vals = [2, 3, 3, 4, 8], axisY = 450;
      const axis = L(270, axisY, 1150, axisY, M, 5) + Array.from({length: 9}, (_, i) => L(X(i + 1), axisY - 8, X(i + 1), axisY + 8, M, 3) + T(X(i + 1), axisY + 46, String(i + 1), 24, M, 700)).join('');
      const seen = {};
      const dots = vals.map(v => { const k = seen[v] = (seen[v] || 0) + 1; return dot(X(v), axisY - 34 - (k - 1) * 66, 30, v === 8 ? R : A, v, 28); }).join('');
      const mean = `<path d="M${X(4)} ${axisY + 62} l-22 38 h44 z" fill="${G}"/>`;
      return {
        aria: 'The data set 2, 3, 3, 4, 8 on a number line with mean, median and mode marked',
        base: sideIcon('book-2') + axis,
        builds: [
          dots + T(700, 64, 'ONE DATA SET', 26, M),
          dots + mean + T(X(4), 592, 'MEAN = 4', 30, G),
          dots + mean + `<ellipse cx="${X(3)}" cy="${axisY - 66}" rx="46" ry="82" fill="none" stroke="${Y}" stroke-width="6" stroke-dasharray="12 8"/>` + T(X(3), 70, 'MEDIAN = 3  ·  MODE = 3', 28, Y) + T(X(4), 592, 'MEAN = 4', 30, G)
        ]
      };
    }
  };

  /* ---------- Mean: fair share (tap to pass coins) ---------- */
  const meanXs = spread(5, 330, 1090);
  const piles = counts => counts.map((n, i) => {
    let s = '';
    for (let j = 0; j < n; j++) s += icon('coin', meanXs[i] - 16, 438 - j * 35, 32);
    return s + T(meanXs[i], 522, String(n), 30, [ '#a78bfa', G, Y, R, '#a78bfa'][i]);
  }).join('') + L(280, 474, 1140, 474, M, 4);
  scenes['fair-share'] = {
    init: scene => { scene._st = {counts: [4, 8, 6, 10, 2]}; },
    markup() {
      const un = [4, 8, 6, 10, 2], eq = [6, 6, 6, 6, 6];
      const fair = `<path d="M280 261 H1140" stroke="${Y}" stroke-width="3" stroke-dasharray="10 8" fill="none"/>${T(250, 270, '6', 26, Y, 800, 'end')}`;
      return {
        aria: 'Five piles of coins, 4, 8, 6, 10 and 2, shared out evenly into piles of 6',
        base: sideIcon('coin'),
        builds: [
          piles(un),
          piles(un) + T(700, 64, '4 + 8 + 6 + 10 + 2 = 30', 30, M),
          T(540, 64, 'SHARE 30 INTO 5 GROUPS', 26, C) + fair + dyn('mean', piles(un)) + pill('Pass a coin ▸', 'pass-coin'),
          piles(eq) + fair + T(700, 64, 'MEAN = 30 ÷ 5 = 6', 32, Y)
        ]
      };
    },
    onBuild(scene, level) { if (level === 3) { scene._st.counts = [4, 8, 6, 10, 2]; this.redraw(scene); } },
    redraw(scene) {
      scene.querySelector('[data-dyn="mean"]').innerHTML = piles(scene._st.counts);
      const left = scene._st.counts.reduce((a, n) => a + Math.max(0, n - 6), 0);
      const t = scene.querySelector('.try-pill text');
      if (t) t.textContent = left ? `Pass a coin ▸ (${left} left)` : 'Shared equally ✓';
    },
    tap(scene) {
      const c = scene._st.counts, hi = c.indexOf(Math.max(...c)), lo = c.indexOf(Math.min(...c));
      if (c[hi] > 6 && c[lo] < 6) { c[hi]--; c[lo]++; }
      this.redraw(scene);
    }
  };

  /* ---------- Median (tap a value to test if it is the middle) ---------- */
  const medXs = spread(5, 330, 1090), medSorted = [3, 5, 7, 9, 11];
  const medDraw2 = (A, sel) => {
    const dots = medSorted.map((v, i) => `<g class="try-hit" data-try="median-test" data-i="${i}" role="button" tabindex="0" aria-label="Test ${v}">${dot(medXs[i], 280, i === sel ? 54 : 46, i === sel ? Y : A, v, 36)}</g>`).join('');
    const msg = sel < 0 ? 'Tap a value: is it the middle?'
      : sel === 2 ? '2 values below · 2 values above — the middle!'
      : `${sel} below · ${4 - sel} above — not the middle`;
    return L(280, 372, 1140, 372, M, 4) + dots + T(medXs[0], 430, 'least', 24, M, 700) + T(medXs[4], 430, 'greatest', 24, M, 700) + T(700, 540, msg, 30, sel === 2 ? Y : C);
  };
  scenes['sortable-line'] = {
    init: scene => { scene._st = {sel: -1}; },
    markup(slide, A) {
      const raw = [9, 3, 11, 5, 7], ys = [200, 340, 220, 330, 205];
      const scatter = raw.map((v, i) => dot(medXs[i], ys[i], 46, i === 1 ? G : A, v, 36)).join('');
      const sorted = (hi, dim) => medSorted.map((v, i) => dot(medXs[i], 280, i === 2 && hi ? 58 : 46, i === 2 && hi ? Y : A, v, 36, i === 2 || !dim ? 1 : .4)).join('');
      const arcs = `<path d="M${medXs[0]} 232 Q${medXs[2]} 70 ${medXs[4]} 232" fill="none" stroke="${M}" stroke-width="4" stroke-dasharray="8 8"/><path d="M${medXs[1]} 232 Q${medXs[2]} 130 ${medXs[3]} 232" fill="none" stroke="${M}" stroke-width="4" stroke-dasharray="8 8"/>`;
      return {
        aria: 'Values 9, 3, 11, 5, 7 sorted into order; the middle value 7 is the median',
        base: sideIcon('ruler'),
        builds: [
          scatter + T(700, 64, 'DATA, BEFORE ORDER', 26, M),
          dyn('median', medDraw2(A, -1)),
          arcs + sorted(true, true) + T(700, 520, 'the outside values pair away', 30, C),
          sorted(true, true) + T(700, 64, 'MEDIAN = THE MIDDLE VALUE', 28, Y) + T(700, 520, 'MEDIAN = 7', 44, Y)
        ]
      };
    },
    onBuild(scene, level) { if (level === 2) { scene._st.sel = -1; this.redraw(scene); } },
    redraw(scene) { scene.querySelector('[data-dyn="median"]').innerHTML = medDraw2(scene.dataset.accent, scene._st.sel); },
    tap(scene, el) { scene._st.sel = Number(el.dataset.i); this.redraw(scene); }
  };

  /* ---------- Mode (tap a column to see its tally) ---------- */
  const tag = (x, y, n, color, op = 1) =>
    `<g opacity="${op}"><path d="M${x - 37} ${y - 22} H${x + 21} L${x + 39} ${y} L${x + 21} ${y + 22} H${x - 37} Z" fill="${color}"/><circle cx="${x + 19}" cy="${y}" r="4" fill="#111827"/>${T(x - 8, y + 9, String(n), 28, '#111827', 900)}</g>`;
  const modeCol = {2: 1, 4: 3, 7: 1, 9: 1}, modeKeys = [2, 4, 7, 9], modeXs = spread(4, 380, 1070);
  const modeColor = (v, A) => ({2: Y, 4: A, 7: R, 9: G}[v]);
  const modeCols = (A, hiOnly, sel, live = true) => modeKeys.map((v, i) => {
    const op = hiOnly && v !== 4 ? .28 : 1;
    let s = '';
    for (let j = 0; j < modeCol[v]; j++) s += tag(modeXs[i], 440 - j * 56, v, modeColor(v, A), op);
    return `<g ${live ? `class="try-hit" data-try="tally" data-v="${v}" role="button" tabindex="0" aria-label="Size ${v}"` : ''}>${live ? `<rect x="${modeXs[i] - 60}" y="250" width="120" height="230" fill="transparent"/>` : ''}${s}${T(modeXs[i], 496, 'SIZE ' + v, 24, sel === v ? Y : M, 800)}</g>`;
  }).join('');
  scenes['size-clusters'] = {
    init: scene => { scene._st = {sel: 0}; },
    markup(slide, A) {
      const loose = [4, 2, 7, 9, 4, 4], px = spread(3, 420, 960), py = [200, 350];
      const raw = loose.map((v, i) => tag(px[i % 3], py[Math.floor(i / 3)], v, modeColor(v, A))).join('');
      const ring = `<rect x="${modeXs[1] - 58}" y="276" width="116" height="196" rx="14" fill="none" stroke="${Y}" stroke-width="6" stroke-dasharray="12 8"/>`;
      return {
        aria: 'Shoe size tags 2, 4, 4, 4, 7, 9 sorted into columns; size 4 is the tallest',
        base: sideIcon('shoe'),
        builds: [
          raw,
          T(700, 64, 'SORT BY SHOE SIZE', 26, M) + dyn('mode', modeCols(A, false, 0)) + T(700, 580, 'Tap a column to count it', 24, M, 700),
          T(700, 64, 'MOST COMMON', 28, Y) + modeCols(A, true, 4, false) + ring,
          T(700, 64, 'MODE = 4', 40, Y) + modeCols(A, true, 4, false) + ring + T(700, 580, '4 appears 3 times', 28, Y)
        ]
      };
    },
    onBuild(scene, level) { if (level === 2) { scene._st.sel = 0; this.redraw(scene); } },
    redraw(scene) {
      const A = scene.dataset.accent, v = scene._st.sel;
      scene.querySelector('[data-dyn="mode"]').innerHTML = modeCols(A, false, v);
      const note = scene.querySelector('[data-build="2"] > text:last-of-type');
      if (note) note.textContent = v ? `Size ${v} appears ${modeCol[v]} ${modeCol[v] === 1 ? 'time' : 'times'}` : 'Tap a column to count it';
    },
    tap(scene, el) { scene._st.sel = Number(el.dataset.v); this.redraw(scene); }
  };

  /* ---------- Range (tap to stretch the maximum) ---------- */
  const rangeX = v => 300 + v * 70, rangeVals = [3, 4, 8, 9, 11];
  const rangeAxis = L(280, 330, 1150, 330, '#667391', 6) + Array.from({length: 13}, (_, i) => L(rangeX(i), 318, rangeX(i), 342, '#8490a8', 2) + T(rangeX(i), 380, String(i), 22, M, 700)).join('');
  const rangePts = (A, max, mode) => rangeVals.map(v => (v === 11 ? max : v)).map((v, i, arr) => {
    const end = i === 0 || i === arr.length - 1, dim = mode === 'ends' && !end;
    const c = i === 0 ? Y : i === arr.length - 1 ? R : A;
    return `<g opacity="${dim ? .3 : 1}"><circle cx="${rangeX(v)}" cy="330" r="${end && mode !== 'plain' ? 26 : 22}" fill="${c}"/>${T(rangeX(v), 282, String(v), 28, end && mode !== 'plain' ? c : C, 900)}</g>`;
  }).join('');
  const rangeDraw4 = (A, max) => {
    const x0 = rangeX(3), x1 = rangeX(max);
    return rangePts(A, max, 'ends') + `<path d="M${x0} 430 v34 H${x1} v-34" fill="none" stroke="${Y}" stroke-width="6" stroke-linejoin="round"/>` + T((x0 + x1) / 2, 540, `range = ${max} − 3 = ${max - 3}`, 40, Y) + pill(max === 11 ? 'Move the 11 → 12' : 'Move back to 11', 'stretch');
  };
  scenes['endpoint-span'] = {
    init: scene => { scene._st = {max: 11}; },
    markup(slide, A) {
      const order = `${L(rangeX(3), 440, rangeX(11), 440, M, 4)}<path d="M${rangeX(11) - 16} 426 L${rangeX(11)} 440 L${rangeX(11) - 16} 454" fill="none" stroke="${M}" stroke-width="4" stroke-linecap="round"/>${T(rangeX(3), 500, 'smallest', 24, Y, 700, 'start')}${T(rangeX(11), 500, 'largest', 24, R, 700, 'end')}`;
      return {
        aria: 'Values 3, 4, 8, 9 and 11 on a number line; the range is 11 minus 3, which is 8',
        base: sideIcon('ruler') + rangeAxis,
        builds: [
          rangePts(A, 11, 'plain') + T(700, 64, 'MEASUREMENTS ON ONE SCALE', 26, M),
          rangePts(A, 11, 'plain') + order + T(700, 64, 'ORDER THEM', 26, M),
          rangePts(A, 11, 'ends') + T(700, 64, 'KEEP THE ENDPOINTS', 26, M) + T(700, 480, 'largest − smallest = 11 − 3', 32, C),
          dyn('range', rangeDraw4(A, 11))
        ]
      };
    },
    onBuild(scene, level) { if (level === 4) { scene._st.max = 11; this.redraw(scene); } },
    redraw(scene) { scene.querySelector('[data-dyn="range"]').innerHTML = rangeDraw4(scene.dataset.accent, scene._st.max); },
    tap(scene) { scene._st.max = scene._st.max === 11 ? 12 : 11; this.redraw(scene); }
  };

  /* ---------- Frequency tables (tap a bar to add one) ---------- */
  const fx = [430, 700, 970], fcol = A => [A, G, Y];
  const freqDraw = (A, counts, bars, note) => {
    const cols = fcol(A);
    const total = counts.reduce((a, b) => a + b, 0);
    const body = counts.map((n, i) => {
      let s = '';
      if (bars) s = `<g class="try-hit" data-try="bar" data-i="${i}" role="button" tabindex="0" aria-label="Value ${i + 1}, frequency ${n}"><rect x="${fx[i] - 55}" y="${440 - n * 54}" width="110" height="${n * 54}" rx="6" fill="${cols[i]}" opacity=".92"/><rect x="${fx[i] - 70}" y="${440 - 6 * 54}" width="140" height="${6 * 54}" fill="transparent"/>${T(fx[i], 440 - n * 54 - 14, String(n), 30, C)}</g>`;
      else for (let j = 0; j < n; j++) s += dot(fx[i], 416 - j * 54, 24, cols[i]);
      return s + T(fx[i], 490, String(i + 1), 32, C);
    }).join('');
    return L(330, 442, 1070, 442, M, 3) + body + (note === undefined ? '' : T(700, 580, note || (bars ? `Bar height = stack height · total ${total}` : ''), 26, bars ? C : M, 700));
  };
  scenes['objects-to-bars'] = {
    init: scene => { scene._st = {counts: [2, 4, 3]}; },
    markup(slide, A) {
      const vals = [1, 2, 3, 2, 3, 2, 1, 3, 2], cols = fcol(A), rx = spread(5, 330, 1090);
      const raw = vals.map((v, i) => dot(i < 5 ? rx[i] : rx[i - 5] + 95, i < 5 ? 210 : 350, 32, cols[v - 1], v, 30)).join('');
      return {
        aria: 'Nine dice observations grouped into stacks, then drawn as bars for values 1, 2 and 3',
        base: sideIcon('dice-5'),
        builds: [
          raw + T(700, 64, 'NINE OBSERVATIONS', 26, M),
          T(700, 64, 'MATCH VALUES', 26, M) + freqDraw(A, [2, 4, 3], false),
          freqDraw(A, [2, 4, 3], false, 'Each stack has one value'),
          T(700, 64, 'FREQUENCY', 26, G) + dyn('freq', freqDraw(A, [2, 4, 3], true, '')) + `<g class="try-hint">${T(995, 52, 'Tap a bar to add one', 24, M, 700)}</g>`
        ]
      };
    },
    onBuild(scene, level) { if (level === 4) { scene._st.counts = [2, 4, 3]; this.redraw(scene); } },
    redraw(scene) { scene.querySelector('[data-dyn="freq"]').innerHTML = freqDraw(scene.dataset.accent, scene._st.counts, true, ''); },
    tap(scene, el) { const i = Number(el.dataset.i), c = scene._st.counts; c[i] = c[i] >= 6 ? 2 : c[i] + 1; this.redraw(scene); }
  };

  /* ---------- Mean from a frequency table ---------- */
  scenes['weighted-values'] = {
    markup() {
      const xs = [650, 890, 1110], rows = [190, 320, 450];
      const grid = [255, 385].map(y => L(270, y, 1150, y, 'rgba(164,177,214,.25)', 2)).join('')
        + T(270, rows[0] + 9, 'VALUE', 24, M, 800, 'start') + T(270, rows[1] + 9, 'COUNT', 24, M, 800, 'start');
      const row = (y, arr, color, size = 44) => arr.map((v, i) => T(xs[i], y + 15, String(v), size, color, 900)).join('');
      const vc = row(rows[0], [1, 2, 3], C) + row(rows[1], [2, 4, 2], G);
      const prod = T(270, rows[2] + 9, 'VALUE × COUNT', 24, M, 800, 'start') + row(rows[2], [2, 8, 6], Y);
      return {
        aria: 'Frequency table with values 1, 2, 3 and counts 2, 4, 2; products 2, 8, 6; mean is 16 divided by 8, which is 2',
        base: sideIcon('coin') + grid,
        builds: [
          vc,
          vc + prod,
          vc + prod + T(700, 64, 'TOTAL FREQUENCY = 8', 28, G) + T(700, 580, '2 + 8 + 6 = 16', 38, C),
          vc + prod + T(600, 64, 'MEAN = WEIGHTED TOTAL ÷ TOTAL COUNT', 26, M) + T(700, 580, '16 ÷ 8 = 2', 46, Y)
        ]
      };
    }
  };

  /* ---------- public API ---------- */
  function build(slide, spec, accent) {
    const def = scenes[spec.visual];
    if (!def || (def.only && !def.only(slide))) return null;
    const m = def.markup(slide, accent);
    if (m.builds.length !== spec.builds.length) console.warn('scene-kit: build count mismatch for', spec.visual);
    const body = m.base + m.builds.map((b, i) => B(i + 1, b)).join('');
    return `<div class="story-scene art-${spec.visual}" data-scene="${spec.visual}" data-kit="1" data-accent="${accent}" data-max-build="${spec.builds.length}"><svg viewBox="30 10 1140 610" role="img" aria-label="${esc(m.aria)}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet"><g class="scene-art">${body}</g></svg><div class="build-cue" aria-live="polite"></div></div>`;
  }
  function defFor(scene) { return scene && scenes[scene.dataset.scene]; }
  function ensure(scene) { const d = defFor(scene); if (d && !scene._st && d.init) d.init(scene); return d; }
  function onBuild(scene, level) { const d = ensure(scene); if (d && d.onBuild) d.onBuild(scene, level); }
  function tap(scene, el) { const d = ensure(scene); if (d && d.tap) d.tap(scene, el); }

  document.addEventListener('click', e => {
    const hit = e.target.closest('.story-scene[data-kit] .try-hit');
    if (!hit) return;
    e.stopPropagation();
    tap(hit.closest('.story-scene'), hit);
  }, true);
  document.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.closest && e.target.closest('.story-scene[data-kit] .try-hit')) {
      e.preventDefault(); e.stopPropagation();
      tap(e.target.closest('.story-scene'), e.target.closest('.try-hit'));
    }
  }, true);

  window.MathSceneKit = {build, onBuild, tap, has: v => !!scenes[v]};
})();
