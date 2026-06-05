import { useTranslation } from 'react-i18next'
import { EditCompensation } from '../../onboarding/EditCompensation/EditCompensation'
import { useManagementCompensationDictionary } from '../useManagementCompensationDictionary'
import { BaseBoundaries, type CommonComponentInterface } from '@/components/Base'
import type { OnEventType } from '@/components/Base/useBase'
import { useComponentDictionary, useI18n } from '@/i18n'
import { type EventType } from '@/shared/constants'

export interface CompensationAddJobFormProps extends CommonComponentInterface<'Employee.Management.Compensation'> {
  employeeId: string
  onCancel?: () => void
  /**
   * Receives `EMPLOYEE_JOB_CREATED` / `EMPLOYEE_JOB_UPDATED` (with the saved
   * `Job`), then `EMPLOYEE_COMPENSATION_UPDATED` (with the saved `Compensation`)
   * on a successful submit chain. Use `EMPLOYEE_COMPENSATION_UPDATED` for "save
   * complete" branching.
   */
  onEvent: OnEventType<EventType, unknown>
}

/**
 * Adds the employee's first job + compensation from the management surface.
 * Wraps the onboarding `EditCompensation` and supplies management-isolated
 * title/CTA copy plus a dictionary resolved from `Employee.Management.Compensation`,
 * passed through `EditCompensation`'s `dictionary` prop so the rendered fields
 * show management copy and stay isolated from the onboarding surface.
 */
export function CompensationAddJobForm({ dictionary, ...props }: CompensationAddJobFormProps) {
  useComponentDictionary('Employee.Management.Compensation', dictionary)
  return (
    <BaseBoundaries componentName="Employee.Management.Compensation">
      <Root {...props} />
    </BaseBoundaries>
  )
}

function Root({ employeeId, onCancel, onEvent }: Omit<CompensationAddJobFormProps, 'dictionary'>) {
  useI18n('Employee.Management.Compensation')
  const { t } = useTranslation('Employee.Management.Compensation')
  const editCompensationDictionary = useManagementCompensationDictionary()

  return (
    <EditCompensation
      employeeId={employeeId}
      title={t('addJobTitle')}
      submitCtaLabel={t('saveNewJobCta')}
      dictionary={editCompensationDictionary}
      onEvent={onEvent}
      onCancel={onCancel}
    />
  )
}
