// Builds index.html: runs ChorusLogoMotion.tsx in React (with a stub "framer" module)
// next to a control panel for every prop, so settings can be tuned live and copied back.
// Also regenerates ChorusLogoMotionLight.tsx (same component, Cream colour) so the two never drift.
// Usage: node build.cjs
const fs = require('fs');
const path = require('path');
const tsx = fs.readFileSync(path.join(__dirname, 'ChorusLogoMotion.tsx'), 'utf8');

const light = tsx
  .replace('// Chorus Logo Motion — Framer code component.', '// Chorus Logo Motion (light, #FBF5EE) — Framer code component. Generated from ChorusLogoMotion.tsx by build.cjs.')
  .replace('    color: "#453830",', '    color: "#FBF5EE",')
  .replace('export default function ChorusLogoMotion(', 'export default function ChorusLogoMotionLight(')
  .replace('addPropertyControls(ChorusLogoMotion,', 'addPropertyControls(ChorusLogoMotionLight,');
fs.writeFileSync(path.join(__dirname, 'ChorusLogoMotionLight.tsx'), light);
const exportJs = fs.readFileSync(path.join(__dirname, 'logo-export.js'), 'utf8');
const html = `<!doctype html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Chorus Logo Motion</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;600&family=Source+Serif+Pro:wght@400&family=Valley+Sans:wght@400&display=swap">
<style>
  /* Chorus Health brand: Cream background, Brown text, Tan / Blue / Orange accents.
     Headlines Arizona Flare (Valley Sans as the Google fallback), eyebrows + buttons Outfit Semi-Bold, body Source Serif Pro. */
  :root {
    --cream: #FCF7F1; --brown: #453830; --tan: #D8AF96; --blue: #81B8D4; --orange: #EDAE7B; --white: #FFFFFF;
    --line: rgba(69, 56, 48, .14); --muted: rgba(69, 56, 48, .64);
    --headline: "Arizona Flare", "Valley Sans", Georgia, serif;
    --ui: "Outfit", system-ui, sans-serif;
    --body: "Source Serif Pro", Georgia, serif;
  }
  * { box-sizing: border-box; }
  body { margin: 0; min-height: 100vh; background: var(--cream); color: var(--brown); font: 14px/1.5 var(--body);
         display: grid; grid-template-columns: 1fr 360px; }
  .stage { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 28px; padding: 40px 16px; min-height: 100vh; }
  #app { max-width: calc(100vw - 400px); }
  @media (max-width: 760px) { #app { max-width: calc(100vw - 32px); } }
  .hint { color: var(--muted); margin: 0; font-size: 13px; }
  .bar { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }

  /* Eyebrow: Outfit Semi-Bold, small caps-style tracking. As a chip: white with a soft shadow. */
  .eyebrow, h2 { font: 600 11px/1 var(--ui); letter-spacing: .14em; text-transform: uppercase; }
  .chip { display: inline-block; background: var(--white); padding: 8px 10px; border-radius: 3px; box-shadow: 0 1px 2px rgba(69, 56, 48, .06); }

  /* Buttons: Outfit Semi-Bold caps. Primary = Brown fill, Cream text, arrow. Secondary = white chip. */
  button { font: 600 11px/1 var(--ui); letter-spacing: .12em; text-transform: uppercase; cursor: pointer;
           padding: 11px 14px; border: 0; border-radius: 4px; background: var(--white); color: var(--brown);
           box-shadow: 0 1px 2px rgba(69, 56, 48, .08); transition: box-shadow .2s, background .2s; }
  button:hover { box-shadow: 0 0 0 1px var(--tan), 0 4px 14px rgba(237, 174, 123, .35); }
  button:focus-visible { outline: 2px solid var(--blue); outline-offset: 2px; }
  button.primary { background: var(--brown); color: var(--cream); }
  button.primary::after { content: "  →"; }
  button.primary:hover { background: #2f2620; box-shadow: 0 4px 14px rgba(69, 56, 48, .25); }
  button:disabled { opacity: .5; cursor: progress; }

  aside { background: var(--cream); border-left: 1px solid var(--line); padding: 28px 28px 48px; overflow-y: auto; max-height: 100vh; position: sticky; top: 0; }
  .panel-head { margin: 0 0 26px; padding-bottom: 22px; border-bottom: 1px solid var(--line); }
  .panel-head .eyebrow { display: block; margin-bottom: 10px; }
  .panel-head h1 { font: 400 30px/1.1 var(--headline); margin: 0; }
  h2 { margin: 30px 0 14px; color: var(--brown); }
  h2:first-child { margin-top: 0; }
  #export h2 { margin-top: 36px; padding-top: 26px; border-top: 1px solid var(--line); }
  .row { display: grid; grid-template-columns: 1fr auto; gap: 4px 10px; margin-bottom: 14px; align-items: center; }
  .row label { font: 400 14px/1.3 var(--body); }
  .row output { font: 500 12px/1 var(--ui); font-variant-numeric: tabular-nums; color: var(--muted); }
  .row input[type=range] { grid-column: 1 / -1; width: 100%; accent-color: var(--brown); margin: 2px 0 0; }
  select { min-width: 150px; font: 500 12px/1 var(--ui); color: var(--brown); background: var(--white); border: 1px solid var(--line); border-radius: 4px; padding: 7px 8px; }
  input[type=color] { width: 34px; height: 26px; border: 1px solid var(--line); border-radius: 4px; padding: 2px; background: var(--white); }
  input[type=checkbox] { accent-color: var(--brown); width: 16px; height: 16px; }
  pre { background: var(--white); border: 1px solid var(--line); border-radius: 4px; padding: 12px; font: 11px/1.5 ui-monospace, Menlo, monospace; white-space: pre-wrap; margin: 0 0 12px; }
  a { color: var(--brown); text-decoration-color: var(--tan); text-underline-offset: 3px; }
  @media (max-width: 760px) {
    body { grid-template-columns: 1fr; }
    .stage { min-height: 60vh; }
    aside { border-left: 0; border-top: 1px solid var(--line); max-height: none; position: static; }
  }
</style>
<main class="stage">
  <span class="eyebrow chip">Live preview</span>
  <div id="app"></div>
  <p class="hint" id="hint"></p>
  <div class="bar">
    <button id="wave">Keep waving: on</button>
    <button id="replay">Replay intro</button>
    <button id="reset">Reset</button>
  </div>
</main>
<aside>
  <header class="panel-head">
    <span class="eyebrow">Chorus Health</span>
    <h1>Chorus Logo Motion</h1>
  </header>
  <div id="controls"></div>
  <h2>Settings</h2>
  <pre id="values"></pre>
  <button id="copy" class="primary">Copy settings</button>
  <div id="export"></div>
</aside>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.development.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.development.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.24.7/babel.min.js"></script>
<script type="text/plain" id="src">${tsx.replace(/<\/script/g, '<\\/script')}</script>
<script>
  const framer = { addPropertyControls() {}, ControlType: new Proxy({}, { get: (_, k) => k }),
                   RenderTarget: { canvas: 'canvas', preview: 'preview', current: () => 'preview' } };
  let code = document.getElementById('src').textContent
    .replace(/import \\{([^}]*)\\} from "react"/, 'const {$1} = React')
    .replace(/import \\{([^}]*)\\} from "framer"/, 'const {$1} = framer')
    .replace(/^import type .*$/m, '')
    .replace('export default function', 'function');
  code = Babel.transform(code, { filename: 'ChorusLogoMotion.tsx', presets: [['typescript', { isTSX: true, allExtensions: true }], 'react'] }).code;
  const engine = new Function('React', 'framer', code + '; return { ChorusLogoMotion, DEFAULTS, COLS, BEADS, WORDMARK, STROKE, ' +
    'LOCKUP_W, LOCKUP_H, LOCKUP_SCALE, WORDMARK_POS, SYMBOL_W, SYMBOL_H, stepMotion, poseColumns }')(React, framer);
  const { ChorusLogoMotion, DEFAULTS } = engine;
  window.ChorusLogoMotion = ChorusLogoMotion;

  // [key, label, type, ...options]
  const GROUPS = [
    ['Sequence', [
      ['intro',        'Intro',                 'bool'],
      ['introTrigger', 'Intro starts',          'enum', [['load', 'On load'], ['inView', 'In view']]],
      ['introWave',    'Intro wave length',     'range', 0, 10, 0.1, 's'],
      ['hover',        'Wave on hover',         'bool'],
      ['settle',       'Ease in / out',         'range', 0.2, 3, 0.05, 's'],
    ]],
    ['Wave', [
      ['wavelength',   'Wave width (lines per wave)', 'range', 3, 24, 0.5, ''],
      ['speed',        'Speed (seconds per wave)', 'range', 1, 12, 0.1, 's'],
      ['direction',    'Direction',             'enum', [['right', 'Left → right'], ['left', 'Right → left']]],
    ]],
    ['Outer lines', [
      ['lineAmp',      'Rise & fall',           'range', 0, 30, 0.5, 'px'],
      ['lineStretch',  'Height stretch',        'range', 0, 0.3, 0.005, '%'],
      ['lineFollow',   'Follow-through',        'range', 0, 0.25, 0.005, '%'],
    ]],
    ['Inner shapes', [
      ['beadAmp',      'Travel along line',     'range', 0, 40, 0.5, 'px'],
      ['depth',        'Depth swell',           'range', 0, 0.5, 0.01, '%'],
      ['stretch',      'Height stretch',        'range', 0, 0.3, 0.005, '%'],
      ['follow',       'Follow-through',        'range', 0, 0.25, 0.005, '%'],
    ]],
    ['Wordmark', [
      ['wordmark',     'Show wordmark',         'bool'],
      ['navHeight',    'Preview height',        'range', 24, 300, 1, 'px'],
    ]],
    ['Colour', [
      ['color',        'Logo',                  'color'],
    ]],
  ];
  const state = { ...DEFAULTS, navHeight: 300 };   // navHeight: preview only
  let keepWaving = true;   // preview only: holds the wave on (the component's alwaysWave prop)
  const fmt = (v, u) => u === '%' ? +(v * 100).toFixed(1) + '%' : v + u;
  const controls = document.getElementById('controls');
  for (const [title, items] of GROUPS) {
    const h = document.createElement('h2'); h.textContent = title; controls.append(h);
    for (const [key, label, type, ...o] of items) {
      const row = document.createElement('div'); row.className = 'row';
      let input;
      if (type === 'range') {
        row.innerHTML = '<label for="' + key + '">' + label + '</label><output id="o-' + key + '"></output>';
        input = Object.assign(document.createElement('input'), { type: 'range', id: key, min: o[0], max: o[1], step: o[2] });
        input.oninput = () => { state[key] = +input.value; update(); };
      } else if (type === 'bool') {
        row.innerHTML = '<label for="' + key + '">' + label + '</label>';
        input = Object.assign(document.createElement('input'), { type: 'checkbox', id: key });
        input.onchange = () => { state[key] = input.checked; update(); };
      } else if (type === 'enum') {
        row.innerHTML = '<label for="' + key + '">' + label + '</label>';
        input = document.createElement('select'); input.id = key;
        for (const [v, t] of o[0]) input.append(new Option(t, v));
        input.onchange = () => { state[key] = input.value; update(); };
      } else {
        row.innerHTML = '<label for="' + key + '">' + label + '</label>';
        input = Object.assign(document.createElement('input'), { type: 'color', id: key });
        input.oninput = () => { state[key] = input.value; update(); };
      }
      input.dataset.unit = o[3] ?? '';
      row.append(input); controls.append(row);
    }
  }
  function syncInputs() {
    for (const k in state) {
      const el = document.getElementById(k); if (!el) continue;
      if (el.type === 'checkbox') el.checked = state[k]; else el.value = state[k];
    }
  }

  const root = ReactDOM.createRoot(document.getElementById('app'));
  let mountKey = 0;
  function update() {
    // Size the stage like the real frame: height from the preview slider, width from the logo's proportions.
    const app = document.getElementById('app');
    const aspect = state.wordmark ? 262 / 37 : 237 / 263;
    const room = app.parentElement.clientWidth - 64;   // never wider than the stage
    const w = Math.min(state.navHeight * aspect, room);
    app.style.width = w + 'px'; app.style.height = (w / aspect) + 'px';
    const { navHeight, ...props } = state;
    root.render(React.createElement(ChorusLogoMotion, { ...props, alwaysWave: keepWaving, key: mountKey }));
    wave.textContent = 'Keep waving: ' + (keepWaving ? 'on' : 'off');
    hint.textContent = keepWaving ? 'Waving continuously — turn off to see the intro settle and the hover wave.' : 'Hover the logo to see the hover wave.';
    for (const k in state) { const o = document.getElementById('o-' + k); if (o) o.textContent = fmt(state[k], document.getElementById(k).dataset.unit); }
    values.textContent = JSON.stringify((({ navHeight, ...p }) => p)(state), null, 2);
    if (window.syncExport) syncExport();
  }
  wave.onclick = () => { keepWaving = !keepWaving; update(); };
  document.getElementById('replay').onclick = () => { mountKey++; update(); };
  document.getElementById('reset').onclick = () => { Object.assign(state, DEFAULTS); syncInputs(); mountKey++; update(); };
  document.getElementById('copy').onclick = async () => {
    try { await navigator.clipboard.writeText(values.textContent); copy.textContent = 'Copied'; }
    catch { getSelection().selectAllChildren(values); copy.textContent = 'Selected — press ⌘C'; }
    setTimeout(() => (copy.textContent = 'Copy settings'), 1500);
  };
  syncInputs();
  update();
  addEventListener('resize', update);
</script>
<script>
/*EXPORT_JS*/
  window.syncExport = buildExportPanel(document.getElementById('export'));
</script>
`;
fs.writeFileSync(path.join(__dirname, 'index.html'), html.replace('/*EXPORT_JS*/', () => exportJs));
console.log('built index.html');
