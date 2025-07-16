import { useTranslation } from 'react-i18next'
import styles from './index.module.scss'
import { Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'

interface ContractorSubmitProps {
  onSubmit: () => void
}

export const ContractorSubmit = ({ onSubmit }: ContractorSubmitProps) => {
  useI18n('Contractor.ContractorSubmit')
  const { Alert, Button, UnorderedList } = useComponentContext()
  const { t } = useTranslation('Contractor.ContractorSubmit')
  const items = Object.values(t('warningItems', { returnObjects: true }))

  return (
    <>
      <Alert label={t('title')} status="warning" className={styles.alert}>
        <UnorderedList items={items} />
      </Alert>
      <Flex flexDirection="column" alignItems="flex-end">
        <Button title={t('submitCTA')} onClick={onSubmit}>
          {t('submitCTA')}
        </Button>
      </Flex>
    </>
  )
}
