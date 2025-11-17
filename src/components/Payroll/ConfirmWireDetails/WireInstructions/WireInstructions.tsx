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
import InfoIcon from '@/assets/icons/icon-info-outline.svg?react'

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

export const Root = ({ companyId, wireInId, dictionary, onEvent }: WireInstructionsProps) => {
  useComponentDictionary('Payroll.WireInstructions', dictionary)
  useI18n('Payroll.WireInstructions')
  const { t } = useTranslation('Payroll.WireInstructions')
  const { Button, Select, ButtonIcon, Card, Text, UnorderedList } = useComponentContext()
  const dateFormatter = useDateFormatter()
  const formatCurrency = useNumberFormatter('currency')

  const { data: wireInRequestsData } = useWireInRequestsListSuspense({
    companyUuid: companyId,
  })

  const [copiedToClipboard, setCopiedToClipboard] = useState(false)

  const wireInstructions = useMemo(() => {
    const requests = wireInRequestsData.wireInRequestList || []
    const activeRequests = requests.filter(r => r.status === 'awaiting_funds')

    if (wireInId) {
      return activeRequests.filter(r => r.uuid === wireInId)
    }

    return activeRequests
  }, [wireInRequestsData, wireInId])

  const [selectedWireId, setSelectedWireId] = useState<string | null>(
    wireInId || wireInstructions[0]?.uuid || null,
  )

  const selectedInstruction = useMemo(() => {
    const request = wireInstructions.find(
      wi => wi.uuid === (selectedWireId || wireInstructions[0]?.uuid),
    )

    if (!request) return null

    return {
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
  }, [wireInstructions, selectedWireId])

  const shouldShowDropdown = !wireInId && wireInstructions.length > 1

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

  if (wireInstructions.length === 0) {
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
        <h2 className={styles.title}>{t('title')}</h2>
        <Text className={styles.subtitle}>{t('subtitle')}</Text>
      </div>

      {shouldShowDropdown && (
        <Select
          isRequired
          label={t('selectLabel')}
          value={selectedWireId || wireInstructions[0]?.uuid || ''}
          options={wireInstructions.map(wi => ({
            label: wi.wireInDeadline
              ? dateFormatter.formatShortWithYear(wi.wireInDeadline)
              : t('selectFallback'),
            value: wi.uuid || '',
          }))}
          onChange={(selectedId: string) => {
            setSelectedWireId(selectedId)
            onEvent(payrollWireEvents.PAYROLL_WIRE_INSTRUCTIONS_SELECT, {
              selectedId,
            })
          }}
        />
      )}

      <Card className={styles.requirementsCard}>
        <div className={styles.requirementsHeader}>
          <InfoIcon aria-hidden className={styles.requirementsIcon} />
          <Text className={styles.requirementsTitle}>{t('requirementsTitle')}</Text>
        </div>
        <div className={styles.requirementsListWrapper}>
          <UnorderedList
            className={styles.requirementsList}
            items={[
              t('requirements.trackingCode'),
              t('requirements.amountMatch'),
              t('requirements.usBank'),
              t('requirements.authorized'),
            ]}
          />
        </div>
      </Card>

      <Flex flexDirection="column" gap={16}>
        <Card className={styles.requirementsCard}>
          <div className={styles.wireInstructionsContainer}>
            <Flex justifyContent="space-between" alignItems="center">
              <Text className={styles.fieldLabel}>{t('fields.trackingCode')}</Text>
              <ButtonIcon
                variant="tertiary"
                onClick={() => handleCopyToClipboard(selectedInstruction.trackingCode)}
                aria-label={t('ariaLabels.copyTrackingCode')}
                className={styles.copyButton}
              >
                <CopyIcon />
              </ButtonIcon>
            </Flex>

            <Text className={styles.fieldValue}>{selectedInstruction.trackingCode}</Text>
            {copiedToClipboard && (
              <Text className={styles.copiedMessage}>{t('messages.copied')}</Text>
            )}
          </div>

          <hr />

          <div>
            <Text className={styles.fieldLabel}>{t('fields.amount')}</Text>
            <Text className={styles.fieldValue}>{formatCurrency(selectedInstruction.amount)}</Text>
          </div>

          <hr />

          <div>
            <Text className={styles.fieldLabel}>{t('fields.bankName')}</Text>
            <Text className={styles.fieldValue}>{selectedInstruction.bankName}</Text>
          </div>

          <hr />

          <div>
            <Text className={styles.fieldLabel}>{t('fields.bankAddress')}</Text>
            <Text className={styles.fieldValue}>{selectedInstruction.bankAddress}</Text>
          </div>

          <hr />

          <div>
            <Text className={styles.fieldLabel}>{t('fields.recipientName')}</Text>
            <Text className={styles.fieldValue}>{selectedInstruction.recipientName}</Text>
          </div>

          <hr />

          <div>
            <Text className={styles.fieldLabel}>{t('fields.recipientAddress')}</Text>
            <Text className={styles.fieldValue}>{selectedInstruction.recipientAddress}</Text>
          </div>

          <hr />

          <div>
            <Text className={styles.fieldLabel}>{t('fields.accountNumber')}</Text>
            <Text className={styles.fieldValue}>{selectedInstruction.recipientAccountNumber}</Text>
          </div>

          <hr />

          <div>
            <Text className={styles.fieldLabel}>{t('fields.routingNumber')}</Text>
            <Text className={styles.fieldValue}>{selectedInstruction.recipientRoutingNumber}</Text>
          </div>
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
