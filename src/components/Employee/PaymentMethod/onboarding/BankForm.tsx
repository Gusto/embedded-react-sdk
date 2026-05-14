import { FormProvider } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useBankForm, type UseBankFormParams } from '../shared/useBankForm'
import { BankAccountFormFields } from '../shared/BankAccountFormFields'
import { ActionsLayout } from '@/components/Common'
import { Form } from '@/components/Common/Form'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { componentEvents } from '@/shared/constants'

export function BankForm({ employeeId, onEvent }: UseBankFormParams) {
  const { formMethods, isPending, handleBankAccountSubmit, resetToDefaults } = useBankForm({
    employeeId,
    onEvent,
  })
  const { handleSubmit } = formMethods
  const { t } = useTranslation('Employee.PaymentMethod')
  const Components = useComponentContext()

  const handleCancel = () => {
    resetToDefaults()
    onEvent(componentEvents.CANCEL)
  }

  return (
    <FormProvider {...formMethods}>
      <Form onSubmit={handleSubmit(handleBankAccountSubmit)}>
        <BankAccountFormFields />
        <ActionsLayout>
          <Components.Button variant="secondary" type="button" onClick={handleCancel}>
            {t('cancelAddCta')}
          </Components.Button>
          <Components.Button type="submit" isLoading={isPending}>
            {t('saveCta')}
          </Components.Button>
        </ActionsLayout>
      </Form>
    </FormProvider>
  )
}
