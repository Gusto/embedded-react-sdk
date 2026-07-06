/**
 * Identity of the shared sandbox prototype that backs all sdk-app design
 * comments. The sandbox API keys prototypes by (repository, pull_request_number).
 * We use a single stable prototype for the whole design surface and scope each
 * individual design by its route path (see `route_path`), so every developer
 * and designer reads/writes the same shared comment set.
 */
export const SANDBOX_REPOSITORY = 'Gusto/embedded-react-sdk'
export const SANDBOX_PULL_REQUEST_NUMBER = 0
export const SANDBOX_PREVIEW_URL = 'http://localhost:5200'

/** Same-origin path served by the Vite dev-server proxy (dev only). */
export const SANDBOX_API_PREFIX = '/sdk-app/api/sandbox'
