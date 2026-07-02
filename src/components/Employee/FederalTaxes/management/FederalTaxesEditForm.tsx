import { useTranslation } from 'react-i18next'
import { FederalTaxesView } from '../shared/FederalTaxesView'
import {
  useFederalTaxesForm,
  type UseFederalTaxesFormProps,
  type FederalTaxesFormData,
} from '../shared/useFederalTaxesForm'
import { useManagementFederalTaxesViewDictionary } from './useViewDictionary'
import { BaseBoundaries, BaseLayout, type BaseComponentInterface } from '@/components/Base'
import { ActionsLayout } from '@/components/Common'
import { useI18n, useComponentDictionary } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

/**
 * Props for {@link FederalTaxesEditForm}.
 *
 * @public
 */
export interface FederalTaxesEditFormProps extends BaseComponentInterface<'Employee.Management.FederalTaxes'> {
  /** The associated employee identifier. */
  employeeId: string
  /** Pre-fill form values. Server data takes precedence when the employee already has values on file. */
  defaultValues?: Partial<FederalTaxesFormData>
}

/**
 * Standalone form for editing an employee's federal tax (W-4) withholdings — filing status, multiple-jobs flag, dependents, other income, deductions, and extra withholding.
 *
 * @remarks
 * Pair with {@link FederalTaxesCard} to route its `employee/management/federalTaxes/card/editRequested` event to this form. {@link FederalTaxes} bundles the card, this form, and the swap wiring as a single drop-in; reach for this form directly only when that orchestration is the wrong fit (for example, when the form needs to render in a modal or drawer, or when the swap is driven by a router).
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `employee/management/federalTaxes/editForm/submitted` | Fired after the form is saved; use it to return to the card | The updated `EmployeeFederalTax` entity |
 * | `employee/management/federalTaxes/editForm/cancelled` | Fired when the user clicks Cancel; use it to return to the card | — |
 *
 * @param props - See {@link FederalTaxesEditFormProps}.
 * @returns The rendered federal taxes edit form.
 * @public
 * @group Block components
 */
export function FederalTaxesEditForm({ FallbackComponent, ...props }: FederalTaxesEditFormProps) {
  return (
    <BaseBoundaries
      componentName="Employee.Management.FederalTaxes"
      FallbackComponent={FallbackComponent}
    >
      <FederalTaxesEditFormRoot {...props} />
    </BaseBoundaries>
  )
}

function FederalTaxesEditFormRoot({
  employeeId,
  className,
  children,
  dictionary,
  defaultValues,
  onEvent,
}: FederalTaxesEditFormProps) {
  useI18n('Employee.Management.FederalTaxes')
  useComponentDictionary('Employee.Management.FederalTaxes', dictionary)
  const { t } = useTranslation('Employee.Management.FederalTaxes')
  const Components = useComponentContext()
  const viewDictionary = useManagementFederalTaxesViewDictionary()

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

    onEvent(componentEvents.EMPLOYEE_MANAGEMENT_FEDERAL_TAXES_EDIT_FORM_SUBMITTED, result.data)
  }

  const handleCancel = () => {
    onEvent(componentEvents.EMPLOYEE_MANAGEMENT_FEDERAL_TAXES_EDIT_FORM_CANCELLED)
  }

  return (
    <FederalTaxesView
      federalTaxes={federalTaxes}
      onSubmit={handleSubmit}
      actions={
        <ActionsLayout>
          <Components.Button variant="secondary" onClick={handleCancel}>
            {t('cancelCta')}
          </Components.Button>
          <Components.Button type="submit" isLoading={federalTaxes.status.isPending}>
            {t('saveCta')}
          </Components.Button>
        </ActionsLayout>
      }
      className={className}
      dictionary={viewDictionary}
    >
      {children}
    </FederalTaxesView>
  )
}
