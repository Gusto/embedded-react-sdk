// eslint-disable-next-line no-restricted-imports
import {
  Tabs as AriaTabs,
  TabList as AriaTabList,
  Tab as AriaTab,
  TabPanel as AriaTabPanel,
  type Key,
} from 'react-aria-components'
import classNames from 'classnames'
import type { TabsProps } from '@gusto/embedded-react-sdk'
import styles from './Tabs.module.scss'

export function Tabs({
  tabs,
  selectedId,
  onSelectionChange,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  className,
}: TabsProps) {
  return (
    <AriaTabs
      selectedKey={selectedId}
      onSelectionChange={(key: Key) => {
        onSelectionChange(String(key))
      }}
      className={classNames(styles.root, className)}
    >
      <AriaTabList
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        className={styles.list}
        items={tabs}
      >
        {tab => (
          <AriaTab id={tab.id} isDisabled={tab.isDisabled} className={styles.tab}>
            <span className={styles.tabLabel}>{tab.label}</span>
          </AriaTab>
        )}
      </AriaTabList>

      {tabs.map(tab => (
        <AriaTabPanel key={tab.id} id={tab.id} className={styles.panel}>
          {tab.content}
        </AriaTabPanel>
      ))}
    </AriaTabs>
  )
}
