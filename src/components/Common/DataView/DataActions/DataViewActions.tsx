import type { DataViewAction } from '../useDataView'
import styles from './DataViewActions.module.scss'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

type DataViewActionsProps = {
  actions: DataViewAction[]
  orientation: 'row' | 'column'
}

export const DataViewActions = ({ actions, orientation }: DataViewActionsProps) => {
  const Components = useComponentContext()

  if (actions.length === 0) {
    return null
  }

  const containerClass = orientation === 'row' ? styles.actionsRow : styles.actionsColumn

  return (
    <div className={containerClass}>
      {actions.map((action, index) => {
        if (action.type === 'button') {
          const { label, onClick, buttonProps } = action
          return (
            <Components.Button key={`action-button-${index}`} onClick={onClick} {...buttonProps}>
              {label}
            </Components.Button>
          )
        }

        const { items, ...menuProps } = action
        return <HamburgerMenu key={`action-menu-${index}`} items={items} {...menuProps} />
      })}
    </div>
  )
}
