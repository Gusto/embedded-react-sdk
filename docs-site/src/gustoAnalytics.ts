import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment'

// Page-view-only analytics for sdk.gusto.com via the shared gusto-analytics client
// (routes to Snowplow, inherits Gusto's CPRA/GDPR handling), gated on OneTrust consent.
//
// Env is keyed off the runtime hostname: the production domain sends to prod;
// localhost and preview domains send to staging with the OneTrust `-test` script
// (which is valid on any domain).

const PRODUCTION_HOSTNAME = 'sdk.gusto.com'

// OneTrust "Performance Cookies" group — analytics consent.
const PERFORMANCE_CONSENT_GROUP = 'C0002'

const ANALYTICS_SCRIPT_URL = 'https://static.gusto.com/analytics/gusto-analytics-15.11.4.min.js'
const ONETRUST_STUB_URL = 'https://cdn.cookielaw.org/scripttemplates/otSDKStub.js'

// Shared gusto.com OneTrust script; valid on gusto.com and its subdomains. The
// `-test` variant is valid on any domain, for local dev and preview builds.
const ONETRUST_PROD_DOMAIN_SCRIPT = '103d2ca1-4f4e-48c4-a816-384722bdc85b'

interface GustoAnalyticsClient {
  page: (prop: { name: string; data?: Record<string, unknown> }) => void
}

declare global {
  interface Window {
    gustoAC?: Record<string, unknown>
    GustoAnalytics?: GustoAnalyticsClient
    OnetrustActiveGroups?: string
    OptanonWrapper?: () => void
    OneTrust?: { ToggleInfoDisplay: () => void }
  }
}

// Footer link class that opens the OneTrust preference center. In opt-out regions
// no banner is shown, so this is the only way to reach the consent controls.
const COOKIE_SETTINGS_LINK_CLASS = 'docs-cookie-settings'

// Resolves once the CDN bundle has run and published the client; memoized so the
// script is injected once and all callers await the same load.
let clientPromise: Promise<GustoAnalyticsClient> | null = null

// OneTrust may invoke OptanonWrapper several times per page load, so the landing
// page view is guarded to fire only once; SPA navigations go through onRouteDidUpdate.
let landingPageViewSent = false

function isProductionHost(): boolean {
  return window.location.hostname === PRODUCTION_HOSTNAME
}

// OneTrust publishes granted groups as a comma-delimited string (e.g. ",C0001,C0002,").
function hasPerformanceConsent(): boolean {
  const groups = window.OnetrustActiveGroups
  return typeof groups === 'string' && groups.split(',').includes(PERFORMANCE_CONSENT_GROUP)
}

function loadAnalyticsClient(): Promise<GustoAnalyticsClient> {
  if (clientPromise) return clientPromise

  clientPromise = new Promise<GustoAnalyticsClient>((resolve, reject) => {
    // gusto-analytics reads this config when it runs; set it before the script loads.
    window.gustoAC = {
      snowplowEnabled: true,
      snowplowAppId: 'gusto',
      snowplowTrackerName: 'gusto_sdk_docs',
      snowplowTrackingUrl: isProductionHost() ? 'snowplow.gusto.com' : 'snowplow.gusto-staging.com',
      snowplowCollectorMode: 'legacy',
      // Docs routes aren't recognized by the client's auto page-name resolver, so we
      // fire page views manually on each route change instead.
      autoPageEvent: false,
    }

    const script = document.createElement('script')
    script.src = ANALYTICS_SCRIPT_URL
    script.async = true
    script.addEventListener('load', () => {
      if (window.GustoAnalytics) {
        resolve(window.GustoAnalytics)
      } else {
        // Clear the memo so a later navigation can retry.
        clientPromise = null
        reject(new Error('gusto-analytics loaded but did not publish a client'))
      }
    })
    script.addEventListener('error', () => {
      clientPromise = null
      reject(new Error(`Failed to load gusto-analytics from ${ANALYTICS_SCRIPT_URL}`))
    })
    document.head.appendChild(script)
  })

  return clientPromise
}

// Consent is re-checked after the async load resolves so withdrawing it mid-session
// stops tracking — the gusto-analytics client itself does not suppress events on opt-out.
function sendPageView(): void {
  if (!hasPerformanceConsent()) return
  void loadAnalyticsClient()
    .then(client => {
      if (!hasPerformanceConsent()) return
      client.page({ name: document.title || window.location.pathname })
    })
    .catch(() => {
      // Analytics is best-effort; a failed load must never surface to the reader.
    })
}

function handleConsent(): void {
  if (landingPageViewSent || !hasPerformanceConsent()) return
  landingPageViewSent = true
  sendPageView()
}

function injectOneTrust(): void {
  // OneTrust invokes OptanonWrapper once its CMP loads and again on every consent
  // change, so this bridges consent state into analytics loading. It must be defined
  // before the stub script runs.
  window.OptanonWrapper = handleConsent

  const script = document.createElement('script')
  script.src = ONETRUST_STUB_URL
  script.setAttribute(
    'data-domain-script',
    isProductionHost() ? ONETRUST_PROD_DOMAIN_SCRIPT : `${ONETRUST_PROD_DOMAIN_SCRIPT}-test`,
  )
  document.head.appendChild(script)
}

// Delegated so it survives client-side navigation, where the footer re-renders.
function handleCookieSettingsClick(event: MouseEvent): void {
  const target = event.target
  if (target instanceof Element && target.closest(`.${COOKIE_SETTINGS_LINK_CLASS}`)) {
    event.preventDefault()
    window.OneTrust?.ToggleInfoDisplay()
  }
}

if (ExecutionEnvironment.canUseDOM) {
  injectOneTrust()
  document.addEventListener('click', handleCookieSettingsClick)
}

// react-helmet-async flushes the new <title> on an animation frame after the route
// renders, so document.title still holds the previous page's title when
// onRouteDidUpdate fires. Wait (a few frames, capped) for it to change before reading
// it for the page name, so the view isn't attributed to the prior page.
function sendPageViewAfterTitleUpdate(previousTitle: string, framesRemaining: number): void {
  if (document.title !== previousTitle || framesRemaining === 0) {
    sendPageView()
    return
  }
  requestAnimationFrame(() => sendPageViewAfterTitleUpdate(previousTitle, framesRemaining - 1))
}

// Docusaurus client-module lifecycle: fires after every client-side route change.
// - Skips the initial load (previousLocation is null); that page view is sent once
//   consent resolves, via OptanonWrapper.
// - Skips same-pathname updates (in-page anchors, query changes) to avoid double-counting.
export function onRouteDidUpdate({
  previousLocation,
  location,
}: {
  previousLocation: { pathname: string } | null
  location: { pathname: string }
}): void {
  if (!previousLocation || location.pathname === previousLocation.pathname) return
  sendPageViewAfterTitleUpdate(document.title, 10)
}
