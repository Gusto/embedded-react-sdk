import classNames from 'classnames'
import type { TextProps } from './TextTypes'
import { TextDefaults } from './TextTypes'
import styles from './Text.module.scss'

export const Text = (props: TextProps) => {
  const {
    as: Component,
    size,
    textAlign,
    weight,
    className,
    children,
    variant,
  } = {
    ...TextDefaults,
    ...props,
  }
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
