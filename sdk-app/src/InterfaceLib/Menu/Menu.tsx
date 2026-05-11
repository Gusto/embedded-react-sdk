// eslint-disable-next-line no-restricted-imports
import { Menu as AriaMenu, MenuItem as AriaMenuItem, Popover } from 'react-aria-components'
import type { MenuProps } from '@gusto/embedded-react-sdk'
import styles from './Menu.module.scss'

export function Menu({
  triggerRef,
  items,
  isOpen = false,
  onClose,
  placement = 'bottom end',
  portalContainer,
  'aria-label': ariaLabel,
}: MenuProps) {
  return (
    <Popover
      UNSTABLE_portalContainer={portalContainer}
      onOpenChange={open => {
        if (!open) onClose?.()
      }}
      isOpen={isOpen}
      triggerRef={triggerRef}
      placement={placement}
      offset={4}
      shouldUpdatePosition={true}
      className={styles.popover}
    >
      <AriaMenu onClose={onClose} aria-label={ariaLabel} className={styles.root}>
        {items?.map(({ onClick, isDisabled, href, icon, label }, index) => (
          <AriaMenuItem
            key={index}
            onAction={() => {
              onClick()
            }}
            isDisabled={isDisabled}
            href={href}
            className={styles.menuItem}
          >
            {icon && <div className={styles.menuIcon}>{icon}</div>}
            {label}
          </AriaMenuItem>
        ))}
      </AriaMenu>
    </Popover>
  )
}
