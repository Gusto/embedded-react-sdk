import { Radio } from 'react-aria-components'
import { Control, useFormContext } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import {
  usePaymentMethod,
  type CombinedSchemaInputs,
} from '@/components/Employee/PaymentMethod/PaymentMethod'
import { Alert, NumberField, RadioGroup } from '@/components/Common'
import { ErrorMessage } from '@hookform/error-message'
import { Fragment } from 'react/jsx-runtime'
import { useLocale } from '@/contexts/LocaleProvider'
import { ReorderableList } from '@/components/Common/ReorderableList'
import DOMPurify from 'dompurify'
import { useState } from 'react'
import { Schemas } from '@/types/schema'

export enum SPLIT_BY {
  percentage = 'Percentage',
  amount = 'Amount',
}

type Split = NonNullable<Schemas['Employee-Payment-Method']['splits']>[number]

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
  const splitBy = watch('split_by')
  const priorities = watch('priority')
  const splitAmount = watch('split_amount')
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

  if (mode !== 'SPLIT' || bankAccounts.length < 2 || paymentMethod.splits === null) return
  //Used by form schema to determine variant
  setValue('isSplit', true)

  const getFieldsList = () => {
    if (splitBy === SPLIT_BY.amount)
      return (
        <ReorderableList
          label={t('draggableListLabel')}
          onReorder={newOrder => {
            setValue(
              'priority',
              newOrder.reduce((acc, curr, currIndex) => {
                const split = splits[curr]
                return split ? { ...acc, [split.uuid]: currIndex + 1 } : acc
              }, {}),
            )
            const lastSplit = splits[newOrder[newOrder.length - 1] as number] as (typeof splits)[0]
            setValue(`split_amount.${lastSplit.uuid}`, null)
            remainderId && resetField(`split_amount.${remainderId}`)
          }}
          items={splits.map(split => (
            <AmountField
              key={`amount-${split.uuid}`}
              split={split}
              control={control}
              onChange={e => {
                setAmountValues(prev => ({ ...prev, [split.uuid]: e }))
                setValue('split_amount', { ...splitAmount, [split.uuid]: e })
              }}
              amountValues={amountValues}
              remainderId={remainderId}
              currency={currency}
            />
          ))}
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
            setValue('split_amount', { ...splitAmount, [split.uuid]: e })
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
        render={() => <Alert variant="error" label={t('validations.percentageError')} />}
      />
      <h2>{t('title')}</h2>
      <Trans t={t} i18nKey="splitDescription" components={{ p: <p /> }} />
      <RadioGroup
        control={control}
        name="split_by"
        label={t('splitByLabel')}
        value={splitBy}
        onChange={e => {
          switch (e) {
            case 'Percentage':
              setValue('split_by', SPLIT_BY.percentage)
              setValue('split_amount', percentageValues)
              break
            case 'Amount':
              setValue('split_by', SPLIT_BY.amount)
              setValue('split_amount', amountValues)
              break
            default:
              // this really shouldn't happen
              break
          }
        }}
      >
        <Radio value={SPLIT_BY.percentage}>{t('percentageLabel')}</Radio>
        <Radio value={SPLIT_BY.amount}>{t('amountLabel')}</Radio>
      </RadioGroup>

      {paymentMethod.splits && getFieldsList()}
    </>
  )
}

function AmountField({
  split,
  control,
  onChange,
  amountValues,
  remainderId,
  currency,
}: {
  split: Split
  control: Control<CombinedSchemaInputs>
  onChange: (e: number) => void
  amountValues: Record<string, number | null>
  remainderId: string
  currency: string
}) {
  const { t } = useTranslation('Employee.PaymentMethod')
  return (
    <NumberField
      key={split.uuid}
      control={control}
      name={`split_amount.${split.uuid}`}
      onChange={e => {
        onChange(e)
      }}
      value={remainderId === split.uuid ? undefined : (amountValues[split.uuid] ?? 0)}
      label={t('splitAmountLabel', {
        name: DOMPurify.sanitize(split.name ?? ''),
        account_number: DOMPurify.sanitize(split.hidden_account_number ?? ''),
        interpolation: { escapeValue: false },
      })}
      formatOptions={{
        style: 'currency',
        currency: currency,
      }}
      placeholder={remainderId === split.uuid ? t('remainderLabel') : ''}
      isDisabled={remainderId === split.uuid}
      errorMessage={t('validations.amountError')}
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
      <NumberField
        control={control}
        name={`split_amount.${split.uuid}`}
        onChange={e => {
          onChange(e)
        }}
        value={(() => {
          return percentageValues[split.uuid] ?? 0
        })()}
        label={t('splitAmountLabel', {
          name: DOMPurify.sanitize(split.name ?? ''),
          account_number: DOMPurify.sanitize(split.hidden_account_number ?? ''),
          interpolation: { escapeValue: false },
        })}
        formatOptions={{
          style: 'decimal',
          currency: currency,
        }}
        errorMessage={t('validations.amountError')}
      />
    </Fragment>
  )
}
