import { useEffect, useMemo } from 'react'
import { FormProvider } from 'react-hook-form'
import { ErrorMessage } from '@hookform/error-message'
import { Trans, useTranslation } from 'react-i18next'
import type { EmployeePaymentMethod } from '@gusto/embedded-api/models/components/employeepaymentmethod'
import DOMPurify from 'dompurify'
import { usePaymentMethod, type UsePaymentMethodParams } from './usePaymentMethod'
import { ActionsLayout } from '@/components/Common'
import { Form } from '@/components/Common/Form'
import { NumberInputField, RadioGroupField } from '@/components/Common'
import { ReorderableList } from '@/components/Common/ReorderableList'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { componentEvents, SPLIT_BY } from '@/shared/constants'

type Split = NonNullable<EmployeePaymentMethod['splits']>[number]

function AmountField({
  split,
  remainderId,
  onChange,
}: {
  split: Split
  remainderId: string
  onChange: (value: number | null) => void
}) {
  const { t } = useTranslation('Employee.PaymentMethod')
  return (
    <NumberInputField
      name={`splitAmount.${split.uuid}`}
      label={t('splitAmountLabel', {
        name: DOMPurify.sanitize(split.name ?? ''),
        account_number: DOMPurify.sanitize(split.hiddenAccountNumber ?? ''),
        interpolation: { escapeValue: false },
      })}
      format="currency"
      min={0}
      isRequired
      errorMessage={t('validations.amountError')}
      placeholder={remainderId === split.uuid ? t('remainderLabel') : ''}
      isDisabled={remainderId === split.uuid}
      onChange={onChange}
    />
  )
}

function PercentageField({
  split,
  onChange,
}: {
  split: Split
  onChange: (value: number) => void
}) {
  const { t } = useTranslation('Employee.PaymentMethod')
  return (
    <NumberInputField
      name={`splitAmount.${split.uuid}`}
      label={t('splitAmountLabel', {
        name: DOMPurify.sanitize(split.name ?? ''),
        account_number: DOMPurify.sanitize(split.hiddenAccountNumber ?? ''),
        interpolation: { escapeValue: false },
      })}
      format="percent"
      min={0}
      maximumFractionDigits={0}
      isRequired
      errorMessage={t('validations.percentageAmountError')}
      onChange={onChange}
    />
  )
}

export function SplitView({ employeeId, isAdmin, onEvent }: UsePaymentMethodParams) {
  const { formMethods, paymentMethod, bankAccounts, isPending, handleSplitSubmit, resetToDefaults } =
    usePaymentMethod({ employeeId, isAdmin, onEvent })
  const {
    handleSubmit,
    setValue,
    resetField,
    watch,
    formState: { errors },
  } = formMethods
  const { t } = useTranslation('Employee.PaymentMethod')
  const Components = useComponentContext()
  const splitBy = watch('splitBy')
  const priorities = watch('priority')

  const splits = useMemo(() => paymentMethod.splits ?? [], [paymentMethod.splits])

  const remainderId = Object.entries(priorities).reduce(
    (maxId, [uuid, priority]) => (!maxId || (priorities[maxId] ?? 0) < priority ? uuid : maxId),
    '',
  )

  useEffect(() => {
    if (!splits.length) return
    if (splitBy === SPLIT_BY.amount) {
      const newValues = splits.reduce<Record<string, number | null>>((acc, curr) => {
        acc[curr.uuid] = curr.uuid === remainderId ? null : 0
        return acc
      }, {})
      setValue('splitAmount', newValues)
    } else {
      const newValues = splits.reduce<Record<string, number>>((acc, curr, index) => {
        acc[curr.uuid] = index === 0 ? 100 : 0
        return acc
      }, {})
      setValue('splitAmount', newValues)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [splitBy])

  const updateSplitAmount = (uuid: string, value: number | null) => {
    setValue(`splitAmount.${uuid}`, value)
  }

  const handleReorder = (newOrder: number[]) => {
    const newPriorities = newOrder.reduce(
      (acc: Record<string, number>, curr: number, currIndex: number) => {
        const split = splits[curr]
        return split ? { ...acc, [split.uuid]: currIndex + 1 } : acc
      },
      {},
    )
    const lastSplitIndex = newOrder[newOrder.length - 1]
    if (lastSplitIndex === undefined) return
    const lastSplit = splits[lastSplitIndex]
    if (!lastSplit) return
    setValue('priority', newPriorities)
    if (remainderId && remainderId !== lastSplit.uuid) {
      resetField(`splitAmount.${remainderId}`)
      updateSplitAmount(remainderId, 0)
    }
    updateSplitAmount(lastSplit.uuid, null)
  }

  const handleCancel = () => {
    resetToDefaults()
    onEvent(componentEvents.CANCEL)
  }

  setValue('isSplit', true)

  if (bankAccounts.length < 2 || paymentMethod.splits === null) return null

  const renderFieldsList = () => {
    if (splitBy === SPLIT_BY.amount) {
      return (
        <ReorderableList
          key={`reorderable-amount-list-${splitBy}`}
          label={t('draggableListLabel')}
          items={splits.map(split => ({
            label: split.name as string,
            content: (
              <AmountField
                key={`amount-${split.uuid}`}
                split={split}
                onChange={value => {
                  updateSplitAmount(split.uuid, value)
                }}
                remainderId={remainderId}
              />
            ),
          }))}
          onReorder={handleReorder}
        />
      )
    }
    return splits.map(split => (
      <PercentageField
        key={`percentage-${split.uuid}`}
        split={split}
        onChange={value => {
          updateSplitAmount(split.uuid, value)
        }}
      />
    ))
  }

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
        {paymentMethod.splits && renderFieldsList()}
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
