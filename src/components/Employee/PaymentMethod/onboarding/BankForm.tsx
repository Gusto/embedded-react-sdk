import { useTranslation } from 'react-i18next'
import { BankFormBody } from '../shared/BankFormBody'
import type { UseBankFormProps } from '../shared/useBankForm'
import { useOnboardingBankFormDictionary } from './useFormDictionary'
import { Flex } from '@/components/Common/Flex'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { componentEvents, type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'

/** @internal */
export interface BankFormProps extends Omit<UseBankFormProps, 'employeeId'> {
  employeeId: string
  onEvent: OnEventType<EventType, unknown>
}

/** @internal */
export function BankForm({ employeeId, onEvent, ...hookProps }: BankFormProps) {
  const dictionary = useOnboardingBankFormDictionary()
  const { t } = useTranslation('Employee.PaymentMethod')
  const Components = useComponentContext()

  return (
    <Flex flexDirection="column" gap={32}>
      <Components.Heading as="h1" styledAs="h2">
        {t('addBankAccountFormTitle')}
      </Components.Heading>
      <BankFormBody
        employeeId={employeeId}
        dictionary={dictionary}
        onSaved={data => {
          onEvent(componentEvents.EMPLOYEE_BANK_ACCOUNT_CREATED, data)
        }}
        onCancel={() => {
          onEvent(componentEvents.CANCEL)
        }}
        {...hookProps}
      />
    </Flex>
  )
}
