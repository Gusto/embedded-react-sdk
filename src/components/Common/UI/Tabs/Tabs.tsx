import {
  Tabs as AriaTabs,
  TabList as AriaTabList,
  TabPanel as AriaTabPanel,
  Tab as AriaTab,
} from 'react-aria-components'
import classNames from 'classnames'
import { type TabsProps } from './TabsTypes'
import styles from './Tabs.module.scss'

/**
 * Controlled Tabs component that provides a simple object-based interface to React Aria Tabs
 * This allows consumers to provide tabs as an array of objects with content and events
 * Requires selectedId and onSelectionChange to be managed by parent component
 */
export function Tabs({ tabs, selectedId, onSelectionChange, className, ...ariaProps }: TabsProps) {
  return (
    <AriaTabs
      className={classNames(styles.root, className)}
      selectedKey={selectedId}
      onSelectionChange={key => {
        if (key) {
          onSelectionChange(key.toString())
        }
      }}
      {...ariaProps}
    >
      <AriaTabList>
        {tabs.map(tab => (
          <AriaTab key={tab.id} id={tab.id} isDisabled={tab.isDisabled}>
            {tab.label}
          </AriaTab>
        ))}
      </AriaTabList>

      {tabs.map(tab => (
        <AriaTabPanel key={tab.id} id={tab.id}>
          {tab.content}
        </AriaTabPanel>
      ))}
    </AriaTabs>
  )
}
