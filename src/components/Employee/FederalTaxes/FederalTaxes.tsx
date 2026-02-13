import { FormProvider } from 'react-hook-form'
import { useEmployeeFederalTaxes } from './useEmployeeFederalTaxes'
import { FederalForm } from './FederalForm'
import { Head } from './Head'
import { Actions } from './Actions'
import { FederalTaxesProvider } from './useFederalTaxes'
import {
  BaseComponent,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import { useI18n } from '@/i18n'
import { Form } from '@/components/Common/Form'
import { useComponentDictionary } from '@/i18n/I18n'

interface FederalTaxesProps extends CommonComponentInterface<'Employee.FederalTaxes'> {
  employeeId: string
}

export function FederalTaxes(props: FederalTaxesProps & BaseComponentInterface) {
  return (
    <BaseComponent<'Employee.FederalTaxes'> {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

const Root = (props: FederalTaxesProps) => {
  const { employeeId, className, children, dictionary } = props
  useI18n('Employee.FederalTaxes')
  useComponentDictionary('Employee.FederalTaxes', dictionary)

  const { actions, meta, form } = useEmployeeFederalTaxes({ employeeId })

  return (
    <section className={className}>
      <FederalTaxesProvider
        value={{
          isPending: meta.isPending,
        }}
      >
        <FormProvider {...form}>
          <Form onSubmit={actions.onSubmit}>
            {children ? (
              children
            ) : (
              <>
                <Head />
                <FederalForm />
                <Actions />
              </>
            )}
          </Form>
        </FormProvider>
      </FederalTaxesProvider>
    </section>
  )
}
