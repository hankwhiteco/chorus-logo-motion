// Export tool for index.html: renders the logo frame-by-frame with the component's own
// motion engine (stepMotion / poseColumns) onto a canvas, then encodes a GIF (gifenc) or MP4 (WebCodecs + mp4-muxer).
// Expects `engine` (internals returned from ChorusLogoMotion.tsx) and `state` (current settings) as globals.

const GIFENC_URL = 'https://cdn.jsdelivr.net/npm/gifenc@1.0.3/dist/gifenc.esm.js';
const MP4MUXER_URL = 'https://cdn.jsdelivr.net/npm/mp4-muxer@5.1.3/build/mp4-muxer.mjs';
const MAX_SECONDS = 60;

const ex = {
  format: 'gif',      // 'gif' | 'mp4'
  content: 'symbol',  // 'full' | 'symbol'
  mode: 'loop',       // 'loop' | 'intro'
  transparent: true,  // GIF only — MP4 (H.264) can't carry transparency
  background: '#FCF7F1',   // brand Cream
  height: 400,        // px
  padding: 0.08,      // fraction of height on each side, room for motion that overshoots the artwork
  fps: 30,
  hold: 1,            // s to hold the resting logo at the end of an intro export
};

// ---- Drawing ----

function contentBox() {
  const E = engine;
  return ex.content === 'full'
    ? { w: E.LOCKUP_W / E.LOCKUP_SCALE, h: E.LOCKUP_H / E.LOCKUP_SCALE }
    : { w: E.SYMBOL_W, h: E.SYMBOL_H };
}

function canvasSize() {
  const box = contentBox();
  const k = ex.height / (box.h * (1 + 2 * ex.padding));   // px per symbol unit
  const even = v => Math.max(2, Math.round(v / 2) * 2);    // H.264 needs even dimensions
  const pad = ex.padding * box.h * k;
  return { w: even(box.w * k + 2 * pad), h: even(ex.height), k, pad };
}

const paths = {};
function path2d(d) { return paths[d] || (paths[d] = new Path2D(d)); }

function drawFrame(ctx, size, poses, opaque) {
  const E = engine, { k, pad } = size;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, size.w, size.h);
  if (opaque) { ctx.fillStyle = ex.background; ctx.fillRect(0, 0, size.w, size.h); }
  ctx.fillStyle = ctx.strokeStyle = state.color;

  // Outer lines: only the grown-in middle section, transformed like the SVG.
  ctx.setTransform(k, 0, 0, k, pad, pad);
  ctx.lineWidth = E.STROKE;
  ctx.lineCap = 'round';
  poses.forEach((pose, i) => {
    if (pose.draw <= 0) return;
    const [x, lt, lb] = E.COLS[i];
    const c = (lt + lb) / 2, half = ((lb - lt) / 2) * pose.draw;
    const [, , , d, , f] = pose.line;
    ctx.beginPath();
    ctx.moveTo(x, d * (c - half) + f);
    ctx.lineTo(x, d * (c + half) + f);
    ctx.stroke();
  });
  // Inner shapes.
  poses.forEach((pose, i) => {
    ctx.setTransform(k, 0, 0, k, pad, pad);
    ctx.transform(...pose.bead);
    ctx.fill(path2d(E.BEADS[i]));
  });
  // Wordmark (static).
  if (ex.content === 'full') {
    ctx.setTransform(k, 0, 0, k, pad, pad);
    ctx.translate(E.WORDMARK_POS[0] / E.LOCKUP_SCALE, E.WORDMARK_POS[1] / E.LOCKUP_SCALE);
    ctx.scale(1 / E.LOCKUP_SCALE, 1 / E.LOCKUP_SCALE);
    E.WORDMARK.forEach(d => ctx.fill(path2d(d)));
  }
}

// ---- Frame sequences (deterministic: fixed time step, same engine as the component) ----

function* frames() {
  const E = engine, props = { ...state }, dt = 1 / ex.fps;
  if (ex.mode === 'loop') {
    // One full wavelength of travel at full energy: phase 0 → 1 lands back on frame 0, so it loops seamlessly.
    const n = Math.max(2, Math.round(props.speed * ex.fps));
    for (let i = 0; i < n; i++) {
      const s = { introDone: true, phase: i / n, energy: 1, velocity: 0 };
      yield { poses: E.poseColumns(s, props, Infinity), index: i, total: n };
    }
    return;
  }
  // Intro: draw-in, grow, intro wave, settle — until fully at rest — then hold.
  const s = { introDone: false, phase: 0, energy: 0, velocity: 0 };
  const maxFrames = MAX_SECONDS * ex.fps;
  let i = 0, restFrames = 0;
  const holdFrames = Math.round(ex.hold * ex.fps);
  while (i < maxFrames) {
    const t = i * dt;
    const resting = E.stepMotion(s, props, i ? dt : 0, t, false);
    yield { poses: E.poseColumns(s, props, s.introDone ? Infinity : t), index: i, total: null };
    i++;
    if (resting) { if (++restFrames > holdFrames) return; } else restFrames = 0;
  }
}

// ---- Encoders ----

async function encodeGif(size, onProgress) {
  const { GIFEncoder, quantize, applyPalette } = await import(GIFENC_URL);
  const canvas = new OffscreenCanvas(size.w, size.h);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const gif = GIFEncoder();
  const delay = Math.round(1000 / ex.fps);
  const matte = hexToRgb(ex.background);
  const transparent = ex.transparent;
  for (const fr of frames()) {
    drawFrame(ctx, size, fr.poses, !transparent);
    const { data } = ctx.getImageData(0, 0, size.w, size.h);
    if (transparent) matteEdges(data, matte);   // GIF has 1-bit alpha: blend soft edges onto the background colour
    const palette = quantize(data, 256, transparent ? { format: 'rgba4444', oneBitAlpha: true } : { format: 'rgb565' });
    const index = applyPalette(data, palette, transparent ? 'rgba4444' : 'rgb565');
    const ti = transparent ? palette.findIndex(c => c[3] === 0) : -1;
    gif.writeFrame(index, size.w, size.h, {
      palette, delay,
      repeat: ex.mode === 'loop' ? 0 : -1,          // loop forever, or play the intro once
      transparent: ti >= 0, transparentIndex: Math.max(0, ti),
      dispose: transparent ? 2 : -1,                 // clear between frames so transparent areas don't smear
    });
    await onProgress(fr);
  }
  gif.finish();
  return new Blob([gif.bytes()], { type: 'image/gif' });
}

// Fallback when WebCodecs isn't available (it needs a secure context, e.g. not a data: URL):
// MediaRecorder captures the canvas in real time, so the export takes as long as the animation.
async function encodeMp4Realtime(size, onProgress) {
  const type = ['video/mp4;codecs=avc1.42E01E', 'video/mp4;codecs=avc1', 'video/mp4'].find(t => MediaRecorder.isTypeSupported(t));
  if (!type) throw new Error('This browser can’t record MP4 — open the page in Chrome, Edge or Safari.');
  const canvas = document.createElement('canvas');
  canvas.width = size.w; canvas.height = size.h;
  const ctx = canvas.getContext('2d');
  const stream = canvas.captureStream(0);
  const track = stream.getVideoTracks()[0];
  const rec = new MediaRecorder(stream, { mimeType: type, videoBitsPerSecond: Math.round(size.w * size.h * ex.fps * 0.15) });
  const chunks = [];
  rec.ondataavailable = e => e.data.size && chunks.push(e.data);
  const stopped = new Promise(r => (rec.onstop = r));
  drawFrame(ctx, size, engine.poseColumns({ introDone: true, phase: 0, energy: 0, velocity: 0 }, state, Infinity), true);
  rec.start();
  const start = performance.now(), ms = 1000 / ex.fps;
  for (const fr of frames()) {
    drawFrame(ctx, size, fr.poses, true);
    track.requestFrame();
    await onProgress(fr, true);
    const wait = start + (fr.index + 1) * ms - performance.now();
    if (wait > 0) await new Promise(r => setTimeout(r, wait));
  }
  rec.stop();
  await stopped;
  return new Blob(chunks, { type: 'video/mp4' });
}

async function encodeMp4(size, onProgress) {
  if (!('VideoEncoder' in window)) return encodeMp4Realtime(size, onProgress);
  const { Muxer, ArrayBufferTarget } = await import(MP4MUXER_URL);
  const bitrate = Math.round(size.w * size.h * ex.fps * 0.15);
  let config;
  for (const codec of ['avc1.640034', 'avc1.4d0034', 'avc1.42003e']) {
    const c = { codec, width: size.w, height: size.h, bitrate, framerate: ex.fps };
    if ((await VideoEncoder.isConfigSupported(c)).supported) { config = c; break; }
  }
  if (!config) throw new Error('H.264 encoding at ' + size.w + '×' + size.h + ' is not supported here — try a smaller size.');
  const muxer = new Muxer({ target: new ArrayBufferTarget(), video: { codec: 'avc', width: size.w, height: size.h }, fastStart: 'in-memory' });
  let failure;
  const encoder = new VideoEncoder({ output: (chunk, meta) => muxer.addVideoChunk(chunk, meta), error: e => (failure = e) });
  encoder.configure(config);
  const canvas = new OffscreenCanvas(size.w, size.h);
  const ctx = canvas.getContext('2d');
  const us = 1e6 / ex.fps;
  for (const fr of frames()) {
    drawFrame(ctx, size, fr.poses, true);
    const frame = new VideoFrame(canvas, { timestamp: Math.round(fr.index * us), duration: Math.round(us) });
    encoder.encode(frame, { keyFrame: fr.index % (ex.fps * 2) === 0 });
    frame.close();
    if (encoder.encodeQueueSize > 8) await encoder.flush();
    if (failure) throw failure;
    await onProgress(fr);
  }
  await encoder.flush();
  if (failure) throw failure;
  muxer.finalize();
  return new Blob([muxer.target.buffer], { type: 'video/mp4' });
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
// Pixels under ~12% coverage become fully transparent; the rest are blended over the matte and made opaque.
function matteEdges(d, [mr, mg, mb]) {
  for (let i = 0; i < d.length; i += 4) {
    const a = d[i + 3];
    if (a === 255) continue;
    if (a < 32) { d[i + 3] = 0; continue; }
    const t = a / 255;   // canvas data is un-premultiplied
    d[i] = d[i] * t + mr * (1 - t);
    d[i + 1] = d[i + 1] * t + mg * (1 - t);
    d[i + 2] = d[i + 2] * t + mb * (1 - t);
    d[i + 3] = 255;
  }
}

// ---- React component (.tsx / .jsx) ----
// Turns the Framer component source into a plain React component: drops the framer import and property
// controls, and bakes the current settings in as defaults. Every setting stays overridable as a prop.

function buildReactComponent(lang) {
  let src = document.getElementById('src').textContent;
  const edit = (pattern, replacement, what) => {
    if (!pattern.test(src)) throw new Error('Could not convert the component (' + what + ' not found) — ChorusLogoMotion.tsx may have changed.');
    src = src.replace(pattern, replacement);
  };
  const props = { ...state, wordmark: ex.content === 'full' };
  const defaults = Object.keys(engine.DEFAULTS).map(k => '    ' + k + ': ' + JSON.stringify(props[k]) + ',').join('\n');

  edit(/^\/\/ Chorus Logo Motion — Framer code component\.\n/, '"use client"\n\n// Chorus Logo Motion — React component (generated from ChorusLogoMotion.tsx by the logo test page).\n', 'header');
  edit(/^import \{[^}]*\} from "framer"\n/m, '', 'framer import');
  edit(/const isCanvas = RenderTarget\.current\(\) === RenderTarget\.canvas/, 'const isCanvas = false', 'RenderTarget check');
  edit(/const DEFAULTS: Omit<Props, "style"> = \{[\s\S]*?\n\}\n/, 'const DEFAULTS: Omit<Props, "style"> = {\n' + defaults + '\n}\n', 'defaults');
  edit(/\/\*\*\n \* @framerSupportedLayoutWidth[\s\S]*?\*\/\n/,
    '/**\n * <ChorusLogoMotion /> fills its parent, keeping the logo\'s proportions' +
    (props.wordmark ? ' (262 × 37 lockup)' : ' (237 × 263 symbol)') + '.\n' +
    ' * Size it with a wrapper or the style prop, e.g. <ChorusLogoMotion style={{ height: 37 }} />.\n' +
    ' * Every default below can be overridden as a prop. Motion may extend a little beyond the frame.\n */\n', 'Framer doc comment');
  edit(/\n+const CONTROLS[\s\S]*$/, '\n', 'property controls');

  if (lang === 'jsx') {
    src = Babel.transform(src, { filename: 'ChorusLogoMotion.tsx', presets: [['typescript', { isTSX: true, allExtensions: true }]], retainLines: false }).code;
    src = src.replace(/^"use client";/, '"use client"');
  }
  return src;
}

// ---- UI ----

function buildExportPanel(container) {
  container.innerHTML = `
    <h2>Export</h2>
    <div class="row"><label for="ex-format">Format</label>
      <select id="ex-format"><option value="gif">GIF</option><option value="mp4">MP4</option>
        <option value="tsx">React component (.tsx)</option><option value="jsx">React component (.jsx)</option></select></div>
    <div class="row"><label for="ex-content">Content</label>
      <select id="ex-content"><option value="full">Full logo</option><option value="symbol">Symbol only</option></select></div>
    <div class="row" id="ex-mode-row"><label for="ex-mode">Animation</label>
      <select id="ex-mode"><option value="loop">Seamless loop</option><option value="intro">Intro only (plays once)</option></select></div>
    <div class="row" id="ex-transparent-row"><label for="ex-transparent">Transparent background</label>
      <input type="checkbox" id="ex-transparent"></div>
    <div class="row" id="ex-background-row"><label for="ex-background" id="ex-background-label">Background</label>
      <input type="color" id="ex-background"></div>
    <div class="row" id="ex-height-row"><label for="ex-height">Height</label>
      <select id="ex-height"><option>200</option><option>400</option><option>600</option><option>800</option><option>1080</option></select></div>
    <div class="row" id="ex-fps-row"><label for="ex-fps">Frame rate</label>
      <select id="ex-fps"><option value="25">25 fps</option><option value="30">30 fps</option><option value="50">50 fps</option><option value="60">60 fps</option></select></div>
    <p class="hint" id="ex-note" style="margin-bottom:14px"></p>
    <button id="ex-go" class="primary">Export</button>
    <p class="hint" id="ex-status" style="margin-top:12px"></p>
    <div id="ex-result"></div>`;
  const $ = id => container.querySelector('#' + id);
  const fields = ['format', 'content', 'mode', 'transparent', 'background', 'height', 'fps'];
  const sync = () => {
    for (const f of fields) { const el = $('ex-' + f); if (el.type === 'checkbox') el.checked = ex[f]; else el.value = ex[f]; }
    const gif = ex.format === 'gif', react = ex.format === 'tsx' || ex.format === 'jsx';
    $('ex-transparent-row').style.display = gif ? '' : 'none';
    for (const r of ['mode', 'background', 'height', 'fps']) $('ex-' + r + '-row').style.display = react ? 'none' : '';
    if (react) {
      $('ex-note').textContent = 'Standalone React component — no Framer needed. Includes the intro, hover wave and settle, with your current settings as defaults' +
        (ex.content === 'full' ? ' and the wordmark on.' : ', symbol only.') + ' Needs React 17+.';
      return;
    }
    $('ex-background-label').textContent = gif && ex.transparent ? 'Edge colour (page background)' : 'Background';
    const size = canvasSize();
    const dur = ex.mode === 'loop' ? state.speed.toFixed(1) + 's loop' : 'intro, plays once';
    $('ex-note').textContent = size.w + ' × ' + size.h + ' px · ' + dur + (gif
      ? (ex.transparent ? ' · GIF transparency is on/off per pixel, so soft edges are blended onto the edge colour — set it to the page background.' : '')
      : ' · MP4 can’t be transparent; uses the background colour.' + (ex.mode === 'loop' ? ' Set the video to loop where you place it.' : ''));
  };
  for (const f of fields) {
    const el = $('ex-' + f);
    el.addEventListener(el.type === 'checkbox' || el.tagName === 'SELECT' ? 'change' : 'input', () => {
      ex[f] = el.type === 'checkbox' ? el.checked : (f === 'height' || f === 'fps') ? +el.value : el.value;
      sync();
      $('ex-result').innerHTML = ''; $('ex-status').textContent = '';
    });
  }
  $('ex-go').onclick = async () => {
    const btn = $('ex-go'), status = $('ex-status'), result = $('ex-result');
    btn.disabled = true; result.innerHTML = '';
    const size = canvasSize();
    let last = 0;
    const onProgress = async (fr, realtime) => {
      if (performance.now() - last > 60) {   // keep the page responsive and show progress
        status.textContent = (realtime ? 'Recording in real time, frame ' : 'Rendering frame ') + (fr.index + 1) + (fr.total ? ' / ' + fr.total : '') + '…';
        last = performance.now();
        if (!realtime) await new Promise(r => setTimeout(r, 0));
      }
    };
    try {
      if (ex.format === 'tsx' || ex.format === 'jsx') {
        const code = buildReactComponent(ex.format);
        const blob = new Blob([code], { type: 'text/plain' });
        window.__lastExport = blob;
        const name = 'ChorusLogoMotion.' + ex.format;
        status.textContent = 'Done · ' + code.split('\n').length + ' lines';
        const pre = document.createElement('pre');
        pre.style.cssText = 'max-height:220px;overflow:auto;white-space:pre;margin:10px 0';
        pre.textContent = code;
        const link = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: name, textContent: 'Download ' + name });
        link.style.cssText = 'color:var(--text);font-weight:500';
        result.append(pre, link);
        return;
      }
      const t0 = performance.now();
      const blob = ex.format === 'gif' ? await encodeGif(size, onProgress) : await encodeMp4(size, onProgress);
      window.__lastExport = blob;
      const url = URL.createObjectURL(blob);
      const name = 'chorus-logo-' + ex.content + '-' + ex.mode + (ex.format === 'gif' && ex.transparent ? '-transparent' : '') + '.' + ex.format;
      status.textContent = 'Done in ' + ((performance.now() - t0) / 1000).toFixed(1) + 's · ' + (blob.size / 1024 / 1024).toFixed(2) + ' MB';
      const preview = ex.format === 'gif'
        ? Object.assign(document.createElement('img'), { src: url, alt: 'Exported GIF' })
        : Object.assign(document.createElement('video'), { src: url, muted: true, loop: true, autoplay: true, playsInline: true, controls: true });
      preview.style.cssText = 'display:block;max-width:100%;margin:10px 0;border:1px solid var(--line);border-radius:6px;' +
        'background:repeating-conic-gradient(#ddd 0 25%, #fff 0 50%) 0 0 / 16px 16px';
      const link = Object.assign(document.createElement('a'), { href: url, download: name, textContent: 'Download ' + name });
      link.style.cssText = 'color:var(--text);font-weight:500';
      result.append(preview, link);
    } catch (err) {
      status.textContent = 'Export failed: ' + (err && err.message || err);
      console.error(err);
    } finally {
      btn.disabled = false;
    }
  };
  sync();
  return sync;   // call when logo settings change (duration / size note depends on them)
}
