import { useTranslation } from 'react-i18next'
import styles from './InlineSpinner.module.scss'
import SpinnerIcon from '@/assets/icons/spinner_small.svg?react'

interface InlineSpinnerProps {
  ariaLabel?: string
  size?: 'small' | 'medium' | 'large'
}

export const InlineSpinner = ({ ariaLabel, size = 'small' }: InlineSpinnerProps) => {
  const { t } = useTranslation('common')
  const defaultAriaLabel = t('status.loading')

  const sizeMap = {
    small: 16,
    medium: 20,
    large: 24,
  }

  const iconSize = sizeMap[size]

  return (
    <span
      className={styles.inlineSpinner}
      aria-label={ariaLabel || defaultAriaLabel}
      aria-live="polite"
      role="status"
    >
      <SpinnerIcon className={styles.spinnerIcon} width={iconSize} height={iconSize} />
    </span>
  )
}
