import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useWireInRequestsListSuspense } from '@gusto/embedded-api/react-query/wireInRequestsList'
import { usePayrollsListSuspense } from '@gusto/embedded-api/react-query/payrollsList'
import type { ConfirmWireDetailsContextInterface } from '../ConfirmWireDetailsComponents'
import styles from './WireInstructions.module.scss'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import type { OnEventType } from '@/components/Base/useBase'
import { Flex } from '@/components/Common/Flex/Flex'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useComponentDictionary, useI18n } from '@/i18n'
import { payrollWireEvents, type EventType } from '@/shared/constants'
import { useDateFormatter } from '@/hooks/useDateFormatter'
import useNumberFormatter from '@/hooks/useNumberFormatter'
import { useFlow } from '@/components/Flow/useFlow'

interface WireInstructionsProps extends BaseComponentInterface<'Payroll.WireInstructions'> {
  companyId: string
  wireInId?: string
  selectedWireInId?: string
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

function useWireInstructionsState(companyId: string, selectedWireInId?: string) {
  const { data: wireInRequestsData } = useWireInRequestsListSuspense({
    companyUuid: companyId,
  })

  const { data: payrollsData } = usePayrollsListSuspense({
    companyId,
    processed: true,
  })

  const activeWireInRequests = (wireInRequestsData.wireInRequestList || []).filter(
    r => r.status === 'awaiting_funds',
  )

  const wireInInformation = activeWireInRequests.find(r => r.uuid === selectedWireInId)

  const payrolls = payrollsData.payrollList || []

  const activeWireInRequestsWithPayrolls = useMemo(
    () =>
      activeWireInRequests.map(wireInRequest => {
        const payroll = payrolls.find(p => p.payrollUuid === wireInRequest.paymentUuid)
        return {
          wireInRequest,
          payroll,
          paymentType: wireInRequest.paymentType,
          requestedAmount: wireInRequest.requestedAmount ?? '',
        }
      }),
    [activeWireInRequests, payrolls],
  )

  const selectedInstruction = useMemo(() => {
    if (!wireInInformation) return null

    const instruction = {
      id: wireInInformation.uuid || '',
      trackingCode: wireInInformation.uniqueTrackingCode || '',
      amount: parseFloat(wireInInformation.requestedAmount || '0'),
      bankName: wireInInformation.originationBank || '',
      bankAddress: wireInInformation.originationBankAddress || '',
      recipientName: wireInInformation.recipientName || '',
      recipientAddress: wireInInformation.recipientAddress || '',
      recipientAccountNumber: wireInInformation.recipientAccountNumber || '',
      recipientRoutingNumber: wireInInformation.recipientRoutingNumber || '',
    }
    return instruction
  }, [wireInInformation])

  return {
    selectedInstruction,
    activeWireInRequestsWithPayrolls,
  }
}

function WireInstructionField({ label, value }: WireInstructionFieldProps) {
  const { Text } = useComponentContext()

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
  selectedWireInId,
  dictionary,
  onEvent,
  modalContainerRef,
}: WireInstructionsProps) => {
  useComponentDictionary('Payroll.WireInstructions', dictionary)
  useI18n('Payroll.WireInstructions')
  const { t } = useTranslation('Payroll.WireInstructions')
  const { Select, Card, Text, UnorderedList, Heading, Alert } = useComponentContext()
  const dateFormatter = useDateFormatter()
  const formatCurrency = useNumberFormatter('currency')

  const { selectedInstruction, activeWireInRequestsWithPayrolls } = useWireInstructionsState(
    companyId,
    selectedWireInId,
  )

  const shouldShowDropdown = !wireInId && activeWireInRequestsWithPayrolls.length > 1

  const handleWireInSelection = (updatedSelectedWireInId: string) => {
    onEvent(payrollWireEvents.PAYROLL_WIRE_INSTRUCTIONS_SELECT, {
      selectedWireInId: updatedSelectedWireInId,
    })
  }

  if (activeWireInRequestsWithPayrolls.length === 0 || (selectedWireInId && !selectedInstruction)) {
    return (
      <Flex flexDirection="column" gap={24}>
        <Text>{t('messages.noInstructions')}</Text>
      </Flex>
    )
  }

  return (
    <Flex flexDirection="column" gap={24}>
      <div>
        <Heading as="h2" styledAs="h3">
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
          options={activeWireInRequestsWithPayrolls.map(
            ({ wireInRequest, payroll, paymentType, requestedAmount }) => {
              const payrollRange = payroll?.payPeriod
                ? dateFormatter.formatPayPeriodRange(
                    payroll.payPeriod.startDate,
                    payroll.payPeriod.endDate,
                  )
                : ''

              return {
                label:
                  paymentType === 'Payroll' && payrollRange
                    ? t('selectLabelPayroll', { payrollRange })
                    : t('selectFallback'),
                value: wireInRequest.uuid || '',
              }
            },
          )}
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
      {selectedInstruction && (
        <Flex flexDirection="column" gap={16}>
          <Card className={styles.requirementsCard}>
            <WireInstructionField
              label={t('fields.trackingCode')}
              value={selectedInstruction.trackingCode}
            />

            <hr />

            <WireInstructionField
              label={t('fields.amount')}
              value={formatCurrency(selectedInstruction.amount)}
            />

            <hr />

            <WireInstructionField
              label={t('fields.bankName')}
              value={selectedInstruction.bankName}
            />

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
      )}
    </Flex>
  )
}

const Footer = ({ onEvent }: { onEvent: OnEventType<EventType, unknown> }) => {
  useI18n('Payroll.WireInstructions')
  const { t } = useTranslation('Payroll.WireInstructions')
  const { Button } = useComponentContext()
  const { companyId, selectedWireInId } = useFlow<ConfirmWireDetailsContextInterface>()
  const { selectedInstruction } = useWireInstructionsState(companyId, selectedWireInId)

  const handleConfirm = () => {
    onEvent(payrollWireEvents.PAYROLL_WIRE_INSTRUCTIONS_DONE, {
      selectedWireInId,
    })
  }

  return (
    <div className={styles.footer}>
      <Button
        variant="secondary"
        onClick={() => {
          onEvent(payrollWireEvents.PAYROLL_WIRE_INSTRUCTIONS_CANCEL)
        }}
      >
        {t('cta.close')}
      </Button>
      <Button variant="primary" onClick={handleConfirm} isDisabled={!selectedInstruction}>
        {t('cta.confirm')}
      </Button>
    </div>
  )
}

WireInstructions.Footer = Footer
