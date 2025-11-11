import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useWireInRequestsGetSuspense } from '@gusto/embedded-api/react-query/wireInRequestsGet'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useComponentDictionary, useI18n } from '@/i18n'
import { formatDateWithTime } from '@/helpers/dateFormatting'
import { Flex } from '@/components/Common/Flex/Flex'

interface ConfirmWireDetailsProps extends BaseComponentInterface<'Payroll.ConfirmWireDetails'> {
  wireInId: string
  companyId: string
}

export function ConfirmWireDetails(props: ConfirmWireDetailsProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const Root = ({ wireInId, companyId, dictionary }: ConfirmWireDetailsProps) => {
  useComponentDictionary('Payroll.ConfirmWireDetails', dictionary)
  useI18n('Payroll.ConfirmWireDetails')
  const { t } = useTranslation('Payroll.ConfirmWireDetails')
  const { Banner, Button, Modal } = useComponentContext()

  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: wireInRequestData } = useWireInRequestsGetSuspense({
    wireInRequestUuid: wireInId,
  })

  const wireInRequest = wireInRequestData.wireInRequest

  const deadlineFormatted = wireInRequest?.wireInDeadline
    ? formatDateWithTime(wireInRequest.wireInDeadline)
    : { time: '', date: '' }

  const formattedDeadline =
    deadlineFormatted.time && deadlineFormatted.date
      ? `${deadlineFormatted.time} on ${deadlineFormatted.date}`
      : ''

  const handleStartWireTransfer = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  return (
    <>
      <Banner status="warning" title={t('banner.title', { deadline: formattedDeadline })}>
        <Flex flexDirection="column" gap={16} alignItems="flex-start">
          <div>{t('banner.description')}</div>
          <Button onClick={handleStartWireTransfer}>{t('cta.startWireTransfer')}</Button>
        </Flex>
      </Banner>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        {/* TODO: Implement wire instructions content (follow-up ticket) */}
        <h2>{t('modal.title')}</h2>
        <p>Wire instructions content will be implemented in a follow-up ticket</p>
      </Modal>
    </>
  )
}
