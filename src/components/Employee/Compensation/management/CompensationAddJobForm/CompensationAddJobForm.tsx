import { useTranslation } from 'react-i18next'
import { EditCompensation } from '../../onboarding/EditCompensation/EditCompensation'
import { useManagementCompensationDictionary } from '../useManagementCompensationDictionary'
import { BaseBoundaries, type CommonComponentInterface } from '@/components/Base'
import type { OnEventType } from '@/components/Base/useBase'
import { useComponentDictionary, useI18n } from '@/i18n'
import { componentEvents, type EventType } from '@/shared/constants'

/**
 * Props for {@link CompensationAddJobForm}.
 *
 * @public
 */
export interface CompensationAddJobFormProps extends CommonComponentInterface<'Employee.Management.Compensation'> {
  /** The associated employee identifier. */
  employeeId: string
  /** Callback invoked when the form emits an event. See the events table on {@link CompensationAddJobForm} for the available event types and payloads. */
  onEvent: OnEventType<EventType, unknown>
}

/**
 * Standalone form for adding an employee's first job and compensation from the management surface.
 *
 * @remarks
 * Routed from {@link CompensationCard}'s `employee/management/compensation/card/addRequested` event. Emits its own scoped `submitted` and `cancelled` events — both are your cue to return to the card. {@link Compensation} bundles the card, this form, and the swap and alert wiring as a single drop-in; reach for this form directly only when that orchestration is the wrong fit.
 *
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `employee/management/compensation/addJobForm/submitted` | Fired after the job and compensation are saved; use it to return to the card | Saved `Compensation` entity |
 * | `employee/management/compensation/addJobForm/cancelled` | Fired when the user clicks Cancel; use it to return to the card | — |
 *
 * @param props - See {@link CompensationAddJobFormProps}.
 * @returns The rendered add-job form.
 * @public
 * @group Block Components
 */
export function CompensationAddJobForm({ dictionary, ...props }: CompensationAddJobFormProps) {
  useComponentDictionary('Employee.Management.Compensation', dictionary)
  return (
    <BaseBoundaries componentName="Employee.Management.Compensation">
      <Root {...props} />
    </BaseBoundaries>
  )
}

function Root({ employeeId, onEvent }: Omit<CompensationAddJobFormProps, 'dictionary'>) {
  useI18n('Employee.Management.Compensation')
  const { t } = useTranslation('Employee.Management.Compensation')
  const editCompensationDictionary = useManagementCompensationDictionary()

  return (
    <EditCompensation
      employeeId={employeeId}
      title={t('addJobTitle')}
      submitCtaLabel={t('saveNewJobCta')}
      dictionary={editCompensationDictionary}
      onEvent={(type, data) => {
        // The onboarding EditCompensation fires its own job/compensation events;
        // the management block exposes a single scoped "submitted" event keyed off
        // the compensation save (the terminal step of the create chain).
        if (type === componentEvents.EMPLOYEE_COMPENSATION_UPDATED) {
          onEvent(componentEvents.EMPLOYEE_MANAGEMENT_COMPENSATION_ADD_JOB_FORM_SUBMITTED, data)
        }
      }}
      onCancel={() => {
        onEvent(componentEvents.EMPLOYEE_MANAGEMENT_COMPENSATION_ADD_JOB_FORM_CANCELLED)
      }}
    />
  )
}
