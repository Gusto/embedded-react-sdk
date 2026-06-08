import { Link as AriaLink } from 'react-aria-components'
import classNames from 'classnames'
import type { LinkProps } from './LinkTypes'
import styles from './Link.module.scss'

/**
 * Anchor element styled as a link, with accessible keyboard and focus behavior.
 *
 * @param props - Link configuration, accepting the standard anchor attributes plus content as `children`.
 * @returns The rendered anchor element.
 * @internal
 */
export function Link({ className, ...props }: LinkProps) {
  return <AriaLink className={classNames(styles.root, className)} {...props} />
}
