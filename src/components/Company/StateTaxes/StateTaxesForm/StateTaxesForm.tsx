import { Form as AriaForm } from 'react-aria-components'
import { useTaxRequirementsUpdateStateMutation } from '@gusto/embedded-api/react-query/taxRequirementsUpdateState'
import { FormProvider, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { Head } from './Head'
import { StateTaxesFormProvider } from './context'
import { Form, StateFormSchema, type StateFormInputs } from './Form'
import type { BaseComponentInterface, CommonComponentInterface } from '@/components/Base/Base'
import { BaseComponent, useBase } from '@/components/Base/Base'
import { useI18n } from '@/i18n/I18n'
import { Flex } from '@/components/Common/Flex/Flex'
import { componentEvents } from '@/shared/constants'

interface StateTaxesFormProps extends CommonComponentInterface {
  companyId: string
  state: string
}

export function StateTaxesForm(props: StateTaxesFormProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

function Root({ companyId, state, className, children }: StateTaxesFormProps) {
  useI18n('Company.StateTaxes')
  const { onEvent, baseSubmitHandler } = useBase()

  const { mutateAsync: updateStateTax, isPending: isPendingUpdate } =
    useTaxRequirementsUpdateStateMutation()

  const { control, ...methods } = useForm<StateFormInputs>({
    resolver: valibotResolver(StateFormSchema),
    defaultValues: {},
  })

  const onSubmit = async (data: StateFormInputs) => {
    await baseSubmitHandler(data, async payload => {
      await updateStateTax({
        request: { companyUuid: companyId, requestBody: { requirementSets: [{}] }, state },
      })
      onEvent(componentEvents.COMPANY_STATE_TAX_UPDATED)
    })
  }

  return (
    <section className={className}>
      <FormProvider {...methods} control={control}>
        <AriaForm onSubmit={methods.handleSubmit(onSubmit)}>
          <StateTaxesFormProvider value={{ isPending: isPendingUpdate, state }}>
            <Flex flexDirection="column" gap={32}>
              {children ? (
                children
              ) : (
                <>
                  <Head />
                  <Form />
                </>
              )}
            </Flex>
          </StateTaxesFormProvider>
        </AriaForm>
      </FormProvider>
    </section>
  )
}

StateTaxesForm.Head = Head
StateTaxesForm.Form = Form
// StateTaxesForm.Actions = Actions
