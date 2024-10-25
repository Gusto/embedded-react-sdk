// eslint-disable-next-line no-restricted-imports
import { Button, Form, Input, Label, Radio, RadioGroup, TextField } from 'react-aria-components'
import { useTranslation } from 'react-i18next'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { useI18n } from '@/i18n'

interface BankAccountProps {
  companyId: string
}

export const BankAccount = (props: BankAccountProps & BaseComponentInterface) => {
  const { companyId } = props
  useI18n('Company.AddBank')
  const { t } = useTranslation('Company.AddBank') //TODO: Rename dictionary
  // const { mutate: createCompnayBankAccount } = useCreateCompanyBankAccount(companyId, {
  //   onError: (error: Error) => {
  //     onEvent(componentEvents.ERROR, { error: error });
  //   },
  //   onSuccess: (data: Schemas['Company-Bank-Account']) => {
  //     onEvent(componentEvents.SUCCESS, data);
  //   },
  // });
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // const formData = Object.fromEntries(new FormData(e.currentTarget));
    // createCompnayBankAccount(formData);
  }
  return (
    <BaseComponent {...props}>
      <div>
        <h1>{t('title')}</h1>
        <p>{t('intro')}</p>
      </div>
      <div>
        <RadioGroup defaultValue={'manual'}>
          <Label>{t('entry_selection_question')}</Label>
          <Radio value="manual">{t('manual_entry')}</Radio>

          <Radio value="plaid" isDisabled>
            {t('plaid_entry')}
          </Radio>
        </RadioGroup>
      </div>
      <br />
      <div>
        <Form onSubmit={handleSubmit}>
          <input type="hidden" name="company_id" value={companyId} />
          <TextField name="routing_number" isRequired>
            <Label>{t('routing_number_label')}</Label>
            <Input />
          </TextField>
          <TextField name="account_number" isRequired>
            <Label>{t('account_number_label')}</Label>
            <Input />
          </TextField>
          <RadioGroup name="account_type" defaultValue={'Checking'}>
            <Label>{t('account_type_label')}</Label>
            <Radio value="Checking">{t('account_type_checking')}</Radio>
            <Radio value="Savings">{t('account_type_savings')}</Radio>
          </RadioGroup>
          <Button type="submit">{t('submit')}</Button>
        </Form>
      </div>
    </BaseComponent>
  )
}
