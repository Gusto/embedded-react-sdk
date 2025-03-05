import { FallbackProps } from 'react-error-boundary'
import { Trans, useTranslation } from 'react-i18next'
import { Button } from '../Button/Button'

export const InternalError = ({ error, resetErrorBoundary }: FallbackProps) => {
  //TODO: Need to integrate useQueryErrorResetBoundary from tanstac to reset query cach on "try again" - GWS-3926
  const { t } = useTranslation('common')
  const errorMessage =
    typeof error === 'string'
      ? error
      : error instanceof Error
        ? error.message
        : t('errors.unknownError')

  return (
    <section role="alert">
      <Trans
        t={t}
        i18nKey="errors.globalReactError"
        values={{ error: errorMessage }}
        shouldUnescape={true}
      />
      <Button onPress={resetErrorBoundary}>{t('errors.resetGlobalError')}</Button>
    </section>
  )
}
