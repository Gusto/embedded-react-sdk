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
  /**
   * Nests the caption content in a heading element of this level, in addition to the
   * `label`/`legend` element from `as`. Lets the caption double as a real page-heading
   * (discoverable via heading-based screen reader navigation) while `as="legend"` still
   * gives its `fieldset` a native accessible name — an `h1`–`h6` nested in a `legend` is
   * valid per the HTML spec and exposed as both to assistive technology.
   */
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

/** @internal */
export const FieldCaption: React.FC<FieldCaptionProps> = ({
  children,
  as = 'label',
  htmlFor,
  isRequired = false,
  isVisuallyHidden = false,
  className,
  headingLevel,
}: FieldCaptionProps) => {
  const { t } = useTranslation('common')
  const Component = as
  const HeadingTag = headingLevel

  const caption = HeadingTag ? (
    <HeadingTag className={classNames(styles.heading, styles[HeadingTag])}>{children}</HeadingTag>
  ) : (
    children
  )

  const content = (
    <Component
      className={classNames(styles.root, className)}
      htmlFor={as === 'label' ? htmlFor : undefined}
    >
      {caption}
      {!isRequired && <span className={styles.optionalLabel}> {t('optionalLabel')}</span>}
    </Component>
  )

  return isVisuallyHidden ? <VisuallyHidden>{content}</VisuallyHidden> : content
}
