import type { Control } from 'react-hook-form'
import { useFormContext } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { type EmployeePaymentMethod } from '@gusto/embedded-api/models/components/employeepaymentmethod'
import { ErrorMessage } from '@hookform/error-message'
import { Fragment } from 'react/jsx-runtime'
import DOMPurify from 'dompurify'
import { useState } from 'react'
import { usePaymentMethod, type CombinedSchemaInputs } from './usePaymentMethod'
import { SPLIT_BY } from './Constants'
import { NumberInputField, RadioGroupField } from '@/components/Common'
import { useLocale } from '@/contexts/LocaleProvider'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

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
  const splitAmount = watch('splitAmount')
  const splits = paymentMethod.splits ?? []
  const remainderId = Object.entries(priorities).reduce(
    (maxId, [uuid, priority]) => (!maxId || (priorities[maxId] ?? 0) < priority ? uuid : maxId),
    '',
  )

  const { currency } = useLocale()
  const [amountValues, setAmountValues] = useState<Record<string, number | null>>(
    splitBy === SPLIT_BY.amount
      ? splitAmount
      : splits.reduce<Record<string, number | null>>((acc, curr) => {
          acc[curr.uuid] = curr.uuid === remainderId ? null : 0
          return acc
        }, {}),
  )
  const [percentageValues, setPercentageValues] = useState<Record<string, number>>(
    splitBy === SPLIT_BY.percentage
      ? // null is not a valid value for percentage splits. conver them to zeros
        Object.fromEntries(Object.entries(splitAmount).map(([k, v]) => [k, v ?? 0]))
      : splits.reduce<Record<string, number>>((acc, curr, index) => {
          acc[curr.uuid] = index === 0 ? 100 : 0
          return acc
        }, {}),
  )

  const Components = useComponentContext()

  if (mode !== 'SPLIT' || bankAccounts.length < 2 || paymentMethod.splits === null) return
  //Used by form schema to determine variant
  setValue('isSplit', true)

  const getFieldsList = () => {
    if (splitBy === SPLIT_BY.amount)
      return (
        <Components.ReorderableList
          label={t('draggableListLabel')}
          items={splits.map(split => ({
            label: split.name as string,
            content: (
              <AmountField
                key={`amount-${split.uuid}`}
                split={split}
                onChange={e => {
                  setAmountValues(prev => ({ ...prev, [split.uuid]: e }))
                  setValue('splitAmount', { ...splitAmount, [split.uuid]: e })
                }}
                remainderId={remainderId}
              />
            ),
          }))}
          onReorder={(newOrder: number[]) => {
            setValue(
              'priority',
              newOrder.reduce((acc: Record<string, number>, curr: number, currIndex: number) => {
                const split = splits[curr]
                return split ? { ...acc, [split.uuid]: currIndex + 1 } : acc
              }, {}),
            )
            const lastSplit = splits[newOrder[newOrder.length - 1] as number]
            setValue(`splitAmount.${lastSplit?.uuid}`, null)
            remainderId && resetField(`splitAmount.${remainderId}`)
          }}
        />
      )
    else
      return splits.map(split => (
        <PercentageField
          key={`percentage-${split.uuid}`}
          split={split}
          control={control}
          onChange={e => {
            setPercentageValues(prev => ({ ...prev, [split.uuid]: e }))
            setValue('splitAmount', { ...splitAmount, [split.uuid]: e })
          }}
          percentageValues={percentageValues}
          currency={currency}
        />
      ))
  }
  return (
    <>
      <ErrorMessage
        errors={errors}
        name="split_amount.root"
        render={() => <Components.Alert status="error" label={t('validations.percentageError')} />}
      />
      <h2>{t('title')}</h2>
      <Trans t={t} i18nKey="splitDescription" components={{ p: <p /> }} />
      <RadioGroupField
        name="splitBy"
        label={t('splitByLabel')}
        onChange={value => {
          switch (value) {
            case SPLIT_BY.percentage:
              setValue('splitAmount', percentageValues)
              break
            case SPLIT_BY.amount:
              setValue('splitAmount', amountValues)
              break
            default:
              // this really shouldn't happen
              break
          }
        }}
        options={[
          { value: SPLIT_BY.percentage, label: t('percentageLabel') },
          { value: SPLIT_BY.amount, label: t('amountLabel') },
        ]}
      />
      {paymentMethod.splits && getFieldsList()}
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
  onChange: (e: number) => void
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
      onChange={e => {
        onChange(e)
      }}
    />
  )
}

function PercentageField({
  split,
  control,
  onChange,
  percentageValues,
  currency,
}: {
  split: Split
  control: Control<CombinedSchemaInputs>
  onChange: (e: number) => void
  percentageValues: Record<string, number>
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
        format="decimal"
        min={0}
        isRequired
        errorMessage={t('validations.amountError')}
      />
    </Fragment>
  )
}
