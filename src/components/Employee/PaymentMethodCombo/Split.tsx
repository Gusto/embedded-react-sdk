import { Radio } from 'react-aria-components'
import { useFormContext, useWatch } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import {
  usePaymentMethod,
  type CombinedSchemaInputs,
} from '@/components/Employee/PaymentMethodCombo/PaymentMethod'
import { Alert, NumberField, RadioGroup } from '@/components/Common'
import { ErrorMessage } from '@hookform/error-message'
import { Fragment } from 'react/jsx-runtime'
import { useLocale } from '@/contexts/LocaleProvider'
import { type Schemas } from '@/types/schema'
import { useState } from 'react'
import { ReorderableList } from '@/components/Common/ReorderableList'

export enum SPLIT_BY {
  percentage = 'Percentage',
  amount = 'Amount',
}
const splitByPrioritySort = (
  a: NonNullable<Schemas['Employee-Payment-Method']['splits']>[number],
  b: NonNullable<Schemas['Employee-Payment-Method']['splits']>[number],
) => ((a.priority as number) > (b.priority as number) ? 1 : -1)

export function Split() {
  const { paymentMethod, bankAccounts, mode } = usePaymentMethod()
  const {
    control,
    setValue,
    resetField,
    formState: { errors },
  } = useFormContext<CombinedSchemaInputs>()
  const { t } = useTranslation('Employee.PaymentMethod')
  const watchSplitBy = useWatch<CombinedSchemaInputs>({ control, name: 'split_by' })
  const sortedSplits = paymentMethod.splits?.sort(splitByPrioritySort) ?? []
  const [remainderId, setRemainderId] = useState(sortedSplits.at(-1)?.uuid ?? null)
  const { currency } = useLocale()

  if (mode !== 'SPLIT' || bankAccounts.length < 2 || paymentMethod.splits === null) return
  //Used by form schema to determine variant
  setValue('isSplit', true)
  const fieldsList = sortedSplits.map(split => (
    <Fragment key={split.uuid}>
      <NumberField
        control={control}
        name={`split_amount.${split.uuid}`}
        label={t('splitAmountLabel', {
          name: split.name,
          account_number: split.hidden_account_number,
        })}
        formatOptions={{
          style: watchSplitBy === 'Percentage' ? 'decimal' : 'currency',
          currency: currency,
        }}
        placeholder={
          watchSplitBy === 'Amount' && remainderId === split.uuid ? t('remainderLabel') : ''
        }
        isDisabled={watchSplitBy === 'Amount' && remainderId === split.uuid}
        errorMessage={t('validations.amountError')}
      />
    </Fragment>
  ))

  const getFieldsList = () => {
    if (watchSplitBy === 'Amount')
      return (
        <ReorderableList
          label={t('draggableListLabel')}
          onReorder={newOrder => {
            setValue(
              'priority',
              newOrder.reduce((acc, curr, currIndex) => {
                const split = sortedSplits[curr]
                return split ? { ...acc, [split.uuid]: currIndex + 1 } : acc
              }, {}),
            )
            const lastSplit = sortedSplits[
              newOrder[newOrder.length - 1] as number
            ] as (typeof sortedSplits)[0]
            setValue(`split_amount.${lastSplit.uuid}`, null)
            remainderId && resetField(`split_amount.${remainderId}`)
            setRemainderId(lastSplit.uuid)
          }}
          items={fieldsList}
        />
      )
    else return fieldsList
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
      <RadioGroup control={control} name="split_by" label={t('splitByLabel')}>
        <Radio value={SPLIT_BY.percentage}>{t('percentageLabel')}</Radio>
        <Radio value={SPLIT_BY.amount}>{t('amountLabel')}</Radio>
      </RadioGroup>

      {paymentMethod.splits && getFieldsList()}
    </>
  )
}
