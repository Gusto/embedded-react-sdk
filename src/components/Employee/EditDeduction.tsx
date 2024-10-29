import { useAddEmployeeDeduction, useUpdateDeduction } from '@/api/queries/employee'
import { BaseComponent, useBase, type BaseComponentInterface } from '@/components/Base'
import {
  Button,
  Checkbox,
  Flex,
  NumberField,
  RadioGroup,
  TextField,
  useAsyncError,
} from '@/components/Common'
import { useFlow, type EmployeeOnboardingContextInterface } from '@/components/Flow'
import { useLocale } from '@/contexts/LocaleProvider'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import type { Schemas } from '@/types'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { Form, Radio } from 'react-aria-components'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import * as v from 'valibot'

interface DeductionFormProps {
  employeeId: string
  deduction?: Schemas['Garnishment']
}

const DeductionSchema = v.object({
  active: v.boolean(),
  amount: v.pipe(v.number(), v.minValue(0), v.transform(String)),
  description: v.pipe(v.string(), v.nonEmpty()),
  court_ordered: v.boolean(),
  times: v.nullable(v.number()), //The number of times to apply the garnishment. Ignored if recurring is true.
  recurring: v.pipe(
    v.string(),
    v.transform(val => val === 'true'),
  ),
  annual_maximum: v.pipe(
    v.number(),
    v.minValue(0),
    v.transform(val => (val > 0 ? val.toString() : null)),
  ),
  pay_period_maximum: v.pipe(
    v.number(),
    v.minValue(0),
    v.transform(val => (val > 0 ? val.toString() : null)),
  ),
  deduct_as_percentage: v.pipe(
    v.string(),
    v.transform(val => val === 'true'),
  ),
})

export type DeductionInputs = v.InferInput<typeof DeductionSchema>
export type DeductionPayload = v.InferOutput<typeof DeductionSchema>

export const EditDeduction = (props: DeductionFormProps & BaseComponentInterface) => {
  const { deduction, employeeId, onEvent } = props
  const { setError } = useBase()
  useI18n('Employee.Deductions')
  const { t } = useTranslation('Employee.Deductions', { keyPrefix: 'EditDeduction' })

  const { control, handleSubmit, watch } = useForm<DeductionInputs, unknown, DeductionPayload>({
    resolver: valibotResolver(DeductionSchema),
    defaultValues: {
      active: true,
      description: deduction?.description ?? '',
      amount: deduction?.amount ? Number(deduction.amount) : 0,
      court_ordered: deduction?.court_ordered ?? false,
      times: deduction?.times ?? 1, // note that this is required
      recurring: deduction?.recurring.toString() ?? 'true',
      annual_maximum: deduction?.annual_maximum ? Number(deduction.annual_maximum) : 0,
      pay_period_maximum: deduction?.pay_period_maximum ? Number(deduction.pay_period_maximum) : 0,
      deduct_as_percentage: deduction?.deduct_as_percentage.toString() ?? 'true',
    },
  })
  const { currency } = useLocale()
  const throwError = useAsyncError()

  const watchedRecurring = watch('recurring')
  const watchedDeductAsPercentage = watch('deduct_as_percentage')

  const { mutate: createDeduction, isPending: isPendingCreate } = useAddEmployeeDeduction({
    onSuccess: data => {
      onEvent(componentEvents.EMPLOYEE_DEDUCTION_UPDATED, data)
    },
    onError: setError,
  })

  const { mutate: updateDeduction, isPending: isPendingUpdate } = useUpdateDeduction(employeeId, {
    onSuccess: data => {
      onEvent(componentEvents.EMPLOYEE_DEDUCTION_UPDATED, data)
    },
    onError: setError,
  })

  const onSubmit = (payload: DeductionPayload) => {
    try {
      if (deduction) {
        updateDeduction({
          garnishment_id: deduction.uuid,
          body: { ...payload, version: deduction.uuid },
        })
      } else {
        createDeduction({ employee_id: employeeId, body: payload })
      }
    } catch (err) {
      throwError(err)
    }
  }

  return (
    <BaseComponent {...props}>
      <h1>{t('pageTitle')}</h1>
      <p>{t('desc')}</p>
      <h2>{t('externalPostTax')}</h2>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          control={control}
          name="description"
          label={t('description')}
          isRequired
          errorMessage={t('validations.description')}
        />
        <RadioGroup
          control={control}
          name="recurring"
          validationBehavior="aria"
          label={t('frequency')}
        >
          <Radio value="true">{t('recurring')}</Radio>
          <Radio value="false">{t('oneTime')}</Radio>
        </RadioGroup>
        <RadioGroup control={control} name="deduct_as_percentage" label={t('deductAs')}>
          <Radio value="true">{t('percentageOfPay')}</Radio>
          <Radio value="false">{t('fixedAmount')}</Radio>
        </RadioGroup>
        <NumberField
          control={control}
          name="amount"
          label={t('amount')}
          formatOptions={{
            style: watchedDeductAsPercentage === 'true' ? 'percent' : 'currency',
            currency: currency,
          }}
        />
        {watchedRecurring === 'true' && (
          <NumberField
            control={control}
            name="annual_maximum"
            label={t('annualMax')}
            formatOptions={{
              style: 'currency',
              currency: currency,
              currencyDisplay: 'symbol',
            }}
          />
        )}
        <Checkbox control={control} name="court_ordered">
          {t('courtOrdered')}
        </Checkbox>

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
          <Button type="submit" isLoading={isPendingCreate || isPendingUpdate}>
            {t('submitCta')}
          </Button>
        </Flex>
      </Form>
    </BaseComponent>
  )
}

export const EditDeductionsContextual = () => {
  const { employeeId, onEvent } = useFlow<EmployeeOnboardingContextInterface>()
  const { t } = useTranslation('common')

  if (!employeeId) {
    throw new Error(
      t('errors.missingParamsOrContext', {
        component: 'EditDeductions',
        param: 'employeeId',
        provider: 'FlowProvider',
      }),
    )
  }
  return <EditDeduction employeeId={employeeId} onEvent={onEvent} />
}
