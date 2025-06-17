import type { Control } from 'react-hook-form'
import { useFormContext } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { type EmployeePaymentMethod } from '@gusto/embedded-api/models/components/employeepaymentmethod'
import { ErrorMessage } from '@hookform/error-message'
import { Fragment } from 'react/jsx-runtime'
import DOMPurify from 'dompurify'
import { useEffect, useMemo } from 'react'
import { usePaymentMethod, type CombinedSchemaInputs } from './usePaymentMethod'
import { NumberInputField, RadioGroupField } from '@/components/Common'
import { useLocale } from '@/contexts/LocaleProvider'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { ReorderableList } from '@/components/Common/ReorderableList'
import { SPLIT_BY } from '@/shared/constants'

type Split = NonNullable<EmployeePaymentMethod['splits']>[number]

export function Split() {
  const { paymentMethod, bankAccounts, mode } = usePaymentMethod()
  const {
    control,
    setValue,
    resetField,
    watch,
    formState: { errors },
  } = useFormContext<CombinedSchemaInputs>()
  const { t } = useTranslation('Employee.PaymentMethod')
  const splitBy = watch('splitBy')
  const priorities = watch('priority')

  const splits = useMemo(() => paymentMethod.splits ?? [], [paymentMethod.splits])

  const remainderId = Object.entries(priorities).reduce(
    (maxId, [uuid, priority]) => (!maxId || (priorities[maxId] ?? 0) < priority ? uuid : maxId),
    '',
  )

  const { currency } = useLocale()

  // Handle splitBy value changes
  useEffect(() => {
    // Only run cleanup if splits exist
    if (!splits.length) return

    // Clean up when switching modes
    if (splitBy === SPLIT_BY.amount) {
      // When switching to amount mode, set the last item as remainder (null) and others to 0
      const newAmountValues = splits.reduce<Record<string, number | null>>((acc, curr) => {
        acc[curr.uuid] = curr.uuid === remainderId ? null : 0
        return acc
      }, {})
      setValue('splitAmount', newAmountValues)
    } else {
      // When switching to percentage mode, set the first item to 100% and others to 0
      const newPercentageValues = splits.reduce<Record<string, number>>((acc, curr, index) => {
        acc[curr.uuid] = index === 0 ? 100 : 0
        return acc
      }, {})
      setValue('splitAmount', newPercentageValues)
    }
  }, [splitBy, splits, remainderId, setValue])

  const Components = useComponentContext()

  if (mode !== 'SPLIT' || bankAccounts.length < 2 || paymentMethod.splits === null) return null
  //Used by form schema to determine variant
  setValue('isSplit', true)

  const updateSplitAmount = (uuid: string, value: number | null) => {
    setValue(`splitAmount.${uuid}`, value)
  }

  const handleReorder = (newOrder: number[]) => {
    // Calculate new priorities based on new order
    const newPriorities = newOrder.reduce(
      (acc: Record<string, number>, curr: number, currIndex: number) => {
        const split = splits[curr]
        return split ? { ...acc, [split.uuid]: currIndex + 1 } : acc
      },
      {},
    )

    // Get the last split in the new order
    const lastSplitIndex = newOrder[newOrder.length - 1]
    if (lastSplitIndex === undefined) return

    const lastSplit = splits[lastSplitIndex]
    if (!lastSplit) return

    // Update priorities
    setValue('priority', newPriorities)

    // Clear the previous remainder if different from the new one
    if (remainderId && remainderId !== lastSplit.uuid) {
      resetField(`splitAmount.${remainderId}`)
      updateSplitAmount(remainderId, 0)
    }

    // Set the new last item to null (remainder)
    updateSplitAmount(lastSplit.uuid, null)
  }

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
        control={control}
        onChange={value => {
          updateSplitAmount(split.uuid, value)
        }}
        currency={currency}
      />
    ))
  }

  return (
    <>
      <ErrorMessage
        errors={errors}
        name="splitAmount.root"
        render={({ message }) => {
          // Handle enhanced error messages with current total
          if (message && message.startsWith('percentage_split_total_error:')) {
            const total = message.split(':')[1] || '0'
            return (
              <Components.Alert
                status="error"
                label={t('validations.percentageErrorWithTotal', { total })}
              />
            )
          }
          // Fallback to original error message
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
    </>
  )
}

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
  control,
  onChange,
  currency,
}: {
  split: Split
  control: Control<CombinedSchemaInputs>
  onChange: (value: number) => void
  currency: string
}) {
  const { t } = useTranslation('Employee.PaymentMethod')
  return (
    <Fragment key={split.uuid}>
      <NumberInputField
        name={`splitAmount.${split.uuid}`}
        label={t('splitAmountLabel', {
          name: DOMPurify.sanitize(split.name ?? ''),
          account_number: DOMPurify.sanitize(split.hiddenAccountNumber ?? ''),
          interpolation: { escapeValue: false },
        })}
        format="percent"
        min={0}
        isRequired
        errorMessage={t('validations.amountError')}
        onChange={onChange}
      />
    </Fragment>
  )
}
