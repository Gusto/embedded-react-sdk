import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActionsLayout, Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'

export interface EditEmployeeBalanceModalProps {
  isOpen: boolean
  onClose: () => void
  employeeName: string
  currentBalance: number
  onConfirm: (newBalance: number) => void
  isPending: boolean
}

export function EditEmployeeBalanceModal({
  isOpen,
  onClose,
  employeeName,
  currentBalance,
  onConfirm,
  isPending,
}: EditEmployeeBalanceModalProps) {
  useI18n('Company.TimeOff.TimeOffPolicyDetails')
  const { t } = useTranslation('Company.TimeOff.TimeOffPolicyDetails')
  const { Modal, Heading, NumberInput, Button } = useComponentContext()

  const [balance, setBalance] = useState(currentBalance)

  const handleConfirm = () => {
    onConfirm(balance)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <ActionsLayout>
          <Button variant="secondary" onClick={onClose} isDisabled={isPending}>
            {t('editBalanceModal.cancelCta')}
          </Button>
          <Button variant="primary" onClick={handleConfirm} isLoading={isPending}>
            {t('editBalanceModal.updateCta')}
          </Button>
        </ActionsLayout>
      }
    >
      <Flex flexDirection="column" gap={16}>
        <Heading as="h3" styledAs="h3">
          {t('editBalanceModal.title', { name: employeeName })}
        </Heading>
        <NumberInput
          name="balance"
          label={t('editBalanceModal.balanceLabel')}
          value={balance}
          onChange={setBalance}
          minimumFractionDigits={1}
          maximumFractionDigits={2}
          min={0}
        />
      </Flex>
    </Modal>
  )
}
