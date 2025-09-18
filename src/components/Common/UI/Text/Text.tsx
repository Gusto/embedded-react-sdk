import classNames from 'classnames'
import type { TextProps } from './TextTypes'
import { TextDefaults } from './TextTypes'
import styles from './Text.module.scss'
import { applyMissingDefaults } from '@/helpers/applyMissingDefaults'

export const Text = (rawProps: TextProps) => {
  const resolvedProps = applyMissingDefaults(rawProps, TextDefaults)
  const { as: Component, size, textAlign, weight, className, children, variant } = resolvedProps
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
