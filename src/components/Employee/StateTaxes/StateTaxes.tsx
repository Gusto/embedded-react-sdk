import { FormProvider } from 'react-hook-form'
import { useEmployeeStateTaxes } from './useEmployeeStateTaxes'
import { StateForm } from './StateForm'
import { Actions } from './Actions'
import { StateTaxesProvider } from './useStateTaxes'
import {
  BaseComponent,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import { useI18n } from '@/i18n'
import { Form } from '@/components/Common/Form'
import { useComponentDictionary } from '@/i18n/I18n'

interface StateTaxesProps extends CommonComponentInterface<'Employee.StateTaxes'> {
  employeeId: string
  isAdmin?: boolean
}

export function StateTaxes(props: StateTaxesProps & BaseComponentInterface) {
  return (
    <BaseComponent<'Employee.StateTaxes'> {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

const Root = (props: StateTaxesProps) => {
  const { employeeId, className, children, isAdmin = false, dictionary } = props
  useI18n('Employee.StateTaxes')
  useComponentDictionary('Employee.StateTaxes', dictionary)

  const { data, actions, meta, form } = useEmployeeStateTaxes({ employeeId, isAdmin })

  return (
    <section className={className}>
      <StateTaxesProvider
        value={{
          employeeStateTaxes: data.employeeStateTaxes,
          isAdmin: meta.isAdmin,
          isPending: meta.isPending,
        }}
      >
        <FormProvider {...form}>
          <Form onSubmit={actions.onSubmit}>
            {children ? (
              children
            ) : (
              <>
                <StateForm />
                <Actions />
              </>
            )}
          </Form>
        </FormProvider>
      </StateTaxesProvider>
    </section>
  )
}
