import { useTranslation } from 'react-i18next'
import { useDismissal, type UseDismissalReady } from './useDismissal/useDismissal'
import { DismissalPresentation, type DismissalFormData } from './DismissalPresentation'
import { BaseBoundaries, BaseLayout, type BaseComponentInterface } from '@/components/Base/Base'
import type { OnEventType } from '@/components/Base/useBase'
import type { LoaderComponentType } from '@/components/Base'
import { useI18n, useComponentDictionary } from '@/i18n'
import { componentEvents, type EventType } from '@/shared/constants'
import { formatDateToStringDate } from '@/helpers/dateFormatting'

/**
 * Props for {@link Dismissal}.
 *
 * @public
 */
export interface DismissalProps extends BaseComponentInterface<'Contractor.Dismissal'> {
  /** The contractor identifier to dismiss. */
  contractorId: string
}

/**
 * Standalone form for scheduling a contractor's dismissal.
 *
 * @remarks
 * Fetches the contractor, renders a single "Dismissal date" field bounded to
 * the day after their start date, and schedules the dismissal on submit.
 * Does not remove or hide the contractor itself — the dismissal can be
 * cancelled up until the date takes effect.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `contractor/dismissal/scheduled` | Fired after the dismissal is successfully scheduled | `{ contractorId: string, endDate: string, message: string }` |
 * | `CANCEL` | Fired when the user clicks Cancel | — |
 *
 * @param props - See {@link DismissalProps}.
 * @returns The dismissal form.
 * @public
 * @group Block components
 *
 * @example
 * ```tsx
 * import { ContractorManagement } from '@gusto/embedded-react-sdk'
 *
 * function MyComponent() {
 *   return (
 *     <ContractorManagement.Dismissal
 *       contractorId="4b3f930f-82cd-48a8-b797-798686e12e5e"
 *       onEvent={() => {}}
 *     />
 *   )
 * }
 * ```
 */
export function Dismissal({ FallbackComponent, LoaderComponent, ...props }: DismissalProps) {
  return (
    <BaseBoundaries
      componentName="Contractor.Dismissal"
      FallbackComponent={FallbackComponent}
      LoaderComponent={LoaderComponent}
    >
      <DismissalContent LoaderComponent={LoaderComponent} {...props} />
    </BaseBoundaries>
  )
}

interface DismissalContentProps {
  contractorId: string
  onEvent: OnEventType<EventType, unknown>
  dictionary?: DismissalProps['dictionary']
  className?: string
  LoaderComponent?: LoaderComponentType
}

function DismissalContent({
  contractorId,
  onEvent,
  dictionary,
  className,
  LoaderComponent,
}: DismissalContentProps) {
  useComponentDictionary('Contractor.Dismissal', dictionary)
  useI18n('Contractor.Dismissal')

  const dismissal = useDismissal({ contractorId })

  if (dismissal.isLoading) {
    return (
      <BaseLayout
        isLoading
        error={dismissal.errorHandling.errors}
        LoaderComponent={LoaderComponent}
      />
    )
  }

  return (
    <DismissalReady
      contractorId={contractorId}
      onEvent={onEvent}
      className={className}
      LoaderComponent={LoaderComponent}
      dismissal={dismissal}
    />
  )
}

interface DismissalReadyProps {
  contractorId: string
  onEvent: OnEventType<EventType, unknown>
  className?: string
  LoaderComponent?: LoaderComponentType
  dismissal: UseDismissalReady
}

function DismissalReady({
  contractorId,
  onEvent,
  className,
  LoaderComponent,
  dismissal,
}: DismissalReadyProps) {
  const { t } = useTranslation('Contractor.Dismissal')

  const handleCancel = () => {
    onEvent(componentEvents.CANCEL)
  }

  const handleSubmit = async ({ endDate }: DismissalFormData) => {
    const result = await dismissal.actions.dismiss(endDate)
    if (!result) return

    onEvent(componentEvents.CONTRACTOR_DISMISSAL_SCHEDULED, {
      contractorId,
      endDate: formatDateToStringDate(endDate),
      message: t('successMessage'),
    })
  }

  return (
    <BaseLayout error={dismissal.errorHandling.errors} LoaderComponent={LoaderComponent}>
      <DismissalPresentation
        contractor={dismissal.data.contractor}
        isPending={dismissal.status.isPending}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        className={className}
      />
    </BaseLayout>
  )
}
