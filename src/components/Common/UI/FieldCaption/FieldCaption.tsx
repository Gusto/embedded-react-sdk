import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import { VisuallyHidden } from '../../VisuallyHidden'
import styles from './FieldCaption.module.scss'

export interface FieldCaptionProps {
  children: React.ReactNode
  as?: 'label' | 'legend'
  htmlFor?: string
  isRequired?: boolean
  isVisuallyHidden?: boolean
  className?: string
}

export const FieldCaption: React.FC<FieldCaptionProps> = ({
  children,
  as = 'label',
  htmlFor,
  isRequired = false,
  isVisuallyHidden = false,
  className,
}: FieldCaptionProps) => {
  const { t } = useTranslation('common')
  const Component = as

  const content = (
    <Component
      className={classNames(styles.root, className)}
      htmlFor={as === 'label' ? htmlFor : undefined}
    >
      {children}
      {!isRequired && <span className={styles.optionalLabel}>{t('optionalLabel')}</span>}
    </Component>
  )

  return isVisuallyHidden ? <VisuallyHidden>{content}</VisuallyHidden> : content
}
