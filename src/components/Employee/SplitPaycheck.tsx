import { useUpdateEmployeePaymentMethod } from '@/api/queries/employee'
import { BaseComponent, useBase, type BaseComponentInterface } from '@/components/Base'
import { Button, Flex, NumberField, RadioGroup, Select, useAsyncError } from '@/components/Common'
import { useFlow, type EmployeeOnboardingContextInterface } from '@/components/Flow'
import { useLocale } from '@/contexts/LocaleProvider'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import type { PaymentMethodType } from '@/types'
import { ErrorMessage } from '@hookform/error-message'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { Fragment } from 'react'
import { Form, Label, ListBoxItem, Radio } from 'react-aria-components'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import * as v from 'valibot'

interface SplitPaycheckProps {
  paymentMethod: PaymentMethodType
  employeeId: string
}

const SplitSchema = v.variant('split_by', [
  v.object({
    split_by: v.literal('Percentage'),
    split_amount: v.pipe(
      v.record(v.string(), v.pipe(v.number(), v.maxValue(100), v.minValue(0))),
      v.check(input => Object.values(input).reduce((acc, curr) => acc + curr, 0) === 100),
    ),
  }),
  v.object({
    split_by: v.literal('Amount'),
    priority: v.pipe(
      v.record(v.string(), v.number()),
      v.check(input => {
        const arr = Object.values(input)
        return arr.filter((item, index) => arr.indexOf(item) !== index).length === 0
      }),
    ),
    split_amount: v.record(v.string(), v.pipe(v.number(), v.minValue(0))),
    remainder: v.string(),
  }),
])

type Inputs = v.InferInput<typeof SplitSchema>
type Payload = v.InferOutput<typeof SplitSchema>

const splitByPrioritySort = (
  a: NonNullable<PaymentMethodType['splits']>[number],
  b: NonNullable<PaymentMethodType['splits']>[number],
) => ((a.priority as number) > (b.priority as number) ? 1 : -1)

export const SplitPaycheck = (props: SplitPaycheckProps & BaseComponentInterface) => {
  const { paymentMethod, employeeId, onEvent } = props
  const { setError } = useBase()
  useI18n('Employee.SplitPaycheck')
  const { t } = useTranslation('Employee.SplitPaycheck')
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs, unknown, Payload>({
    resolver: valibotResolver(SplitSchema),
    defaultValues: {
      // @ts-expect-error tbd: investigate
      split_by: paymentMethod.split_by,
      ...paymentMethod.splits?.reduce(
        (acc, { uuid, split_amount, priority }) => ({
          split_amount: { ...acc.split_amount, [uuid]: Number(split_amount ?? '') },
          priority: { ...acc.priority, [uuid]: Number(priority) },
        }),
        { split_amount: {}, priority: {} },
      ),
      //Remainder is either a split with no split_amount, or the last split in the group
      remainder: paymentMethod.splits?.reduce(
        (acc, curr) =>
          curr.split_amount === null ? curr.uuid : paymentMethod.splits?.at(-1)?.uuid,
        undefined,
      ),
    },
  })
  const { currency } = useLocale()
  const throwError = useAsyncError()
  const watchSplitBy = watch('split_by')
  const watchRemainder = watch('remainder')

  const { mutate: mutatePaymentMethod, isPending } = useUpdateEmployeePaymentMethod(employeeId, {
    onSuccess: (data: typeof paymentMethod) => {
      onEvent(componentEvents.EMPLOYEE_PAYMENT_METHOD_UPDATED, data)
    },
    onError: setError,
  })

  const onSubmit: SubmitHandler<Inputs> = data => {
    /**
     * type: The payment method type. If type is Check, then split_by and splits do not need to be populated. If type is Direct Deposit, split_by and splits are required.
     * split_by: Describes how the payment will be split. If split_by is Percentage, then the split amounts must add up to exactly 100. If split_by is Amount, then the last split amount must be nil to capture the remainder.
     */
    try {
      const body = {
        type: paymentMethod.type,
        version: paymentMethod.version as string,
        split_by: data.split_by,
        splits: paymentMethod.splits?.map(({ hidden_account_number, ...split }) => ({
          ...split,
          split_amount:
            data.split_by === 'Amount' && split.uuid === data.remainder
              ? null
              : data.split_amount[split.uuid],
          priority: data.split_by === 'Percentage' ? split.priority : data.priority[split.uuid],
        })),
      }
      mutatePaymentMethod({ body })
    } catch (err) {
      throwError(err)
    }
  }

  return (
    <BaseComponent {...props}>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <ErrorMessage
          errors={errors}
          name="split_amount.root"
          render={() => <p role="alert">{t('validations.percentageError')}</p>}
        />
        <ErrorMessage
          errors={errors}
          name="priority.root"
          render={() => <p role="alert">{t('validations.priorityError')}</p>}
        />
        <h2>{t('title')}</h2>
        <p>{t('description')}</p>
        <Select
          control={control}
          name="split_by"
          label={t('splitByLabel')}
          items={[
            { id: 'Percentage', name: t('percentageLabel') },
            { id: 'Amount', name: t('amountLabel') },
          ]}
        >
          {(option: { name: string; id: string }) => <ListBoxItem>{option.name}</ListBoxItem>}
        </Select>
        {paymentMethod.splits &&
          paymentMethod.splits.sort(splitByPrioritySort).map(split => (
            <Fragment key={split.uuid}>
              <h2>
                {split.name} - {split.hidden_account_number}
              </h2>
              <p>{t('bankDescription')}</p>
              {watchSplitBy === 'Amount' && (
                <Select
                  control={control}
                  name={`priority.${split.uuid}`}
                  label={t('priorityLabel')}
                  items={
                    paymentMethod.splits?.map((_, i) => ({
                      id: i + 1,
                      name: t('priority', { count: i + 1, ordinal: true }),
                    })) ?? []
                  }
                >
                  {(option: { name: string; id: number }) => (
                    <ListBoxItem>{option.name}</ListBoxItem>
                  )}
                </Select>
              )}
              <NumberField
                control={control}
                name={`split_amount.${split.uuid}`}
                label={t('splitAmountLabel')}
                errorMessage={t('validations.amountError')}
                formatOptions={{
                  style: watchSplitBy === 'Percentage' ? 'percent' : 'currency',
                  currency: currency,
                }}
                isDisabled={watchSplitBy === 'Amount' && watchRemainder === split.uuid}
              />
              {watchSplitBy === 'Amount' && (
                <RadioGroup control={control} name="remainder">
                  <Radio value={split.uuid}>
                    <Label>{t('remainderLabel')}</Label>
                  </Radio>
                </RadioGroup>
              )}
            </Fragment>
          ))}

        <Flex>
          <Button
            type="button"
            variant="secondary"
            onPress={() => {
              onEvent(componentEvents.CANCEL)
            }}
          >
            {t('cancelCta')}
          </Button>
          <Button type="submit" isLoading={isPending}>
            {t('submitCta')}
          </Button>
        </Flex>
      </Form>
    </BaseComponent>
  )
}
export const SplitPaycheckContextual = () => {
  const { employeeId, paymentMethod, onEvent } = useFlow<EmployeeOnboardingContextInterface>()
  const { t } = useTranslation()

  if (!employeeId || !paymentMethod) {
    throw new Error(
      t('errors.missingParamsOrContext', {
        component: 'SplitPaycheck',
        param: 'employeeId || paymentMethod',
        provider: 'FlowProvider',
      }),
    )
  }
  return <SplitPaycheck employeeId={employeeId} onEvent={onEvent} paymentMethod={paymentMethod} />
}
