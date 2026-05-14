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
 * Per-story configuration:
 *   Stories can customize behavior via parameters.visualTest:
 *     - skip: boolean - skip visual diffing for this story
 *     - threshold: number - override per-pixel color tolerance (0-1)
 *     - maxDiffPixelRatio: number - override allowed pixel difference (0-1)
 *
 * Workflow:
 *   - Run `npm run test:visual` locally against a running Storybook.
 *   - Run `npm run test:visual:update` (or set `UPDATE_SCREENSHOTS=1`) to
 *     regenerate baselines. Baselines are platform-sensitive — generate them
 *     in CI (Linux) and commit the resulting PNGs.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
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

// Default pixelmatch per-pixel color tolerance (0 = exact, 1 = any color).
const DEFAULT_PIXEL_THRESHOLD = 0.2
// Default allowed fraction of differing pixels relative to the total.
const DEFAULT_MAX_DIFF_PIXEL_RATIO = 0.5

const shouldUpdate = process.env.UPDATE_SCREENSHOTS === '1'

// Track which story-file titles we've already snapshotted so that we only run
// the visual diff against the first story per file (smoke test, not exhaustive).
const snapshottedTitles = new Set<string>()

const ensureDir = (dir: string) => {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
}

const titleToBaselineId = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

// Track baseline generation metadata
const metadataPath = join(SCREENSHOT_DIR, '.baseline-metadata.json')
let metadataUpdated = false

const updateMetadata = () => {
  if (metadataUpdated) return
  metadataUpdated = true

  const baselineCount = existsSync(SCREENSHOT_DIR)
    ? readdirSync(SCREENSHOT_DIR).filter((f: string) => f.endsWith('.png')).length
    : 0

  const metadata = {
    version: '1.0',
    description: 'Metadata for visual regression test baselines',
    lastGenerated: new Date().toISOString(),
    platform: process.platform,
    nodeVersion: process.version,
    baselineCount,
    generatedBy: process.env.CI ? 'CI' : 'local',
  }

  writeFileSync(metadataPath, JSON.stringify(metadata, null, 2) + '\n')
}

const config: TestRunnerConfig = {
  // Visual smoke tests should be JUST visual: load the story, screenshot,
  // compare. The default test-storybook pipeline also runs @storybook/addon-a11y
  // in `afterEach`, which calls `axe.run()` against the document body before
  // STORY_FINISHED fires. We've seen this deadlock under headless Linux
  // Chromium for stories that mount with an open <dialog> (axe is the most
  // plausible suspect: STORY_RENDERED runs first, applyAfterEach is what's
  // outstanding). Skip the a11y addon by setting its `manual` global —
  // Storybook UI is unaffected, and a11y is verified separately in unit tests.
  async prepare({ page, browserContext, testRunnerConfig: cfg }) {
    const target = process.env.TARGET_URL ?? ''
    const iframeURL = new URL('iframe.html', target)
    iframeURL.searchParams.set('globals', 'a11y.manual:!true')
    if (cfg?.getHttpHeaders) {
      await browserContext.setExtraHTTPHeaders(await cfg.getHttpHeaders(iframeURL.toString()))
    }
    await page.goto(iframeURL.toString(), { waitUntil: 'load' })
  },
  async preVisit(page, context) {
    // Increase timeout for stories that need it (e.g. Suspense + dialog)
    // Default timeout is set via --testTimeout CLI flag in package.json
    const storyContext = await getStoryContext(page, context)
    const timeout = storyContext.parameters?.visualTest?.timeout
    if (timeout && typeof timeout === 'number') {
      page.setDefaultTimeout(timeout)
    }
  },
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

    // Allow per-story threshold overrides
    const pixelThreshold = storyContext.parameters?.visualTest?.threshold ?? DEFAULT_PIXEL_THRESHOLD
    const maxDiffPixelRatio =
      storyContext.parameters?.visualTest?.maxDiffPixelRatio ?? DEFAULT_MAX_DIFF_PIXEL_RATIO

    // Wait for any pending fonts/images so the screenshot is stable.
    await page
      .evaluate(() => (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts?.ready)
      .catch(() => undefined)

    // Wait for any animations to complete and for content to stabilize
    await page.waitForTimeout(500)

    // Wait for network idle to ensure all async content has loaded
    await page.waitForLoadState('networkidle').catch(() => undefined)

    const elementHandle = await page.$('#storybook-root')
    const screenshotBuffer = elementHandle
      ? await elementHandle.screenshot()
      : await page.screenshot({ fullPage: true })

    ensureDir(SCREENSHOT_DIR)
    const baselinePath = join(SCREENSHOT_DIR, `${baselineId}.png`)

    if (!existsSync(baselinePath) || shouldUpdate) {
      writeFileSync(baselinePath, screenshotBuffer)
      updateMetadata()
      console.log(`✓ ${shouldUpdate ? 'Updated' : 'Created'} baseline: ${baselineId}.png`)
      return
    }

    const baseline = PNG.sync.read(readFileSync(baselinePath))
    const actual = PNG.sync.read(screenshotBuffer)

    if (baseline.width !== actual.width || baseline.height !== actual.height) {
      ensureDir(DIFF_DIR)
      writeFileSync(join(DIFF_DIR, `${baselineId}-actual.png`), screenshotBuffer)
      throw new Error(
        `Visual diff size mismatch for "${context.title}" (${context.id}):\n` +
          `  Baseline: ${baseline.width}x${baseline.height}\n` +
          `  Actual:   ${actual.width}x${actual.height}\n\n` +
          `To update this baseline:\n` +
          `  npm run test:visual:update\n\n` +
          `Or in CI, the baseline will be auto-committed on the next run.`,
      )
    }

    const { width, height } = baseline
    const diff = new PNG({ width, height })
    const diffPixels = pixelmatch(baseline.data, actual.data, diff.data, width, height, {
      threshold: pixelThreshold,
    })
    const diffRatio = diffPixels / (width * height)

    if (diffRatio > maxDiffPixelRatio) {
      ensureDir(DIFF_DIR)
      writeFileSync(join(DIFF_DIR, `${baselineId}-actual.png`), screenshotBuffer)
      writeFileSync(join(DIFF_DIR, `${baselineId}-diff.png`), PNG.sync.write(diff))
      throw new Error(
        `Visual diff exceeded threshold for "${context.title}" (${context.id}):\n` +
          `  Diff:      ${(diffRatio * 100).toFixed(2)}% of pixels differ\n` +
          `  Threshold: ${(maxDiffPixelRatio * 100).toFixed(2)}% max allowed\n` +
          `  Diff file: ${DIFF_DIR}/${baselineId}-diff.png\n\n` +
          `To update this baseline:\n` +
          `  npm run test:visual:update\n\n` +
          `Or review the diff output and adjust the story if the change is unintended.`,
      )
    }
  },
}

export default config
