import { useTranslation } from 'react-i18next'
import { useDocumentList } from './useDocumentList'
import styles from './ManageSignatories.module.scss'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { firstLastName } from '@/helpers/formattedStrings'
import { SIGNATORY_TITLES } from '@/shared/constants'

function isValidSignatoryTitle(
  title: string | null | undefined,
): title is keyof typeof SIGNATORY_TITLES {
  return !!title && title in SIGNATORY_TITLES
}

export function ManageSignatories() {
  const { t } = useTranslation('Company.DocumentList')
  const { isSelfSignatory, signatory, handleChangeSignatory } = useDocumentList()
  const Components = useComponentContext()

  let signatorySubtext = t('noSignatorySubtext')

  if (isSelfSignatory) {
    signatorySubtext = t('selfSignatorySubtext')
  } else if (signatory) {
    signatorySubtext = t('otherSignatorySubtext', {
      signatory: firstLastName({
        first_name: signatory.firstName,
        last_name: signatory.lastName,
      }),
      title: isValidSignatoryTitle(signatory.title)
        ? t(`signatoryTitles.${SIGNATORY_TITLES[signatory.title]}`, { ns: 'common' })
        : signatory.title,
    })
  }

  return (
    <section className={styles.container}>
      <Components.Alert
        status="warning"
        label={isSelfSignatory ? t('selfSignatoryTitle') : t('otherSignatoryTitle')}
      >
        <p>{signatorySubtext}</p>
        <Components.Button variant="secondary" onClick={handleChangeSignatory}>
          {signatory ? t('changeSignatoryCta') : t('assignSignatoryCta')}
        </Components.Button>
      </Components.Alert>
    </section>
  )
}
