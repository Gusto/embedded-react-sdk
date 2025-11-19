import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useWireInRequestsListSuspense } from '@gusto/embedded-api/react-query/wireInRequestsList'
import styles from './WireInstructions.module.scss'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import type { OnEventType } from '@/components/Base/useBase'
import { Flex } from '@/components/Common/Flex/Flex'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useComponentDictionary, useI18n } from '@/i18n'
import { payrollWireEvents, type EventType } from '@/shared/constants'
import { useDateFormatter } from '@/hooks/useDateFormatter'
import useNumberFormatter from '@/hooks/useNumberFormatter'
import CopyIcon from '@/assets/icons/icon-copy.svg?react'

interface WireInstructionsProps extends BaseComponentInterface<'Payroll.WireInstructions'> {
  companyId: string
  wireInId?: string
  onEvent: OnEventType<EventType, unknown>
  modalContainerRef?: React.RefObject<HTMLDivElement | null>
}

interface WireInstructionFieldProps {
  label: string
  value: string
  onCopy?: () => void
  copyAriaLabel?: string
  showCopiedMessage?: boolean
  copiedMessage?: string
}

function WireInstructionField({
  label,
  value,
  onCopy,
  copyAriaLabel = '',
  showCopiedMessage,
  copiedMessage,
}: WireInstructionFieldProps) {
  const { ButtonIcon, Text } = useComponentContext()
  const hasCopyFunctionality = !!onCopy

  if (hasCopyFunctionality) {
    return (
      <Flex flexDirection="column" gap={8}>
        <Flex justifyContent="space-between" alignItems="center" gap={16}>
          <Text className={styles.fieldLabel}>{label}</Text>
          <ButtonIcon
            variant="tertiary"
            onClick={onCopy}
            aria-label={copyAriaLabel}
            className={styles.copyButton}
          >
            <CopyIcon />
          </ButtonIcon>
        </Flex>
        <Text className={styles.fieldValue}>{value}</Text>
        {showCopiedMessage && <Text className={styles.copiedMessage}>{copiedMessage}</Text>}
      </Flex>
    )
  }

  return (
    <Flex flexDirection="column" gap={8}>
      <Text className={styles.fieldLabel}>{label}</Text>
      <Text className={styles.fieldValue}>{value}</Text>
    </Flex>
  )
}

export function WireInstructions(props: WireInstructionsProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

export const Root = ({
  companyId,
  wireInId,
  dictionary,
  onEvent,
  modalContainerRef,
}: WireInstructionsProps) => {
  useComponentDictionary('Payroll.WireInstructions', dictionary)
  useI18n('Payroll.WireInstructions')
  const { t } = useTranslation('Payroll.WireInstructions')
  const { Button, Select, Card, Text, UnorderedList, Heading, Alert } = useComponentContext()
  const dateFormatter = useDateFormatter()
  const formatCurrency = useNumberFormatter('currency')

  const { data: wireInRequestsData } = useWireInRequestsListSuspense({
    companyUuid: companyId,
  })

  const [copiedToClipboard, setCopiedToClipboard] = useState(false)

  const wireInInformation = useMemo(() => {
    const requests = wireInRequestsData.wireInRequestList || []
    const activeRequests = requests.filter(r => r.status === 'awaiting_funds')

    if (wireInId) {
      const filtered = activeRequests.filter(r => r.uuid === wireInId)
      return filtered
    }

    return activeRequests
  }, [wireInRequestsData, wireInId])

  const [selectedWireInId, setSelectedWireInId] = useState<string | null>(wireInId || null)

  const selectedWireIn = useMemo(() => {
    if (selectedWireInId) {
      const found = wireInInformation.find(wi => wi.uuid === selectedWireInId) || null
      return found
    }
    return null
  }, [wireInInformation, selectedWireInId])

  const selectedInstruction = useMemo(() => {
    const request = selectedWireIn || wireInInformation[0]

    if (!request) return null

    const instruction = {
      id: request.uuid || '',
      trackingCode: request.uniqueTrackingCode || '',
      amount: parseFloat(request.requestedAmount || '0'),
      bankName: request.originationBank || '',
      bankAddress: request.originationBankAddress || '',
      recipientName: request.recipientName || '',
      recipientAddress: request.recipientAddress || '',
      recipientAccountNumber: request.recipientAccountNumber || '',
      recipientRoutingNumber: request.recipientRoutingNumber || '',
    }
    return instruction
  }, [wireInInformation, selectedWireIn])

  const shouldShowDropdown = !wireInId && wireInInformation.length > 1

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

  const handleWireInSelection = (selectedId: string) => {
    const wireIn = wireInInformation.find(wi => wi.uuid === selectedId)
    setSelectedWireInId(selectedId)
    onEvent(payrollWireEvents.PAYROLL_WIRE_INSTRUCTIONS_SELECT, {
      selectedId,
    })
    return wireIn
  }

  const handleConfirm = () => {
    onEvent(payrollWireEvents.PAYROLL_WIRE_INSTRUCTIONS_DONE)
  }

  const handleClose = () => {
    onEvent(payrollWireEvents.PAYROLL_WIRE_INSTRUCTIONS_CANCEL)
  }

  if (wireInInformation.length === 0) {
    return (
      <Flex flexDirection="column" gap={24}>
        <Text>{t('messages.noInstructions')}</Text>
        <div className={styles.footer}>
          <Button variant="secondary" onClick={handleClose} className={styles.footerButton}>
            {t('cta.close')}
          </Button>
        </div>
      </Flex>
    )
  }

  if (!selectedInstruction) {
    return (
      <Flex flexDirection="column" gap={24}>
        <Text>{t('messages.unableToLoad')}</Text>
        <div className={styles.footer}>
          <Button variant="secondary" onClick={handleClose} className={styles.footerButton}>
            {t('cta.close')}
          </Button>
        </div>
      </Flex>
    )
  }

  return (
    <Flex flexDirection="column" gap={24}>
      <div>
        <Heading as="h2" className={styles.title}>
          {t('title')}
        </Heading>
        <Text className={styles.subtitle}>{t('subtitle')}</Text>
      </div>

      {shouldShowDropdown && (
        <Select
          isRequired
          portalContainer={modalContainerRef?.current || undefined}
          label={t('selectLabel')}
          value={selectedWireInId || ''}
          options={wireInInformation.map(wi => ({
            label: wi.wireInDeadline
              ? dateFormatter.formatShortWithYear(wi.wireInDeadline)
              : t('selectFallback'),
            value: wi.uuid || '',
          }))}
          onChange={handleWireInSelection}
        />
      )}

      <Alert label={t('requirementsTitle')} disableScrollIntoView>
        <UnorderedList
          className={styles.requirementsList}
          items={[
            t('requirements.trackingCode'),
            t('requirements.amountMatch'),
            t('requirements.usBank'),
            t('requirements.authorized'),
          ]}
        />
      </Alert>

      <Flex flexDirection="column" gap={16}>
        <Card className={styles.requirementsCard}>
          <WireInstructionField
            label={t('fields.trackingCode')}
            value={selectedInstruction.trackingCode}
            onCopy={() => handleCopyToClipboard(selectedInstruction.trackingCode)}
            copyAriaLabel={t('ariaLabels.copyTrackingCode')}
            showCopiedMessage={copiedToClipboard}
            copiedMessage={t('messages.copied')}
          />

          <hr />

          <WireInstructionField
            label={t('fields.amount')}
            value={formatCurrency(selectedInstruction.amount)}
          />

          <hr />

          <WireInstructionField label={t('fields.bankName')} value={selectedInstruction.bankName} />

          <hr />

          <WireInstructionField
            label={t('fields.bankAddress')}
            value={selectedInstruction.bankAddress}
          />

          <hr />

          <WireInstructionField
            label={t('fields.recipientName')}
            value={selectedInstruction.recipientName}
          />

          <hr />

          <WireInstructionField
            label={t('fields.recipientAddress')}
            value={selectedInstruction.recipientAddress}
          />

          <hr />

          <WireInstructionField
            label={t('fields.accountNumber')}
            value={selectedInstruction.recipientAccountNumber}
          />

          <hr />

          <WireInstructionField
            label={t('fields.routingNumber')}
            value={selectedInstruction.recipientRoutingNumber}
          />
        </Card>
      </Flex>

      <div className={styles.footer}>
        <Button variant="secondary" onClick={handleClose} className={styles.footerButton}>
          {t('cta.close')}
        </Button>
        <Button variant="primary" onClick={handleConfirm} className={styles.footerButton}>
          {t('cta.confirm')}
        </Button>
      </div>
    </Flex>
  )
}
