import { useTranslation } from 'react-i18next'

export function Head() {
  // @ts-expect-error HACK missing translations
  const { t } = useTranslation('Company.DocumentSigner')

  return <h2>{t('documentListTitle')}</h2>
}
