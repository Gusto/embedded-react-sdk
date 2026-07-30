export const CI_HEADERS: Record<string, string> = process.env.CI
  ? { 'X-Gusto-Client': 'sdk-ci' }
  : {}
