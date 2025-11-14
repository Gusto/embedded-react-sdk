import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './WireInstructions.module.scss'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import type { OnEventType } from '@/components/Base/useBase'
import { Flex } from '@/components/Common/Flex/Flex'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useComponentDictionary, useI18n } from '@/i18n'
import { payrollWireEvents, type EventType } from '@/shared/constants'
import CopyIcon from '@/assets/icons/icon-copy.svg?react'

interface WireInstructionsProps extends BaseComponentInterface<'Payroll.WireInstructions'> {
  companyId: string
  wireInId?: string
  onEvent: OnEventType<EventType, unknown>
}

export function WireInstructions(props: WireInstructionsProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

interface WireInstruction {
  id: string
  payrollPeriod: {
    start: string
    end: string
  }
  trackingCode: string
  amount: number
  currency: string
}

const Root = ({ companyId, wireInId, dictionary, onEvent }: WireInstructionsProps) => {
  useComponentDictionary('Payroll.WireInstructions', dictionary)
  useI18n('Payroll.WireInstructions')
  const { t } = useTranslation('Payroll.WireInstructions')
  const { Button, Select, ButtonIcon, Card, Text } = useComponentContext()

  const [selectedWireId, setSelectedWireId] = useState<string | null>(wireInId || null)
  const [copiedToClipboard, setCopiedToClipboard] = useState(false)

  const placeholderWireInstructions: WireInstruction[] = [
    {
      id: '1',
      payrollPeriod: { start: 'July 2', end: 'July 16, 2025' },
      trackingCode: '1trvxx4thrnh',
      amount: 7543.89,
      currency: 'USD',
    },
    {
      id: '2',
      payrollPeriod: { start: 'July 30', end: 'Aug 13, 2025' },
      trackingCode: '2abc45defgh',
      amount: 8704.11,
      currency: 'USD',
    },
  ]

  const selectedInstruction = placeholderWireInstructions.find(
    wi => wi.id === (selectedWireId || placeholderWireInstructions[0]?.id),
  )

  const shouldShowDropdown = !wireInId && placeholderWireInstructions.length > 1

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedToClipboard(true)
      setTimeout(() => {
        setCopiedToClipboard(false)
      }, 2000)
    } catch {
      // Silently fail if clipboard API is not available
    }
  }

  const handleConfirm = () => {
    onEvent(payrollWireEvents.PAYROLL_WIRE_INSTRUCTIONS_DONE)
  }

  const handleClose = () => {
    onEvent(payrollWireEvents.PAYROLL_WIRE_INSTRUCTIONS_CANCEL)
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount)
  }

  return (
    <Flex flexDirection="column" gap={24}>
      <div>
        <h2 className={styles.title}>{t('title')}</h2>
        <Text className={styles.subtitle}>
          This info tells your bank how much and where to send the wire transfer. Make sure to send
          a wire transfer—we will not accept ACH transfers. Afterwards, confirm below that you have
          completed this step.
        </Text>
      </div>

      {shouldShowDropdown && (
        <Select
          isRequired
          label="Wire transfer for payroll"
          value={selectedWireId || placeholderWireInstructions[0]?.id || ''}
          options={placeholderWireInstructions.map(wi => ({
            label: `${wi.payrollPeriod.start}–${wi.payrollPeriod.end}`,
            value: wi.id,
          }))}
          onChange={(selectedId: string) => {
            setSelectedWireId(selectedId)
            onEvent(payrollWireEvents.PAYROLL_WIRE_INSTRUCTIONS_SELECT, {
              selectedId,
            })
          }}
        />
      )}

      {!shouldShowDropdown && selectedInstruction && (
        <div>
          <Text className={styles.fieldLabel}>Wire transfer for payroll</Text>
          <Text className={styles.fieldValue}>
            {selectedInstruction.payrollPeriod.start}–{selectedInstruction.payrollPeriod.end}
          </Text>
        </div>
      )}

      <Card className={styles.requirementsCard}>
        <ul className={styles.requirementsList}>
          <li>The amount you send must exactly match the amount in the wire instructions</li>
          <li>The originating bank account must be based in the US</li>
          <li>You must be authorized to use the bank account on the company&apos;s behalf</li>
        </ul>
      </Card>

      {selectedInstruction && (
        <Flex flexDirection="column" gap={16}>
          <Card className={styles.requirementsCard}>
            <div className={styles.wireInstructionsContainer}>
              <Flex justifyContent="space-between" alignItems="center">
                <Text className={styles.fieldLabel}>Unique tracking code</Text>
                <ButtonIcon
                  variant="tertiary"
                  onClick={() => handleCopyToClipboard(selectedInstruction.trackingCode)}
                  aria-label="Copy tracking code"
                  className={styles.copyButton}
                >
                  <CopyIcon />
                </ButtonIcon>
              </Flex>

              <Text className={styles.fieldValue}>{selectedInstruction.trackingCode}</Text>
              {copiedToClipboard && (
                <Text className={styles.copiedMessage}>Copied to clipboard!</Text>
              )}
            </div>
            <div>
              <Text className={styles.fieldLabel}>Amount to wire</Text>
              <Text className={styles.fieldValue}>
                {formatCurrency(selectedInstruction.amount, selectedInstruction.currency)}
              </Text>
            </div>
          </Card>
        </Flex>
      )}

      <Flex gap={12} justifyContent="flex-end">
        <Button variant="secondary" onClick={handleClose}>
          {t('cta.close')}
        </Button>
        <Button variant="primary" onClick={handleConfirm}>
          {t('cta.confirm')}
        </Button>
      </Flex>
    </Flex>
  )
}
