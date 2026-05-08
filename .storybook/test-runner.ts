/**
 * Storybook test-runner configuration.
 *
 * Performs a loose visual regression smoke test by taking a single screenshot
 * per story file (the first story encountered for a given CSF title) and
 * comparing it to a committed PNG baseline under `.storybook/__screenshots__/`.
 * Subsequent stories in the same file are skipped — the goal is a smoke test,
 * not exhaustive per-story coverage.
 *
 * The threshold is intentionally very loose:
 *   - per-pixel color sensitivity: 0.2 (Playwright/pixelmatch default)
 *   - allowed pixel-ratio difference: 0.5 (50% of pixels)
 *
 * The intent is to catch catastrophic visual regressions (wrong design system,
 * broken theme, missing CSS) without flagging minor layout, font, or anti-alias
 * differences. For tighter visual checks, prefer Chromatic or per-component
 * snapshot tests with their own tighter thresholds.
 *
 * Workflow:
 *   - Run `npm run test:visual` locally against a running Storybook.
 *   - Run `npm run test:visual:update` (or set `UPDATE_SCREENSHOTS=1`) to
 *     regenerate baselines. Baselines are platform-sensitive — generate them
 *     in CI (Linux) and commit the resulting PNGs.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { TestRunnerConfig } from '@storybook/test-runner'
import { getStoryContext } from '@storybook/test-runner'
import pixelmatch from 'pixelmatch'
import { PNG } from 'pngjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const SCREENSHOT_DIR = join(__dirname, '__screenshots__')
const DIFF_DIR = join(__dirname, '__screenshots__', '__diff_output__')

// Pixelmatch per-pixel color tolerance (0 = exact, 1 = any color).
const PIXEL_THRESHOLD = 0.2
// Allowed fraction of differing pixels relative to the total.
const MAX_DIFF_PIXEL_RATIO = 0.5

const shouldUpdate = process.env.UPDATE_SCREENSHOTS === '1'

// Track which story-file titles we've already snapshotted so that we only run
// the visual diff against the first story per file (smoke test, not exhaustive).
const snapshottedTitles = new Set<string>()

const ensureDir = (dir: string) => {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
}

const titleToBaselineId = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

const config: TestRunnerConfig = {
  async postVisit(page, context) {
    const storyContext = await getStoryContext(page, context)

    // Allow individual stories to opt out of visual diffing via parameters.
    if (storyContext.parameters?.visualTest?.skip === true) {
      return
    }

    // One screenshot per story file: skip if we've already snapshotted a story
    // with the same CSF title.
    if (snapshottedTitles.has(context.title)) {
      return
    }
    snapshottedTitles.add(context.title)

    const baselineId = titleToBaselineId(context.title)

    // Wait for any pending fonts/images so the screenshot is stable.
    await page
      .evaluate(() => (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts?.ready)
      .catch(() => undefined)

    const elementHandle = await page.$('#storybook-root')
    const screenshotBuffer = elementHandle
      ? await elementHandle.screenshot()
      : await page.screenshot({ fullPage: true })

    ensureDir(SCREENSHOT_DIR)
    const baselinePath = join(SCREENSHOT_DIR, `${baselineId}.png`)

    if (!existsSync(baselinePath) || shouldUpdate) {
      writeFileSync(baselinePath, screenshotBuffer)
      return
    }

    const baseline = PNG.sync.read(readFileSync(baselinePath))
    const actual = PNG.sync.read(screenshotBuffer)

    if (baseline.width !== actual.width || baseline.height !== actual.height) {
      ensureDir(DIFF_DIR)
      writeFileSync(join(DIFF_DIR, `${baselineId}-actual.png`), screenshotBuffer)
      throw new Error(
        `Visual diff size mismatch for "${context.title}": baseline ${baseline.width}x${baseline.height}, actual ${actual.width}x${actual.height}. Run UPDATE_SCREENSHOTS=1 to refresh.`,
      )
    }

    const { width, height } = baseline
    const diff = new PNG({ width, height })
    const diffPixels = pixelmatch(baseline.data, actual.data, diff.data, width, height, {
      threshold: PIXEL_THRESHOLD,
    })
    const diffRatio = diffPixels / (width * height)

    if (diffRatio > MAX_DIFF_PIXEL_RATIO) {
      ensureDir(DIFF_DIR)
      writeFileSync(join(DIFF_DIR, `${baselineId}-actual.png`), screenshotBuffer)
      writeFileSync(join(DIFF_DIR, `${baselineId}-diff.png`), PNG.sync.write(diff))
      throw new Error(
        `Visual diff exceeded threshold for "${context.title}": ${(diffRatio * 100).toFixed(2)}% of pixels differ (max ${(
          MAX_DIFF_PIXEL_RATIO * 100
        ).toFixed(0)}%). See ${DIFF_DIR} for the actual screenshot and diff.`,
      )
    }
  },
}

export default config
