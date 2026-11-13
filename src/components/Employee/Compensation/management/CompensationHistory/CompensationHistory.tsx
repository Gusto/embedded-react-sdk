import { useCompensationHistory } from '../../shared/useCompensationHistory'
import { CompensationHistoryPresentation } from './CompensationHistoryPresentation'
import { BaseBoundaries, BaseLayout } from '@/components/Base/Base'
import type { LoaderComponentType } from '@/components/Base'
import type { OnEventType } from '@/components/Base/useBase'
import { useUnstableFeature } from '@/contexts/UnstableFeaturesProvider/useUnstableFeature'
import { useI18n } from '@/i18n'
import { componentEvents, type EventType } from '@/shared/constants'

/**
 * Props for {@link CompensationHistory}.
 *
 * @alpha
 */
export interface CompensationHistoryProps {
  /** The associated employee identifier. */
  employeeId: string
  /** Callback invoked when the component emits an event. See the events table on {@link CompensationHistory} for the available event types and payloads. */
  onEvent: OnEventType<EventType, unknown>
  /** Custom loading indicator rendered while this component's async data is fetching. Overrides the indicator configured on `GustoProvider` for this instance only. */
  LoaderComponent?: LoaderComponentType
}

/**
 * Standalone read-only view of an employee's compensation history across all of their jobs, listing every past, current, and upcoming pay rate with its effective date.
 *
 * @remarks
 * Each job renders as its own section with a table of that job's compensations,
 * newest effective date first. The compensation in effect today is badged
 * "Current" and any future-dated change is badged "Upcoming"; past rows are
 * unbadged. A job the employee has not started yet has no current row.
 *
 * The view performs no mutations — it emits a close event rather than owning
 * navigation, so the consumer decides where "Back" leads. {@link Compensation}
 * wires this up alongside the card and the form surfaces as a single drop-in.
 *
 * Requires the `compensationHistory` unstable feature flag; mounting without it renders an error.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `employee/management/compensation/history/closed` | Fired when the "Back" CTA is clicked | `{ employeeId: string }` |
 *
 * @param props - See {@link CompensationHistoryProps}.
 * @returns The rendered compensation history view.
 * @alpha
 * @group Block components
 */
export function CompensationHistory({ LoaderComponent, ...props }: CompensationHistoryProps) {
  return (
    <BaseBoundaries
      componentName="Employee.Management.CompensationHistory"
      LoaderComponent={LoaderComponent}
    >
      <CompensationHistoryContent LoaderComponent={LoaderComponent} {...props} />
    </BaseBoundaries>
  )
}

function CompensationHistoryContent({
  employeeId,
  onEvent,
  LoaderComponent,
}: CompensationHistoryProps) {
  useUnstableFeature('compensationHistory', { throwIfDisabled: true })
  useI18n('Employee.Management.Compensation')

  const history = useCompensationHistory({ employeeId })

  const handleBack = () => {
    onEvent(componentEvents.EMPLOYEE_MANAGEMENT_COMPENSATION_HISTORY_CLOSED, { employeeId })
  }

  return (
    <BaseLayout error={history.errorHandling.errors} LoaderComponent={LoaderComponent}>
      <CompensationHistoryPresentation
        jobs={history.isLoading ? [] : history.data.jobs}
        isLoading={history.isLoading}
        onBack={handleBack}
      />
    </BaseLayout>
  )
}
