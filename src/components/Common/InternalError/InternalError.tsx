import { FallbackProps } from 'react-error-boundary'
import { Trans, useTranslation } from 'react-i18next'

export const InternalError = ({ error }: FallbackProps) => {
  const errorMessage =
    typeof error === 'string' ? error : error instanceof Error ? error.message : 'unknown error'

  const { t } = useTranslation('common')
  return (
    <section role="alert">
      <Trans t={t} i18nKey="errors.globalReactError" values={{ error: errorMessage }} shouldUnescape={true} />
    </section>
  )
}
