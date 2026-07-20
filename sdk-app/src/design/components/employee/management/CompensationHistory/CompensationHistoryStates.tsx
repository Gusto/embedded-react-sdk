import type { Job } from '@gusto/embedded-api/models/components/job'
import { CompensationHistory } from './CompensationHistory'

export interface CompensationHistoryDemoProps {
  jobs: Job[]
}

/**
 * Renders CompensationHistory for state demos. The component is purely
 * presentational and accepts an optional `onBack` — omitted here so the
 * back affordance is hidden.
 */
export function CompensationHistoryDemo({ jobs }: CompensationHistoryDemoProps) {
  return <CompensationHistory jobs={jobs} />
}
