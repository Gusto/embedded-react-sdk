import { Label, Radio, Input, FieldError } from 'react-aria-components'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import {
  usePaymentMethod,
  type CombinedSchemaInputs,
} from '@/components/Employee/PaymentMethodCombo/PaymentMethod'
import { Alert, NumberField, RadioGroup } from '@/components/Common'
import { ErrorMessage } from '@hookform/error-message'
import * as v from 'valibot'
import { Fragment } from 'react/jsx-runtime'
import { useLocale } from '@/contexts/LocaleProvider'
import type { PaymentMethodType } from '@/types'

export enum SPLIT_BY {
  percentage = 'Percentage',
  amount = 'Amount',
}
const splitByPrioritySort = (
  a: NonNullable<PaymentMethodType['splits']>[number],
  b: NonNullable<PaymentMethodType['splits']>[number],
) => ((a.priority as number) > (b.priority as number) ? 1 : -1)

export function Split() {
  const { paymentMethod, bankAccounts, mode } = usePaymentMethod()
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<CombinedSchemaInputs>()
  const { t } = useTranslation('Employee.PaymentMethod')
  const watchSplitBy = useWatch<CombinedSchemaInputs>({ control, name: 'split_by' })
  const watchRemainder = useWatch<CombinedSchemaInputs>({ control, name: 'remainder' })
  const { currency } = useLocale()

  if (mode !== 'SPLIT' || bankAccounts.length < 2) return
  //Used by form schema to determine variant
  setValue('isSplit', true)
  return (
    <>
      <ErrorMessage
        errors={errors}
        name="split_amount.root"
        render={() => <Alert variant="error" label={t('validations.percentageError')} />}
      />
      <ErrorMessage
        errors={errors}
        name="priority.root"
        render={() => <Alert variant="error" label={t('validations.priorityError')} />}
      />
      <h2>{t('title')}</h2>
      <Trans t={t} i18nKey="splitDescription" components={{ p: <p /> }} />
      <RadioGroup control={control} name="split_by" label={t('splitByLabel')}>
        <Radio value={SPLIT_BY.percentage}>{t('percentageLabel')}</Radio>
        <Radio value={SPLIT_BY.amount}>{t('amountLabel')}</Radio>
      </RadioGroup>
      {paymentMethod.splits &&
        paymentMethod.splits.sort(splitByPrioritySort).map(split => (
          <Fragment key={split.uuid}>
            {/* {watchSplitBy === 'Amount' && (
              <Controller
                control={control}
                name={`priority.${split.uuid}`}
                render={({ field, fieldState: { invalid } }) => (
                  <Select
                    {...field}
                    isInvalid={invalid}
                    label={t('priorityLabel')}
                    items={
                      paymentMethod.splits?.map((_, i) => ({
                        id: i + 1,
                        name: t('priority', { count: i + 1, ordinal: true }),
                      })) ?? []
                    }
                    defaultSelectedKey={field.value}
                  >
                    {(option: { name: string; id: number }) => (
                      <ListBoxItem>{option.name}</ListBoxItem>
                    )}
                  </Select>
                )}
              />
            )} */}
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
              isDisabled={watchSplitBy === 'Amount' && watchRemainder === split.uuid}
              errorMessage={t('validations.amountError')}
            />
            {/* 
            {watchSplitBy === 'Amount' && (
              <RadioGroup control={control} name="remainder">
                <Radio value={split.uuid}>
                  <Label>{t('remainderLabel')}</Label>
                </Radio>
              </RadioGroup>
            )} */}
          </Fragment>
        ))}
    </>
  )
}
