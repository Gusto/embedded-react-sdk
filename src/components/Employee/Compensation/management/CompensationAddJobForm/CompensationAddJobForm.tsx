import { useTranslation } from 'react-i18next'
import { EditCompensation } from '../../onboarding/EditCompensation/EditCompensation'
import { useManagementCompensationDictionary } from '../useManagementCompensationDictionary'
import { BaseBoundaries, type CommonComponentInterface } from '@/components/Base'
import type { OnEventType } from '@/components/Base/useBase'
import { useComponentDictionary, useI18n } from '@/i18n'
import { componentEvents, type EventType } from '@/shared/constants'

export interface CompensationAddJobFormProps extends CommonComponentInterface<'Employee.Management.Compensation'> {
  employeeId: string
  /** Fires `EMPLOYEE_MANAGEMENT_COMPENSATION_ADD_JOB_FORM_SUBMITTED` (with the saved
   *  `Compensation`) on a successful save, and
   *  `EMPLOYEE_MANAGEMENT_COMPENSATION_ADD_JOB_FORM_CANCELLED` when the user cancels. */
  onEvent: OnEventType<EventType, unknown>
}

/**
 * Adds the employee's first job + compensation from the management surface.
 * Wraps the onboarding `EditCompensation` and supplies management-isolated
 * title/CTA copy plus a dictionary resolved from `Employee.Management.Compensation`,
 * passed through `EditCompensation`'s `dictionary` prop so the rendered fields
 * show management copy and stay isolated from the onboarding surface. Translates
 * the onboarding flow's save/cancel events into the management block's scoped
 * events so the partner-visible surface is the management block's, not onboarding's.
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
