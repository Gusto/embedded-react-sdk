import { useTranslation } from 'react-i18next'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { Flex } from '@/components/Common/Flex'

interface SubmitDoneProps {
  onDone: () => void
}

export const SubmitDone = ({ onDone }: SubmitDoneProps) => {
  useI18n('Contractor.ContractorSubmit')
  const { Button, Heading, Text } = useComponentContext()
  const { t } = useTranslation('Contractor.ContractorSubmit')

  return (
    <Flex flexDirection="column" alignItems="center">
      <Heading as="h2">{t('doneTitle')}</Heading>
      <Text>{t('doneText')}</Text>
      <Button variant="secondary" onClick={onDone}>
        {t('doneCTA')}
      </Button>
    </Flex>
  )
}
