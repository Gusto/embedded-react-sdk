import { VisuallyHidden } from '../VisuallyHidden'
import styles from './FieldCaption.module.scss'
import type { FieldCaptionProps } from './FieldCaptionTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

/** @internal */
export const DefaultFieldCaption = ({
  children,
  as = 'label',
  htmlFor,
  isRequired = false,
  isVisuallyHidden = false,
}: FieldCaptionProps) => {
  const Component = as

  const content = (
    <Component className={styles.root} htmlFor={as === 'label' ? htmlFor : undefined}>
      {children}
      {isRequired && (
        <span className={styles.requiredIndicator} aria-hidden="true">
          {' '}
          *
        </span>
      )}
    </Component>
  )

  return isVisuallyHidden ? <VisuallyHidden>{content}</VisuallyHidden> : content
}

/** @internal */
export const FieldCaption = (props: FieldCaptionProps) => {
  const Components = useComponentContext()

  return Components.FieldCaption ? (
    <Components.FieldCaption {...props} />
  ) : (
    <DefaultFieldCaption {...props} />
  )
}
