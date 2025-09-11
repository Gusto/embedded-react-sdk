import classNames from 'classnames'
import type { TextProps } from './TextTypes'
import styles from './Text.module.scss'

export const Text = ({
  as: Component,
  size,
  textAlign,
  weight,
  className,
  children,
  variant,
}: TextProps) => {
  // Fallback to defaults if not provided (for direct usage outside component adapter)
  const ElementType = Component || 'p'
  const textSize = size || 'md'

  return (
    <ElementType
      className={classNames(
        className,
        styles.root,
        styles[textSize],
        weight && styles[`weight-${weight}`],
        textAlign && styles[`textAlign-${textAlign}`],
        variant && styles[`variant-${variant}`],
      )}
    >
      {children}
    </ElementType>
  )
}
