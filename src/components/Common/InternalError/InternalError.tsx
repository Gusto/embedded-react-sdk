import { FallbackProps } from 'react-error-boundary'
import { Trans, useTranslation } from 'react-i18next'
import { Button } from '../Button/Button'
import styles from './InternalError.module.scss'

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
    <div className={styles.internalErrorCard} role="alert">
      <div>
        <h1 className={styles.internalErrorCardTitle}>{t('errors.errorHeading')}</h1>
        <p className={styles.errorMessage}>
          <Trans
            t={t}
            i18nKey="errors.globalReactError"
            values={{ error: errorMessage }}
            shouldUnescape={true}
          />
        </p>
      </div>
      <div>
        <Button onPress={resetErrorBoundary} variant="secondary">
          {t('errors.resetGlobalError')}
        </Button>
      </div>
    </div>
  )
}
