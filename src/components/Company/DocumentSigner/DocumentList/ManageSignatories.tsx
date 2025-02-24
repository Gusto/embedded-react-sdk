import { useTranslation } from 'react-i18next'
import { Alert, Button } from '@/components/Common'
import { firstLastName } from '@/helpers/formattedStrings'
import { SIGNATORY_TITLES } from '@/shared/constants'

import { useDocumentList } from './DocumentList'
import styles from './ManageSignatories.module.scss'

function isValidSignatoryTitle(
  title: string | null | undefined,
): title is keyof typeof SIGNATORY_TITLES {
  return !!title && title in SIGNATORY_TITLES
}

function ManageSignatories() {
  const { t } = useTranslation('Company.DocumentList')
  const { isSelfSignatory, signatory, handleChangeSignatory } = useDocumentList()

  let signatorySubtext = t('noSignatorySubtext')

  if (isSelfSignatory) {
    signatorySubtext = t('selfSignatorySubtext')
  } else if (signatory) {
    signatorySubtext = t('otherSignatorySubtext', {
      signatory: firstLastName({
        first_name: signatory.first_name,
        last_name: signatory.last_name,
      }),
      title: isValidSignatoryTitle(signatory.title)
        ? t(`signatoryTitles.${SIGNATORY_TITLES[signatory.title]}`, { ns: 'common' })
        : signatory.title,
    })
  }

  return (
    <section className={styles.container}>
      <Alert
        variant="warning"
        label={isSelfSignatory ? t('selfSignatoryTitle') : t('otherSignatoryTitle')}
      >
        <p>{signatorySubtext}</p>
        <Button variant="secondary" onPress={handleChangeSignatory}>
          {signatory ? t('changeSignatoryCta') : t('assignSignatoryCta')}
        </Button>
      </Alert>
    </section>
  )
}

export { ManageSignatories }
