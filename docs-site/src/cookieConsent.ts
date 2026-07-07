import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment'
import { CONFIG } from './config'

// OneTrust publishes granted groups as a comma-delimited string (e.g. ",C0001,C0002,").
export function hasPerformanceConsent(): boolean {
  const groups = window.OnetrustActiveGroups
  return (
    typeof groups === 'string' &&
    groups.split(',').includes(CONFIG.ONE_TRUST.PERFORMANCE_CONSENT_GROUP)
  )
}

// Opens the OneTrust preference center. Delegated from document so it survives
// client-side navigation, where the footer re-renders. In opt-out regions no banner
// shows, so this link is the only route to the consent controls. OneTrust itself is
// loaded at the application level, via docusaurus.config.ts headTags.
function handleCookieSettingsClick(event: MouseEvent): void {
  const target = event.target
  if (
    target instanceof Element &&
    target.closest(`.${CONFIG.ONE_TRUST.COOKIE_SETTINGS_LINK_CLASS}`)
  ) {
    event.preventDefault()
    window.OneTrust?.ToggleInfoDisplay()
  }
}

if (ExecutionEnvironment.canUseDOM) {
  document.addEventListener('click', handleCookieSettingsClick)
}
