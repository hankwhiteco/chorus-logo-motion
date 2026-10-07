// Chorus Logo Motion (light, #FBF5EE) — Framer code component. Generated from ChorusLogoMotion.tsx by build.cjs.
// Intro: strings grow out from their centres, beads grow open, a short wave plays, then everything
// settles back to the exact original logo. Hover: the wave flows again and settles on leave.
//
// The wave is a travelling sine across the 8 strings (a rotating helix seen side-on). All
// motion is scaled by an "energy" value driven by a critically damped spring, so it eases in
// and out from any point in the cycle and rests on the untouched logo at zero.

import { useEffect, useRef } from "react"
import type { CSSProperties } from "react"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

// Per column, left to right: line x, line top, line bottom, bead top, bead bottom (viewBox units).
const COLS = [
    [8.98584, 47.8335, 245.209, 88.42, 217.57],
    [40.2573, 62.4041, 260.193, 67.49, 191.42],
    [71.4976, 40.9988, 260.205, 67.2, 157.94],
    [102.757, 32.2405, 251.483, 79, 195.97],
    [134.017, 16.1006, 228.882, 102.57, 222.47],
    [165.289, 2.56738, 216.401, 90.79, 218.88],
    [196.554, 6.20776, 222.469, 81.26, 202.5],
    [227.794, 22.3423, 232.828, 74.5, 162.52],
]
const BEADS = [
    "M8.98584 88.4211C8.38677 90.5736 7.81766 92.7261 7.2785 94.8785C2.42604 114.251 -0.00018145 133.623 -0.000182784 152.995C-0.000184118 172.367 2.42604 191.739 7.27849 211.111C7.81765 213.264 8.38676 215.416 8.98583 217.569C9.5849 215.416 10.154 213.264 10.6932 211.111C15.5456 191.739 17.9719 172.367 17.9719 152.995C17.9719 133.623 15.5456 114.251 10.6932 94.8785C10.154 92.7261 9.58491 90.5736 8.98584 88.4211Z",
    "M40.2573 67.4939C39.6583 69.5593 39.0891 71.6246 38.55 73.69C33.6975 92.2783 31.2713 110.867 31.2713 129.455C31.2713 148.043 33.6975 166.632 38.55 185.22C39.0891 187.285 39.6582 189.351 40.2573 191.416C40.8564 189.351 41.4255 187.285 41.9646 185.22C46.8171 166.632 49.2433 148.043 49.2433 129.455C49.2433 110.867 46.8171 92.2783 41.9647 73.69C41.4255 71.6246 40.8564 69.5593 40.2573 67.4939Z",
    "M71.4976 67.2046C70.8985 68.7169 70.3294 70.2291 69.7902 71.7414C64.9378 85.3518 62.5115 98.9623 62.5115 112.573C62.5115 126.183 64.9378 139.794 69.7902 153.404C70.3294 154.916 70.8985 156.428 71.4976 157.941C72.0966 156.428 72.6657 154.916 73.2049 153.404C78.0573 139.794 80.4836 126.183 80.4836 112.573C80.4836 98.9623 78.0574 85.3518 73.2049 71.7414C72.6657 70.2291 72.0966 68.7169 71.4976 67.2046Z",
    "M102.757 79.0012C102.158 80.9507 101.589 82.9002 101.05 84.8497C96.1975 102.395 93.7713 119.94 93.7713 137.486C93.7713 155.031 96.1975 172.577 101.05 190.122C101.589 192.072 102.158 194.021 102.757 195.971C103.356 194.021 103.925 192.072 104.465 190.122C109.317 172.577 111.743 155.031 111.743 137.486C111.743 119.94 109.317 102.395 104.465 84.8497C103.926 82.9002 103.356 80.9507 102.757 79.0012Z",
    "M134.017 102.568C133.418 104.566 132.849 106.564 132.31 108.563C127.457 126.548 125.031 144.533 125.031 162.519C125.031 180.504 127.457 198.489 132.31 216.474C132.849 218.473 133.418 220.471 134.017 222.469C134.616 220.471 135.185 218.473 135.724 216.474C140.577 198.489 143.003 180.504 143.003 162.519C143.003 144.533 140.577 126.548 135.724 108.563C135.185 106.564 134.616 104.566 134.017 102.568Z",
    "M165.289 90.7922C164.69 92.927 164.12 95.0618 163.581 97.1966C158.729 116.41 156.303 135.623 156.303 154.836C156.303 174.049 158.729 193.262 163.581 212.475C164.12 214.61 164.69 216.745 165.289 218.88C165.888 216.745 166.457 214.61 166.996 212.475C171.848 193.262 174.275 174.049 174.275 154.836C174.275 135.623 171.848 116.41 166.996 97.1966C166.457 95.0618 165.888 92.927 165.289 90.7922Z",
    "M196.554 81.2634C195.955 83.2841 195.386 85.3047 194.847 87.3254C189.994 105.511 187.568 123.697 187.568 141.883C187.568 160.069 189.994 178.255 194.847 196.441C195.386 198.461 195.955 200.482 196.554 202.503C197.153 200.482 197.722 198.461 198.262 196.441C203.114 178.255 205.54 160.069 205.54 141.883C205.54 123.697 203.114 105.511 198.262 87.3254C197.722 85.3047 197.153 83.2841 196.554 81.2634Z",
    "M227.794 162.519C228.394 161.052 228.963 159.585 229.502 158.118C234.354 144.916 236.78 131.714 236.78 118.512C236.78 105.309 234.354 92.1073 229.502 78.9052C228.963 77.4383 228.394 75.9714 227.794 74.5045C227.195 75.9714 226.626 77.4383 226.087 78.9052C221.235 92.1073 218.808 105.309 218.808 118.512C218.808 131.714 221.235 144.916 226.087 158.118C226.626 159.585 227.195 161.052 227.794 162.519Z",
]
// Wordmark paths, drawn in a 212 × 17 box.
const WORDMARK = [
    "M8.87386 16.9282C3.95694 16.9282 0 13.7908 0 8.52265C0 3.16087 4.26132 0 8.89727 0C10.6065 0 12.3391 0.42145 13.7439 1.19411V4.49546H13.6035C12.4796 2.97356 10.9343 2.17749 9.22506 2.17749C5.85347 2.17749 3.58232 4.63595 3.58232 8.17144C3.58232 12.0347 6.13443 14.3059 9.59968 14.3059C11.3089 14.3059 12.784 13.7674 14.1654 12.8308L14.6103 14.5868C12.9479 16.2024 11.0513 16.9282 8.87386 16.9282Z",
    "M33.217 0.327794V0.444863C32.6784 1.28776 32.5145 2.17749 32.5145 3.81646V13.0884C32.5145 14.7273 32.6784 15.6405 33.217 16.4834V16.6004H28.5108V16.4834C29.0727 15.6405 29.2132 14.7273 29.2132 13.0884V9.50603H21.6505V13.0884C21.6505 14.7273 21.791 15.6405 22.3529 16.4834V16.6004H17.6467V16.4834C18.1853 15.6405 18.3492 14.7273 18.3492 13.0884V3.81646C18.3492 2.17749 18.1853 1.28776 17.6467 0.444863V0.327794H22.3529V0.444863C21.791 1.28776 21.6505 2.17749 21.6505 3.81646V7.37537H29.2132V3.81646C29.2132 2.17749 29.0727 1.28776 28.5108 0.444863V0.327794H33.217Z",
    "M45.1361 16.9282C40.266 16.9282 36.7539 13.4864 36.7539 8.47582C36.7539 3.48867 40.2426 0 45.1361 0C50.0296 0 53.5182 3.48867 53.5182 8.47582C53.5182 13.4864 50.0062 16.9282 45.1361 16.9282ZM45.1361 14.6805C48.1799 14.6805 49.9359 12.2455 49.9359 8.47582C49.9359 4.70619 48.1799 2.22432 45.1361 2.22432C42.0923 2.22432 40.3362 4.70619 40.3362 8.47582C40.3362 12.2455 42.0923 14.6805 45.1361 14.6805Z",
    "M65.6693 8.82703L71.7803 16.5536V16.6004H67.7063L62.2041 9.29531H60.9865V13.0181C60.9865 14.7273 61.127 15.6405 61.689 16.4834V16.6004H57.0062V16.4834C57.5681 15.6405 57.7086 14.7273 57.7086 13.0181V3.79305C57.7086 2.27115 57.6149 1.28776 57.0062 0.444863V0.327794H63.1406C66.7932 0.327794 69.2048 2.01359 69.2048 4.70619C69.2048 6.67295 67.8702 8.17144 65.6693 8.82703ZM60.9865 2.38821V7.23489H62.6723C64.6157 7.23489 65.7864 6.29833 65.7864 4.7296C65.7864 3.13746 64.5454 2.38821 62.7192 2.38821H60.9865Z",
    "M81.3754 16.9282C77.0439 16.9282 74.4918 14.3995 74.4918 9.74017V3.86329C74.4918 2.2009 74.3279 1.26435 73.7894 0.444863V0.327794H78.4955V0.444863C77.957 1.26435 77.7931 2.2009 77.7931 3.86329V9.787C77.7931 12.3391 78.9872 14.3293 81.7501 14.3293C84.3022 14.3293 85.6602 12.5732 85.6602 9.787V3.8867C85.6602 2.22432 85.4729 1.21752 84.9578 0.444863V0.327794H88.8445V0.444863C88.3294 1.21752 88.1421 2.22432 88.1421 3.8867V9.71675C88.1421 14.3059 85.707 16.9282 81.3754 16.9282Z",
    "M97.0633 16.9282C95.2604 16.9282 93.5746 16.3429 92.2166 15.3361V12.0113H92.3571C93.598 13.8844 95.3541 14.7273 96.9228 14.7273C98.2808 14.7273 99.7325 14.0951 99.7325 12.5732C99.7325 11.4962 99.0066 10.8874 97.8125 10.3489L95.7287 9.38896C93.6449 8.42899 92.5678 6.95392 92.5678 5.05739C92.5678 2.15408 95.0731 0 98.4447 0C100.06 0 101.559 0.444863 102.519 1.07704V4.33156H102.378C101.535 2.95015 100.06 2.17749 98.5384 2.17749C97.0164 2.17749 95.7755 2.92673 95.7755 4.37839C95.7755 5.33836 96.3843 5.99395 97.6955 6.60271L99.9432 7.63292C101.887 8.52265 102.964 9.90407 102.964 11.8708C102.964 14.8912 100.341 16.9282 97.0633 16.9282Z",
    "M128.66 0.327794V0.444863C128.122 1.28776 127.958 2.17749 127.958 3.81646V13.0884C127.958 14.7273 128.122 15.6405 128.66 16.4834V16.6004H123.954V16.4834C124.516 15.6405 124.657 14.7273 124.657 13.0884V9.50603H117.094V13.0884C117.094 14.7273 117.235 15.6405 117.796 16.4834V16.6004H113.09V16.4834C113.629 15.6405 113.793 14.7273 113.793 13.0884V3.81646C113.793 2.17749 113.629 1.28776 113.09 0.444863V0.327794H117.796V0.444863C117.235 1.28776 117.094 2.17749 117.094 3.81646V7.37537H124.657V3.81646C124.657 2.17749 124.516 1.28776 123.954 0.444863V0.327794H128.66Z",
    "M144.817 13.0181H144.958V16.6004H132.736V16.4834C133.298 15.6405 133.438 14.7039 133.438 12.9713V3.79305C133.438 2.2009 133.274 1.26435 132.736 0.444863V0.327794H144.607V3.58232H144.466C143.787 2.78625 142.921 2.45846 140.861 2.45846H136.74V7.35195H139.901C141.774 7.35195 142.476 7.04757 143.085 6.48564H143.225V10.3255H143.085C142.523 9.76358 141.727 9.48262 139.901 9.48262H136.74V14.4698H141.235C143.061 14.4698 144.092 14.1888 144.817 13.0181Z",
    "M156.503 0.327794L161.584 12.9713C162.24 14.5868 162.638 15.617 163.434 16.4834V16.6004H158.447V16.4834C158.938 15.617 158.704 14.4932 158.142 13.0181L157.838 12.2455H151.586L151.305 12.9713C150.72 14.5166 150.556 15.6405 151.141 16.4834V16.6004H146.95V16.4834C147.84 15.6405 148.191 14.5166 148.753 13.0649L153.74 0.327794H156.503ZM154.607 4.23791L152.382 10.1148H157.018L154.747 4.23791H154.607Z",
    "M165.991 16.6004V16.4834C166.483 15.8044 166.693 14.7273 166.693 13.0649V3.93353C166.693 2.45846 166.647 1.45166 165.991 0.444863V0.327794H170.697V0.444863C170.042 1.45166 169.995 2.45846 169.995 3.93353V14.4698H173.577C175.45 14.4698 176.551 14.142 177.206 12.8074H177.37V16.6004H165.991Z",
    "M183.749 16.6004V16.4834C184.404 15.6639 184.568 14.7507 184.568 13.0415V2.43504H183.093C181.056 2.43504 179.979 2.85649 179.441 3.67598H179.3V0.327794H193.138V3.67598H192.997C192.435 2.85649 191.382 2.43504 189.345 2.43504H187.87V13.0415C187.87 14.7507 188.033 15.6639 188.689 16.4834V16.6004H183.749Z",
    "M211.661 0.327794V0.444863C211.122 1.28776 210.958 2.17749 210.958 3.81646V13.0884C210.958 14.7273 211.122 15.6405 211.661 16.4834V16.6004H206.955V16.4834C207.517 15.6405 207.657 14.7273 207.657 13.0884V9.50603H200.094V13.0884C200.094 14.7273 200.235 15.6405 200.797 16.4834V16.6004H196.091V16.4834C196.629 15.6405 196.793 14.7273 196.793 13.0884V3.81646C196.793 2.17749 196.629 1.28776 196.091 0.444863V0.327794H200.797V0.444863C200.235 1.28776 200.094 2.17749 200.094 3.81646V7.37537H207.657V3.81646C207.657 2.17749 207.517 1.28776 206.955 0.444863V0.327794H211.661Z",
]
// Lockup (symbol + wordmark), matching the 262 × 37 nav artwork: the symbol is this file's
// artwork scaled by LOCKUP_SCALE with its top-left at (0, 0); the wordmark sits at full size at WORDMARK_POS.
const LOCKUP_W = 262
const LOCKUP_H = 37
const LOCKUP_SCALE = 0.13974
const WORDMARK_POS = [48.7808, 8.94905]
const SYMBOL_W = 237
const SYMBOL_H = 263
const STROKE = 5.13487
const CAP = STROKE / 2 // round caps extend each line end by half the stroke width
const TAU = Math.PI * 2

// Intro timing (seconds)
const DRAW_DUR = 0.9
const DRAW_STAGGER = 0.07
const GROW_DELAY = 0.6
const GROW_DUR = 0.8
const GROW_STAGGER = 0.08
const WAVE_START = 1.0

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5)

// Smoothly keeps x inside [lo, hi]: untouched mid-range, eases to a stop near either end, never crosses.
function softClamp(x: number, lo: number, hi: number, k = 1.5) {
    if (hi <= lo) return (lo + hi) / 2
    x = lo + k * Math.log1p(Math.exp((x - lo) / k))
    x = hi - k * Math.log1p(Math.exp((hi - x) / k))
    return Math.min(hi, Math.max(lo, x))
}

interface Props {
    color: string
    intro: boolean
    introTrigger: "load" | "inView"
    introWave: number
    hover: boolean
    alwaysWave: boolean
    wordmark: boolean
    settle: number
    wavelength: number
    speed: number
    direction: "right" | "left"
    lineAmp: number
    lineStretch: number
    lineFollow: number
    beadAmp: number
    depth: number
    stretch: number
    follow: number
    style?: CSSProperties
}

// ---- Motion engine (pure functions, also used by the export tool) ----

interface Motion {
    introDone: boolean
    phase: number // wave position, in wavelengths
    energy: number // 0 = resting logo, 1 = full wave
    velocity: number
}
type Matrix = [number, number, number, number, number, number]
interface ColumnPose {
    line: Matrix // transform for the outer line
    draw: number // 0–1, how much of the line has grown in (intro)
    bead: Matrix // transform for the inner shape
}

const GROW_END = GROW_DELAY + 7 * GROW_STAGGER + GROW_DUR

// Advances the motion by dt seconds. introT = seconds since the intro began (Infinity if not playing),
// wantWave = hover / always-wave. Returns true once everything is at rest.
function stepMotion(s: Motion, p: Props, dt: number, introT: number, wantWave: boolean): boolean {
    let target = wantWave ? 1 : 0
    if (!s.introDone && Number.isFinite(introT)) {
        const waveEnd = WAVE_START + p.introWave
        if (introT >= WAVE_START && introT < waveEnd) target = 1
        if (introT >= Math.max(waveEnd, GROW_END)) s.introDone = true
    }
    // Critically damped spring towards target: smooth start and finish, no overshoot.
    const w = 6 / Math.max(0.1, p.settle)
    s.velocity += (w * w * (target - s.energy) - 2 * w * s.velocity) * dt
    s.energy += s.velocity * dt
    s.phase += dt / Math.max(0.1, p.speed)

    const resting = s.introDone && target === 0 && Math.abs(s.energy) < 1e-4 && Math.abs(s.velocity) < 1e-4
    if (resting) {
        s.energy = 0
        s.velocity = 0
    }
    return resting
}

// Pose of each column (in symbol viewBox units) for the current motion state.
function poseColumns(s: Motion, p: Props, introT: number): ColumnPose[] {
    const dir = p.direction === "left" ? -1 : 1
    const e = s.energy
    return COLS.map(([x, lt, lb, bt, bb], i) => {
        const draw = s.introDone ? 1 : easeInOutCubic(clamp01((introT - i * DRAW_STAGGER) / DRAW_DUR))
        const grow = s.introDone ? 1 : easeOutQuint(clamp01((introT - GROW_DELAY - i * GROW_STAGGER) / GROW_DUR))

        const ph = TAU * (i / p.wavelength - dir * s.phase)
        const pl = ph + TAU * p.lineFollow * dir
        const pb = ph + TAU * p.follow * dir

        // Outer line: rise/fall + height stretch about its centre.
        const ys = -e * p.lineAmp * Math.sin(pl)
        const ls = 1 + e * p.lineStretch * Math.sin(pl)
        const lc0 = (lt + lb) / 2

        // Inner shape: travel, depth swell, height stretch — always kept within its line.
        const size = 1 + e * p.depth * Math.cos(pb)
        const lc = lc0 + ys
        const lh = ((lb - lt) / 2) * ls + CAP
        const bc = (bt + bb) / 2
        const bh0 = (bb - bt) / 2
        const sy = Math.min(size * (1 + e * p.stretch * Math.sin(pb)), (lh - 0.1) / bh0) * grow
        const bh = bh0 * sy
        // Blend hard → soft clamp by energy: soft easing near the ends while moving,
        // exact original position at rest (some beads already sit near a line end).
        const want = bc + ys - e * p.beadAmp * Math.sin(pb)
        const lo = lc - lh + bh
        const hi = lc + lh - bh
        const hard = Math.min(hi, Math.max(lo, want))
        const yb = hard + e * (softClamp(want, lo, hi) - hard) - bc

        return {
            line: [1, 0, 0, ls, 0, lc0 * (1 - ls) + ys],
            draw,
            bead: [size, 0, 0, sy, x * (1 - size), bc * (1 - sy) + yb],
        }
    })
}

const DEFAULTS: Omit<Props, "style"> = {
    color: "#FBF5EE",
    intro: true,
    introTrigger: "load",
    introWave: 7.1,
    hover: true,
    alwaysWave: false,
    wordmark: true,
    settle: 1.2,
    wavelength: 14,
    speed: 4,
    direction: "right",
    lineAmp: 5,
    lineStretch: 0.165,
    lineFollow: 0.185,
    beadAmp: 16,
    depth: 0.04,
    stretch: 0.185,
    follow: 0.06,
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 * @framerIntrinsicWidth 262
 * @framerIntrinsicHeight 37
 */
export default function ChorusLogoMotionLight(rawProps: Partial<Props>) {
    const props = { ...DEFAULTS, ...rawProps } as Props
    const { color, intro, introTrigger, style } = props
    const isCanvas = RenderTarget.current() === RenderTarget.canvas
    const playIntro = intro && !isCanvas

    const rootRef = useRef<HTMLDivElement>(null)
    const lineRefs = useRef<(SVGPathElement | null)[]>([])
    const beadRefs = useRef<(SVGPathElement | null)[]>([])
    const propsRef = useRef(props)
    const wakeRef = useRef<(() => void) | null>(null)
    propsRef.current = props

    // Animation state lives in a ref so frames never trigger React renders.
    const st = useRef({
        raf: 0,
        last: 0,
        introStart: -1, // performance.now() seconds when the intro began, -1 = not started
        introDone: !playIntro,
        phase: 0,
        energy: 0,
        velocity: 0,
        hovered: false,
    })

    useEffect(() => {
        if (isCanvas) return
        const s = st.current
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches

        const render = (introT: number) => {
            const poses = poseColumns(s, propsRef.current, introT)
            poses.forEach((pose, i) => {
                const line = lineRefs.current[i]
                const bead = beadRefs.current[i]
                if (!line || !bead) return
                line.setAttribute("transform", `matrix(${pose.line.join(" ")})`)
                // Grow from the centre: a dash of length `draw`, offset so it stays centred on the line.
                // Hidden at zero length, where a round cap would otherwise show as a dot.
                line.style.strokeDasharray = `${pose.draw} 1`
                line.style.strokeDashoffset = String(-(1 - pose.draw) / 2)
                line.style.visibility = pose.draw > 0 ? "" : "hidden"
                bead.setAttribute("transform", `matrix(${pose.bead.join(" ")})`)
            })
        }

        const frame = (nowMs: number) => {
            const p = propsRef.current
            const now = nowMs / 1000
            const dt = Math.min(0.05, s.last ? now - s.last : 0)
            s.last = now

            const introT = !s.introDone && s.introStart >= 0 ? now - s.introStart : Infinity
            const resting = stepMotion(s, p, dt, introT, (s.hovered && p.hover) || p.alwaysWave)
            render(introT)
            if (resting) {
                s.raf = 0
                s.last = 0
            } else {
                s.raf = requestAnimationFrame(frame)
            }
        }

        const wake = () => {
            if (!s.raf) s.raf = requestAnimationFrame(frame)
        }
        wakeRef.current = wake

        const startIntro = () => {
            if (s.introStart >= 0 || s.introDone) return
            s.introStart = performance.now() / 1000
            wake()
        }

        if (reduced) {
            s.introDone = true
            render(Infinity)
            return
        }

        let io: IntersectionObserver | undefined
        if (!s.introDone) {
            if (introTrigger === "inView" && rootRef.current && "IntersectionObserver" in window) {
                io = new IntersectionObserver(
                    (entries) => {
                        if (entries.some((en) => en.isIntersecting)) {
                            startIntro()
                            io?.disconnect()
                        }
                    },
                    { threshold: 0.3 }
                )
                io.observe(rootRef.current)
            } else {
                startIntro()
            }
        }

        const el = rootRef.current
        const enter = () => {
            s.hovered = true
            wake()
        }
        const leave = () => {
            s.hovered = false
            wake()
        }
        el?.addEventListener("pointerenter", enter)
        el?.addEventListener("pointerleave", leave)
        return () => {
            io?.disconnect()
            el?.removeEventListener("pointerenter", enter)
            el?.removeEventListener("pointerleave", leave)
            cancelAnimationFrame(s.raf)
            s.raf = 0
            s.last = 0
        }
    }, [isCanvas, introTrigger])

    // Toggling Always Wave needs to restart the frame loop if it had come to rest.
    useEffect(() => wakeRef.current?.(), [props.alwaysWave])

    // Initial markup matches the first intro frame (or the resting logo), so nothing flashes before JS runs.
    const hidden = playIntro

    // Optional wordmark: lays out the nav lockup exactly (in symbol units). The whole component is the hover area.
    const viewBox = props.wordmark
        ? `0 0 ${LOCKUP_W / LOCKUP_SCALE} ${LOCKUP_H / LOCKUP_SCALE}`
        : `0 0 ${SYMBOL_W} ${SYMBOL_H}`
    return (
        <div ref={rootRef} style={{ ...style, width: "100%", height: "100%" }}>
            <svg
                viewBox={viewBox}
                preserveAspectRatio={props.wordmark ? "xMinYMid meet" : "xMidYMid meet"}
                width="100%"
                height="100%"
                fill="none"
                style={{ display: "block", overflow: "visible" }}
                aria-hidden="true"
            >
                <g stroke={color} strokeWidth={STROKE} strokeLinecap="round">
                    {COLS.map(([x, lt, lb], i) => (
                        <path
                            key={i}
                            ref={(n) => { lineRefs.current[i] = n }}
                            d={`M${x} ${lt}L${x} ${lb}`}
                            pathLength={1}
                            style={hidden ? { strokeDasharray: "0 1", visibility: "hidden" } : undefined}
                        />
                    ))}
                </g>
                <g fill={color}>
                    {BEADS.map((d, i) => {
                        const [x, , , bt, bb] = COLS[i]
                        const bc = (bt + bb) / 2
                        return (
                            <path
                                key={i}
                                ref={(n) => { beadRefs.current[i] = n }}
                                d={d}
                                transform={hidden ? `matrix(1 0 0 0 0 ${bc})` : undefined}
                            />
                        )
                    })}
                </g>
                {props.wordmark && (
                    <g
                        fill={color}
                        transform={`translate(${WORDMARK_POS[0] / LOCKUP_SCALE} ${WORDMARK_POS[1] / LOCKUP_SCALE}) scale(${1 / LOCKUP_SCALE})`}
                    >
                        {WORDMARK.map((d, i) => (
                            <path key={i} d={d} />
                        ))}
                    </g>
                )}
            </svg>
        </div>
    )
}


const CONTROLS: Record<string, any> = {
    color: { type: ControlType.Color, title: "Color" },
    intro: { type: ControlType.Boolean, title: "Intro" },
    introTrigger: {
        type: ControlType.Enum,
        title: "Intro Starts",
        options: ["load", "inView"],
        optionTitles: ["On Load", "In View"],
        hidden: (p: Props) => !p.intro,
    },
    introWave: {
        type: ControlType.Number,
        title: "Intro Wave",
        min: 0,
        max: 10,
        step: 0.1,
        unit: "s",
        hidden: (p: Props) => !p.intro,
    },
    hover: { type: ControlType.Boolean, title: "Wave on Hover" },
    alwaysWave: { type: ControlType.Boolean, title: "Always Wave" },
    wordmark: { type: ControlType.Boolean, title: "Wordmark", description: "Nav lockup, 262 × 37" },
    settle: { type: ControlType.Number, title: "Ease In/Out", min: 0.2, max: 3, step: 0.05, unit: "s" },
    wavelength: { type: ControlType.Number, title: "Wave Width", min: 3, max: 24, step: 0.5 },
    speed: { type: ControlType.Number, title: "Speed", min: 1, max: 12, step: 0.1, unit: "s" },
    direction: {
        type: ControlType.Enum,
        title: "Direction",
        options: ["right", "left"],
        optionTitles: ["→", "←"],
        displaySegmentedControl: true,
    },
    lineAmp: { type: ControlType.Number, title: "Line Rise", min: 0, max: 30, step: 0.5, unit: "px" },
    lineStretch: { type: ControlType.Number, title: "Line Stretch", min: 0, max: 0.3, step: 0.005 },
    lineFollow: { type: ControlType.Number, title: "Line Follow", min: 0, max: 0.25, step: 0.005 },
    beadAmp: { type: ControlType.Number, title: "Shape Travel", min: 0, max: 40, step: 0.5, unit: "px" },
    depth: { type: ControlType.Number, title: "Shape Depth", min: 0, max: 0.5, step: 0.01 },
    stretch: { type: ControlType.Number, title: "Shape Stretch", min: 0, max: 0.3, step: 0.005 },
    follow: { type: ControlType.Number, title: "Shape Follow", min: 0, max: 0.25, step: 0.005 },
}
for (const key in CONTROLS) CONTROLS[key].defaultValue = (DEFAULTS as any)[key]
addPropertyControls(ChorusLogoMotionLight, CONTROLS)
