// Analytics and cookie-consent configuration for the docs site, in one place.
// Imported by docusaurus.config.ts (which declares the OneTrust consent platform in
// <head> at the application level) and by the src/clientModules/* modules (which load
// gusto-analytics and emit page views once consent is granted).
//
// Environment is resolved once, at build time, from NODE_ENV: `docusaurus build`
// (production) targets prod, `docusaurus start` (development) targets staging with the
// OneTrust `-test` script. Docusaurus replaces process.env.NODE_ENV with a literal in
// the client bundle, so this works in both the Node config and the browser module.
const IS_PRODUCTION = process.env.NODE_ENV === 'production'

export const CONFIG = {
  ANALYTICS: {
    /** gusto-analytics CDN bundle (page-view-only usage). */
    SCRIPT_URL: 'https://static.gusto.com/analytics/gusto-analytics-15.11.4.min.js',

    SNOWPLOW_APP_ID: 'gusto',
    SNOWPLOW_TRACKER_NAME: 'gusto_sdk_docs',
    SNOWPLOW_TRACKING_URL: IS_PRODUCTION ? 'snowplow.gusto.com' : 'snowplow.gusto-staging.com',
  },

  ONE_TRUST: {
    STUB_URL: 'https://cdn.cookielaw.org/scripttemplates/otSDKStub.js',

    /** Shared gusto.com OneTrust script; valid on gusto.com and its subdomains. */
    DOMAIN_SCRIPT: IS_PRODUCTION
      ? '103d2ca1-4f4e-48c4-a816-384722bdc85b'
      : '103d2ca1-4f4e-48c4-a816-384722bdc85b-test',

    /** OneTrust "Performance Cookies" group — the analytics-consent group we gate on. */
    PERFORMANCE_CONSENT_GROUP: 'C0002',

    /**
     * Footer link class that opens the OneTrust preference center. In opt-out regions
     * no banner is shown, so this is the only way to reach the consent controls.
     */
    COOKIE_SETTINGS_LINK_CLASS: 'docs-cookie-settings',
  },
}
