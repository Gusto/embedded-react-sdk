import { valibotResolver } from '@hookform/resolvers/valibot'
import { FieldError, Form, Input, Label, ListBoxItem, TextField } from 'react-aria-components'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import * as v from 'valibot'
import checkImage from '@/assets/check.png'
import { useBase, BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { Button, Flex, Select, useAsyncError } from '@/components/Common'
import { useFlow, type EmployeeOnboardingContextInterface } from '@/components/Flow'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { useAddEmployeeBankAccount } from '@/api/queries/employee'

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
        <Controller
          control={control}
          name="name"
          render={({ field, fieldState: { invalid } }) => (
            <TextField {...field} isRequired validationBehavior="aria" isInvalid={invalid}>
              <Label>{t('nameLabel')}</Label>
              <Input ref={field.ref} />
              <FieldError>{t('validations.accountName', { ns: 'common' })}</FieldError>
            </TextField>
          )}
        />
        <Controller
          control={control}
          name="routing_number"
          rules={{ required: 'Routing number is required' }}
          render={({ field, fieldState: { invalid } }) => (
            <TextField {...field} isRequired validationBehavior="aria" isInvalid={invalid}>
              <Label>{t('routingNumberLabel')}</Label>
              <Input ref={field.ref} />
              <FieldError>{t('validations.routingNumber', { ns: 'common' })}</FieldError>
            </TextField>
          )}
        />
        <Controller
          control={control}
          name="account_number"
          rules={{ required: 'Account number is required' }}
          render={({ field, fieldState: { invalid } }) => (
            <TextField {...field} isRequired validationBehavior="aria" isInvalid={invalid}>
              <Label>{t('accountNumberLabel')}</Label>
              <Input ref={field.ref} />
              <FieldError>{t('validations.accountNumber', { ns: 'common' })}</FieldError>
            </TextField>
          )}
        />

        <Controller
          control={control}
          name="account_type"
          render={({ field, fieldState: { invalid } }) => (
            <Select
              {...field}
              isInvalid={invalid}
              label={t('accountTypeLabel')}
              items={[
                { id: 'Checking', name: t('accountTypeChecking') },
                { id: 'Savings', name: t('accountTypeSavings') },
              ]}
              errorMessage={t('validations.accountType')}
            >
              {(type: Record<string, string>) => <ListBoxItem>{type.name}</ListBoxItem>}
            </Select>
          )}
        />
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
