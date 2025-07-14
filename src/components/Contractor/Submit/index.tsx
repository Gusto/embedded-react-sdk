import { useTranslation } from 'react-i18next'
import { Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import WarningIcon from '@/assets/icons/warning.svg?react'
import { useI18n } from '@/i18n'

interface ContractorSubmitProps {
  onSubmit: () => void
}

export function ContractorSubmit({ onSubmit }: ContractorSubmitProps) {
  useI18n('Contractor.ContractorSubmit')
  const { Button, Heading, UnorderedList } = useComponentContext()
  const { t } = useTranslation('Contractor.ContractorSubmit')
  const items = Object.values(t('warningItems', { returnObjects: true }))

  return (
    <Flex flexDirection="column">
      <Flex alignItems="flex-start">
        <WarningIcon />
        <Flex flexDirection="column">
          <Heading as="h4">{t('title')}</Heading>
          <UnorderedList items={items} />
        </Flex>
      </Flex>
      <Flex flexDirection="column" alignItems="flex-end">
        <Button title={t('submitCTA')} onClick={onSubmit}>
          {t('submitCTA')}
        </Button>
      </Flex>
    </Flex>
  )
}
