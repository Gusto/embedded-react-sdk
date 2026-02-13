import { useTranslation } from 'react-i18next'
import { FormProvider } from 'react-hook-form'
import { useContractorPaymentMethod } from './useContractorPaymentMethod'
import type { PaymentMethodProps } from './types'
import { BankAccountForm } from './BankAccountForm'
import { PaymentTypeForm } from './PaymentTypeForm'
import { useI18n } from '@/i18n'
import { BaseComponent } from '@/components/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Form } from '@/components/Common/Form'
import { useComponentDictionary } from '@/i18n/I18n'
import { ActionsLayout } from '@/components/Common/ActionsLayout'
import { Flex } from '@/components/Common'

export function PaymentMethod(props: PaymentMethodProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

function Root({ contractorId, className, dictionary }: PaymentMethodProps) {
  useComponentDictionary('Contractor.PaymentMethod', dictionary)
  useI18n('Contractor.PaymentMethod')
  const { t } = useTranslation('Contractor.PaymentMethod')
  const Components = useComponentContext()

  const {
    data: { bankAccount, showBankAccountForm },
    actions: { onSubmit },
    meta: { isPending },
    form: { formMethods },
  } = useContractorPaymentMethod({ contractorId })

  return (
    <section className={className}>
      <FormProvider {...formMethods}>
        <Form onSubmit={formMethods.handleSubmit(onSubmit)}>
          <Flex gap={32} flexDirection={'column'}>
            <Components.Heading as="h2">{t('title')}</Components.Heading>
            <PaymentTypeForm />
            <hr />
            {showBankAccountForm && <BankAccountForm bankAccount={bankAccount} />}
            <ActionsLayout>
              <Components.Button type="submit" variant="primary" isDisabled={isPending}>
                {t('continueCta')}
              </Components.Button>
            </ActionsLayout>
          </Flex>
        </Form>
      </FormProvider>
    </section>
  )
}
