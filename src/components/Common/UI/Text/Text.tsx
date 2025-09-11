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
  // Component adapter system guarantees these props are provided
  const ElementType = Component as NonNullable<typeof Component>
  const textSize = size as NonNullable<typeof size>

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
