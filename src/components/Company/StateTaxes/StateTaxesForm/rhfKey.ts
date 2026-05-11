// react-hook-form's path parser strips `|`, `"`, `'`, and `]` from field names
// (see its stringToPath regex), which silently re-routes writes to a different
// path than reads. Tax requirement keys like `wa_wc_hourly_rate|010103` need
// the pipe replaced to round-trip through RHF state without losing values.
const PIPE_PLACEHOLDER = '__PIPE__'

export const toRhfKey = (key: string): string => key.replaceAll('|', PIPE_PLACEHOLDER)
export const fromRhfKey = (key: string): string => key.replaceAll(PIPE_PLACEHOLDER, '|')
