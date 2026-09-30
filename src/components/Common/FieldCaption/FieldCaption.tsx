import classNames from 'classnames'
import { VisuallyHidden } from '../VisuallyHidden'
import type { FieldCaptionProps } from './FieldCaptionTypes'
import styles from './FieldCaption.module.scss'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

const DefaultFieldCaption = ({
  children,
  as = 'label',
  htmlFor,
  isRequired = false,
  isVisuallyHidden = false,
  className,
}: FieldCaptionProps) => {
  const Component = as

  const content = (
    <Component
      className={classNames(styles.root, className)}
      htmlFor={as === 'label' ? htmlFor : undefined}
      data-required={isRequired || undefined}
    >
      {children}
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
