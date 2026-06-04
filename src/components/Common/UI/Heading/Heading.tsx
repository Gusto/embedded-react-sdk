import classNames from 'classnames'
import type { HeadingProps } from './HeadingTypes'
import styles from './Heading.module.scss'

/**
 * Semantic heading element (h1–h6) with optional independent visual styling.
 *
 * @remarks
 * The `as` prop chooses the semantic heading level for accessibility and document
 * outline; the optional `styledAs` prop applies a different visual size without
 * changing the rendered tag. Use this when you need an h2 for document structure
 * but want it to look like an h1, for example.
 *
 * @param props - Heading configuration including the semantic level, optional visual styling, alignment, and content.
 * @returns The rendered heading element.
 * @internal
 */
export const Heading = ({
  as: Component,
  styledAs,
  textAlign,
  className,
  children,
  id,
}: HeadingProps) => {
  const levelStyles = styledAs ?? Component

  return (
    <Component
      id={id}
      className={classNames(
        className,
        styles.root,
        styles[levelStyles as string],
        styles[`textAlign-${textAlign}`],
      )}
    >
      {children}
    </Component>
  )
}
