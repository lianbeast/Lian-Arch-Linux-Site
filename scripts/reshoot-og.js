/**
 * Re-shoots public/demo.gif — the social preview image.
 *
 * The old file is a screenshot of the rejected cyan-on-black design, and it is
 * the og:image and twitter:image, so it is the first thing a reader sees when
 * this page is shared. This captures the current site instead.
 *
 * Produces two things:
 *   public/demo.png  — a static 1440px hero shot, for platforms that ignore GIFs
 *   public/demo.gif  — a 2-second slow scroll, 2fps, 600px tall
 *
 * Requires: playwright, ffmpeg. Run:  node scripts/reshoot-og.js
 */

import { chromium } from 'playwright'
import { execFileSync } from 'node:child_process'
import { mkdirSync, existsSync, rmSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(ROOT, '..', 'tmp', 'og')
const PNG_OUT = join(ROOT, '..', 'public', 'demo.png')
const GIF_OUT = join(ROOT, '..', 'public', 'demo.gif')

const WIDTH = 1440
const HEIGHT = 900
const SCROLL_FRAMES = 12
const SCROLL_DURATION_MS = 2400

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true })

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || '/home/arch/.claude-server-commander/puppeteer-cache/chrome/linux-149.0.7827.54/chrome-linux64/chrome',
  args: ['--no-sandbox', '--disable-dev-shm-usage']
})
const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } })

// The backdrop animates; give it a beat so the frame is alive but not jittery.
await page.goto('http://localhost:5173/', {
  waitUntil: 'networkidle',
  timeout: 30000,
})
await page.waitForTimeout(1500)

// ---- 1. Static hero PNG ------------------------------------------------
await page.screenshot({ path: join(OUT_DIR, 'hero.png'), fullPage: false })
console.log('wrote hero.png')

// ---- 2. Slow-scroll GIF ------------------------------------------------
const frames = []
const step = 700 / SCROLL_FRAMES
for (let i = 0; i <= SCROLL_FRAMES; i++) {
  await page.evaluate((y) => window.scrollTo(0, y), i * step)
  const path = join(OUT_DIR, `f${String(i).padStart(2, '0')}.png`)
  await page.screenshot({ path })
  frames.push(path)
}

await browser.close()

// ffmpeg: 2fps, loop forever, 2s total
execFileSync('ffmpeg', [
  '-y',
  '-loglevel', 'error',
  '-framerate', '2',
  '-i', join(OUT_DIR, 'f%02d.png'),
  '-vf', 'fps=2,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse',
  '-loop', '0',
  GIF_OUT,
])

// Copy the first frame as the static PNG too (cleaner than a raw screenshot
// for platforms that need a still image).
execFileSync('cp', [frames[0], PNG_OUT])

console.log(`wrote demo.gif (${SCROLL_FRAMES + 1} frames, ~${SCROLL_DURATION_MS}ms)`)
console.log(`wrote demo.png (${WIDTH}x${HEIGHT})`)