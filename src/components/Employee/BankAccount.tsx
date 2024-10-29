import { useAddEmployeeBankAccount } from '@/api/queries/employee'
import checkImage from '@/assets/check.png'
import { BaseComponent, useBase, type BaseComponentInterface } from '@/components/Base'
import { Button, Flex, Select, TextField, useAsyncError } from '@/components/Common'
import { useFlow, type EmployeeOnboardingContextInterface } from '@/components/Flow'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { Form, ListBoxItem } from 'react-aria-components'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import * as v from 'valibot'

interface BankAccountProps {
  employeeId: string
}

const BankAccountSchema = v.object({
  name: v.pipe(v.string(), v.nonEmpty()),
  routing_number: v.pipe(v.string(), v.regex(/^[0-9]{9}$/)),
  account_number: v.pipe(v.string(), v.regex(/^[0-9]{9,18}$/)),
  account_type: v.picklist(['Checking', 'Savings']),
})

export type BankAccountPayload = v.InferOutput<typeof BankAccountSchema>

export const BankAccount = (props: BankAccountProps & BaseComponentInterface) => {
  const { onEvent, employeeId } = props
  useI18n('Employee.BankAccount')
  const { t } = useTranslation('Employee.BankAccount')
  const throwError = useAsyncError()
  const { setError } = useBase()
  const { control, handleSubmit } = useForm<BankAccountPayload>({
    resolver: valibotResolver(BankAccountSchema),
    defaultValues: {
      name: '',
      routing_number: '',
      account_number: '',
      account_type: undefined,
    },
  })

  const { mutate: addBankAccount, isPending } = useAddEmployeeBankAccount(employeeId, {
    onSuccess: data => {
      onEvent(componentEvents.EMPLOYEE_BANK_ACCOUNT_CREATED, data)
    },
    onError: setError,
  })

  const onSubmit: SubmitHandler<BankAccountPayload> = payload => {
    try {
      addBankAccount({ body: payload })
    } catch (err) {
      throwError(err)
    }
  }

  return (
    <BaseComponent {...props}>
      <h2>{t('title')}</h2>
      <p>{t('description')}</p>
      <img src={checkImage} alt={t('checkImageAlt')} />
      <Form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          control={control}
          name="name"
          label={t('nameLabel')}
          isRequired
          errorMessage={t('validations.accountName', { ns: 'common' })}
        />
        <TextField
          control={control}
          name="routing_number"
          label={t('routingNumberLabel')}
          isRequired
          errorMessage={t('validations.routingNumber', { ns: 'common' })}
        />
        <TextField
          control={control}
          name="account_number"
          label={t('accountNumberLabel')}
          isRequired
          errorMessage={t('validations.accountNumber', { ns: 'common' })}
        />
        <Select
          control={control}
          name="account_type"
          label={t('accountTypeLabel')}
          items={[
            { id: 'Checking', name: t('accountTypeChecking') },
            { id: 'Savings', name: t('accountTypeSavings') },
          ]}
          errorMessage={t('validations.accountType')}
        >
          {(type: Record<string, string>) => <ListBoxItem>{type.name}</ListBoxItem>}
        </Select>
        <Flex>
          <Button
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

export const BankAccountContextual = () => {
  const { employeeId, onEvent } = useFlow<EmployeeOnboardingContextInterface>()
  const { t } = useTranslation()

  if (!employeeId) {
    throw new Error(
      t('errors.missingParamsOrContext', {
        component: 'BankAccount',
        param: 'employeeId',
        provider: 'FlowProvider',
      }),
    )
  }
  return <BankAccount employeeId={employeeId} onEvent={onEvent} />
}
