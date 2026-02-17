import { useCompanyBankAccount } from './useCompanyBankAccount'
import { Flow } from '@/components/Flow/Flow'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { useComponentDictionary } from '@/i18n/I18n'

export interface BankAccountProps extends BaseComponentInterface<'Company.BankAccount'> {
  companyId: string
}

function BankAccountFlow({ companyId, onEvent, dictionary }: BankAccountProps) {
  useComponentDictionary('Company.BankAccount', dictionary)

  const {
    meta: { machine },
  } = useCompanyBankAccount({ companyId })

  return <Flow machine={machine} onEvent={onEvent} />
}

export function BankAccount(props: BankAccountProps) {
  return (
    <BaseComponent {...props}>
      <BankAccountFlow {...props} />
    </BaseComponent>
  )
}
