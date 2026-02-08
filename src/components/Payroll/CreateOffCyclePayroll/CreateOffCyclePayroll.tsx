import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { Flex } from '@/components/Common/Flex'
import { ActionsLayout } from '@/components/Common/ActionsLayout'

const I18N_NAMESPACE = 'Payroll.OffCycle'

interface CreateOffCyclePayrollProps extends BaseComponentInterface<'Payroll.OffCycle'> {
  companyId: string
}

export function CreateOffCyclePayroll(props: CreateOffCyclePayrollProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

function Root({ onEvent }: CreateOffCyclePayrollProps) {
  const Components = useComponentContext()
  const [isModalOpen, setIsModalOpen] = useState(false)
  useI18n(I18N_NAMESPACE)
  const { t } = useTranslation(I18N_NAMESPACE)

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }
  const handleCloseModal = () => {
    setIsModalOpen(false)
  }
  const handleConfirm = () => {
    setIsModalOpen(false)
    onEvent(componentEvents.OFF_CYCLE_CREATED, {})
  }

  return (
    <>
      <Flex flexDirection="column" gap={24}>
        <Components.Heading as="h2">{t('createOffCyclePayroll.title')}</Components.Heading>
        <Components.Text variant="supporting">
          {t('createOffCyclePayroll.description')}
        </Components.Text>

        <Components.Button variant="primary" onClick={handleOpenModal}>
          {t('createOffCyclePayroll.continueButton')}
        </Components.Button>
      </Flex>

      <Components.Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        footer={
          <ActionsLayout>
            <Components.Button variant="secondary" onClick={handleCloseModal}>
              {t('taxWithholdingModal.cancelButton')}
            </Components.Button>
            <Components.Button variant="primary" onClick={handleConfirm}>
              {t('taxWithholdingModal.doneButton')}
            </Components.Button>
          </ActionsLayout>
        }
      >
        <Flex flexDirection="column" gap={24}>
          <Components.Heading as="h2" styledAs="h3">
            {t('taxWithholdingModal.title')}
          </Components.Heading>

          <Flex flexDirection="column" gap={8}>
            <Components.Heading as="h3" styledAs="h4">
              {t('taxWithholdingModal.regularWages.title')}
            </Components.Heading>
            <Components.Text variant="supporting">
              {t('taxWithholdingModal.regularWages.description')}
            </Components.Text>
            <Components.Text variant="supporting">
              {t('taxWithholdingModal.regularWages.paySchedulePlaceholder')}
            </Components.Text>
          </Flex>

          <Flex flexDirection="column" gap={8}>
            <Components.Heading as="h3" styledAs="h4">
              {t('taxWithholdingModal.supplementalWages.title')}
            </Components.Heading>
            <Components.Text variant="supporting">
              {t('taxWithholdingModal.supplementalWages.ratePlaceholder')}
            </Components.Text>
          </Flex>
        </Flex>
      </Components.Modal>
    </>
  )
}
