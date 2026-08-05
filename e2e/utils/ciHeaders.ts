export const CI_HEADERS: Record<string, string> = {
  'X-Gusto-Client': process.env.CI ? 'sdk-ci' : 'sdk-local',
}
