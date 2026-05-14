import { FormProvider } from 'react-hook-form'
import { useEffect } from 'react'
import { ErrorMessage } from '@hookform/error-message'
import { Trans, useTranslation } from 'react-i18next'
import {
  useSplitPaymentsForm,
  type UseSplitPaymentsFormParams,
} from '../shared/useSplitPaymentsForm'
import { SplitFieldsList } from '../shared/SplitViewFields'
import { useSplitViewState } from '../shared/useSplitViewState'
import { ActionsLayout } from '@/components/Common'
import { Form } from '@/components/Common/Form'
import { RadioGroupField } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { componentEvents, SPLIT_BY } from '@/shared/constants'

export function SplitView({ employeeId, onEvent }: UseSplitPaymentsFormParams) {
  const { bankAccounts, splits, formMethods, isPending, handleSplitSubmit, resetToDefaults } =
    useSplitPaymentsForm({ employeeId, onEvent })
  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = formMethods
  const { t } = useTranslation('Employee.PaymentMethod')
  const Components = useComponentContext()

  const { splitBy, remainderId, updateSplitAmount, handleReorder } = useSplitViewState({
    splits,
    formMethods,
  })

  useEffect(() => {
    setValue('isSplit', true)
  }, [setValue])

  const handleCancel = () => {
    resetToDefaults()
    onEvent(componentEvents.CANCEL)
  }

  if (bankAccounts.length < 2) return null

  return (
    <FormProvider {...formMethods}>
      <Form onSubmit={handleSubmit(handleSplitSubmit)}>
        <ErrorMessage
          errors={errors}
          name="splitAmount.root"
          render={({ message }) => {
            if (message.startsWith('percentage_split_total_error:')) {
              const total = message.split(':')[1] || '0'
              return (
                <Components.Alert
                  status="error"
                  label={t('validations.percentageErrorWithTotal', { total })}
                />
              )
            }
            return <Components.Alert status="error" label={t('validations.percentageError')} />
          }}
        />
        <Components.Heading as="h2">{t('title')}</Components.Heading>
        <Trans t={t} i18nKey="splitDescription" components={{ p: <Components.Text /> }} />
        <RadioGroupField
          name="splitBy"
          label={t('splitByLabel')}
          options={[
            { value: SPLIT_BY.percentage, label: t('percentageLabel') },
            { value: SPLIT_BY.amount, label: t('amountLabel') },
          ]}
        />
        <SplitFieldsList
          splits={splits}
          splitBy={splitBy}
          remainderId={remainderId}
          onUpdateAmount={updateSplitAmount}
          onReorder={handleReorder}
        />
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
