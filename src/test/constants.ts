/**
 * Base URL for API calls in tests.
 *
 * @remarks
 * Uses the reserved `.test` domain, so it never resolves. A request that MSW does not handle fails
 * right away instead of reaching the real Gusto API, and no real connection is left open for a
 * later test to reuse.
 */
export const API_BASE_URL = 'https://api.gusto.test'
