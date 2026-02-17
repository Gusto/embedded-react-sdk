import { FormProvider } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { OnboardingContextInterface } from '../OnboardingFlow/OnboardingFlowComponents'
import { Actions } from './Actions'
import { FederalForm } from './FederalForm'
import { FederalHead } from './FederalHead'
import { StateForm } from './StateForm'
import { TaxesProvider } from './useTaxes'
import { useEmployeeTaxes } from './useEmployeeTaxes'
import {
  BaseComponent,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import { useFlow } from '@/components/Flow/useFlow'
import { useI18n } from '@/i18n'
import { Form } from '@/components/Common/Form'
import { useComponentDictionary } from '@/i18n/I18n'

interface TaxesProps extends CommonComponentInterface<'Employee.Taxes'> {
  employeeId: string
  isAdmin?: boolean
}

/**
 * @deprecated The Taxes component has been deprecated and will be removed in a future release.
 * The component has been split into separate components for state and federal. Use Employee.FederalTaxes
 * and Employee.StateTaxes components instead.
 */
export function Taxes(props: TaxesProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const Root = (props: TaxesProps) => {
  const { employeeId, className, children, isAdmin = false, dictionary } = props
  useI18n('Employee.Taxes')
  useComponentDictionary('Employee.Taxes', dictionary)

  const {
    data: { employeeStateTaxes },
    actions: { onSubmit },
    meta: { isPending },
    form: { formMethods },
  } = useEmployeeTaxes({ employeeId, isAdmin })

  return (
    <section className={className}>
      <TaxesProvider
        value={{
          employeeStateTaxes,
          isAdmin,
          isPending,
        }}
      >
        <FormProvider {...formMethods}>
          <Form onSubmit={onSubmit}>
            {children ? (
              children
            ) : (
              <>
                <FederalHead />
                <FederalForm />
                <StateForm />
                <Actions />
              </>
            )}
          </Form>
        </FormProvider>
      </TaxesProvider>
    </section>
  )
}

export const TaxesContextual = () => {
  const { employeeId, onEvent, isAdmin } = useFlow<OnboardingContextInterface>()
  const { t } = useTranslation()
  if (!employeeId) {
    throw new Error(
      t('errors.missingParamsOrContext', {
        component: 'EmployeeTaxes',
        param: 'employeeId',
        provider: 'FlowProvider',
      }),
    )
  }
  return <Taxes employeeId={employeeId} onEvent={onEvent} isAdmin={isAdmin ?? false} />
}
