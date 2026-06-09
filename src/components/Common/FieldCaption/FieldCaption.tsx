import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import { VisuallyHidden } from '../VisuallyHidden'
import styles from './FieldCaption.module.scss'

/** @internal */
export interface FieldCaptionProps {
  /** Caption content rendered inside the label or legend element. */
  children: React.ReactNode
  /** HTML element to render as — `label` for individual inputs, `legend` for fieldsets. */
  as?: 'label' | 'legend'
  /** Associates a `label` with an input by id. Ignored when `as` is `legend`. */
  htmlFor?: string
  /** When false, appends a localized optional indicator after the caption. */
  isRequired?: boolean
  /** Visually hides the caption while keeping it available to assistive technology. */
  isVisuallyHidden?: boolean
  /** Additional class names appended to the root element. */
  className?: string
}

/** @internal */
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
      {!isRequired && <span className={styles.optionalLabel}> {t('optionalLabel')}</span>}
    </Component>
  )

  return isVisuallyHidden ? <VisuallyHidden>{content}</VisuallyHidden> : content
}
