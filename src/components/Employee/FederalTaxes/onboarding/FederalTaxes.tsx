import { useTranslation } from 'react-i18next'
import { FederalTaxesView } from '../shared/FederalTaxesView'
import {
  useFederalTaxesForm,
  type UseFederalTaxesFormProps,
  type FederalTaxesFormData,
} from '../shared/useFederalTaxesForm'
import { useOnboardingFederalTaxesViewDictionary } from './useViewDictionary'
import { BaseBoundaries, BaseLayout, type BaseComponentInterface } from '@/components/Base'
import { ActionsLayout } from '@/components/Common'
import { useI18n, useComponentDictionary } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

/**
 * Props for {@link FederalTaxes}.
 *
 * @public
 */
export interface FederalTaxesProps extends BaseComponentInterface<'Employee.FederalTaxes'> {
  /** The associated employee identifier. */
  employeeId: string
  /** Pre-fill form values. Server data takes precedence when the employee already has values on file. */
  defaultValues?: Partial<FederalTaxesFormData>
  /** Callback invoked when the block emits an event. See the events table on {@link FederalTaxes} for the available event types and payloads. */
  onEvent: BaseComponentInterface['onEvent']
}

/**
 * Onboarding step for collecting an employee's federal tax (W-4) withholdings — filing status, multiple-jobs flag, dependents, other income, deductions, and extra withholding.
 *
 * @remarks
 * The federal tax record is created automatically with the employee, so this step is always in update mode. Only the revised 2020 W-4 format is supported. All fields are required by the bundled form, mirroring the IRS-form UX.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `employee/federalTaxes/updated` | Fired after the form is saved | The updated `EmployeeFederalTax` entity |
 * | `employee/federalTaxes/done` | Fired after a successful save so the parent flow can advance | — |
 *
 * @param props - See {@link FederalTaxesProps}.
 * @returns The federal taxes onboarding step.
 * @public
 * @group Block components
 */
export function FederalTaxes({ FallbackComponent, ...props }: FederalTaxesProps) {
  return (
    <BaseBoundaries componentName="Employee.FederalTaxes" FallbackComponent={FallbackComponent}>
      <FederalTaxesRoot {...props} />
    </BaseBoundaries>
  )
}

function FederalTaxesRoot({
  employeeId,
  className,
  children,
  dictionary,
  defaultValues,
  onEvent,
}: FederalTaxesProps) {
  useI18n('Employee.FederalTaxes')
  useComponentDictionary('Employee.FederalTaxes', dictionary)
  const viewDictionary = useOnboardingFederalTaxesViewDictionary()

  const federalTaxes = useFederalTaxesForm({
    employeeId,
    defaultValues,
    optionalFieldsToRequire: {
      update: ['twoJobs', 'dependentsAmount', 'otherIncome', 'deductions', 'extraWithholding'],
    },
  } satisfies UseFederalTaxesFormProps)

  if (federalTaxes.isLoading) {
    return <BaseLayout isLoading error={federalTaxes.errorHandling.errors} />
  }

  const handleSubmit = async () => {
    const result = await federalTaxes.actions.onSubmit()
    if (!result) return

    onEvent(componentEvents.EMPLOYEE_FEDERAL_TAXES_UPDATED, result.data)
    onEvent(componentEvents.EMPLOYEE_FEDERAL_TAXES_DONE)
  }

  return (
    <FederalTaxesView
      federalTaxes={federalTaxes}
      onSubmit={handleSubmit}
      actions={<ContinueAction isPending={federalTaxes.status.isPending} />}
      className={className}
      dictionary={viewDictionary}
    >
      {children}
    </FederalTaxesView>
  )
}

function ContinueAction({ isPending }: { isPending: boolean }) {
  const { t } = useTranslation('Employee.FederalTaxes')
  const Components = useComponentContext()

  return (
    <ActionsLayout>
      <Components.Button type="submit" isLoading={isPending}>
        {t('submitCta')}
      </Components.Button>
    </ActionsLayout>
  )
}
