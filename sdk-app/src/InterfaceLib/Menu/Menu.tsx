// eslint-disable-next-line no-restricted-imports
import { Menu as AriaMenu, MenuItem as AriaMenuItem, Popover } from 'react-aria-components'
import type { MenuProps } from '@gusto/embedded-react-sdk'
import styles from './Menu.module.scss'

export function Menu({
  triggerRef,
  items = [],
  isOpen = false,
  onClose,
  'aria-label': ariaLabel,
  portalContainer,
  placement = 'bottom start',
  ...otherProps
}: MenuProps) {
  const handleOpenChange = (open: boolean) => {
    if (!open) onClose?.()
  }

  return (
    <Popover
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      triggerRef={triggerRef}
      placement={placement}
      UNSTABLE_portalContainer={portalContainer}
      offset={8}
      shouldUpdatePosition
      className={styles.popover}
    >
      <AriaMenu onClose={onClose} aria-label={ariaLabel} className={styles.menu} {...otherProps}>
        {items.map(({ onClick, isDisabled, href, icon, label, ...itemProps }, index) => (
          <AriaMenuItem
            key={index}
            onAction={onClick}
            isDisabled={isDisabled}
            href={href}
            className={styles.item}
            {...itemProps}
          >
            {icon && <span className={styles.icon}>{icon}</span>}
            <span className={styles.label}>{label}</span>
          </AriaMenuItem>
        ))}
      </AriaMenu>
    </Popover>
  )
}
