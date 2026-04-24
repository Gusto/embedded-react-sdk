import { useAdapterModeContext } from './useAdapterModeContext'
import { ADAPTER_OPTIONS } from './design/component-adapters/types'
import styles from './AdapterSwitcher.module.scss'

export function AdapterSwitcher() {
  const { adapter, setAdapter } = useAdapterModeContext()

  return (
    <div className={styles.root}>
      {ADAPTER_OPTIONS.map(({ label, key }) => (
        <button
          key={key}
          type="button"
          className={`${styles.option} ${adapter === key ? styles.active : ''}`}
          onClick={() => {
            setAdapter(key)
          }}
          title={`${label} adapter`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
