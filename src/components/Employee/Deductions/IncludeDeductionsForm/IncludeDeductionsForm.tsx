import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { FormProvider, useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  BaseComponent,
  type BaseComponentInterface,
  type CommonComponentInterface,
  useBase,
} from '@/components/Base'
import { Form } from '@/components/Common/Form'
import { RadioGroupField } from '@/components/Common'
import { ActionsLayout } from '@/components/Common'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useComponentDictionary } from '@/i18n/I18n'

const IncludeDeductionsSchema = z.object({ includeDeductions: z.enum(['Yes', 'No']) })
export type IncludeDeductionsPayload = z.output<typeof IncludeDeductionsSchema>

interface IncludeDeductionsFormProps extends CommonComponentInterface<'Employee.Deductions'> {
  employeeId: string
}

export function IncludeDeductionsForm(props: IncludeDeductionsFormProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

function Root({ className, children, dictionary }: IncludeDeductionsFormProps) {
  const { onEvent } = useBase()
  const { t } = useTranslation('Employee.Deductions')
  const Components = useComponentContext()

  useComponentDictionary('Employee.Deductions', dictionary)
  useI18n('Employee.Deductions')

  const formMethods = useForm<IncludeDeductionsPayload>({
    resolver: zodResolver(IncludeDeductionsSchema),
    defaultValues: { includeDeductions: 'No' },
  })

  const onSubmit: SubmitHandler<IncludeDeductionsPayload> = data => {
    if (data.includeDeductions === 'Yes') {
      onEvent(componentEvents.EMPLOYEE_DEDUCTION_INCLUDE_YES)
    } else {
      onEvent(componentEvents.EMPLOYEE_DEDUCTION_INCLUDE_NO)
    }
  }

  return (
    <section className={className}>
      <FormProvider {...formMethods}>
        <Form onSubmit={formMethods.handleSubmit(onSubmit)}>
          {children ? (
            children
          ) : (
            <>
              <Components.Heading as="h2">{t('pageTitle')}</Components.Heading>
              <RadioGroupField
                name="includeDeductions"
                isRequired
                label={t('includeDeductionsFormLabel')}
                description={t('includeDeductionsDescription')}
                options={[
                  { value: 'Yes', label: t('includeDeductionsYes') },
                  { value: 'No', label: t('includeDeductionsNo') },
                ]}
              />
              <ActionsLayout>
                <Components.Button type="submit">{t('continueCta')}</Components.Button>
              </ActionsLayout>
            </>
          )}
        </Form>
      </FormProvider>
    </section>
  )
}
