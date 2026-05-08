import { useDesignSystem, type DesignSystem } from './DesignSystemContext'
import styles from './DesignSystemSwitcher.module.scss'

interface DesignSystemOption {
  id: DesignSystem
  label: string
  logo: string
  available: boolean
}

const OPTIONS: DesignSystemOption[] = [
  { id: 'default', label: 'Gusto Default', logo: '🎨', available: true },
  { id: 'native', label: 'Native HTML', logo: '🌐', available: true },
]

export function DesignSystemSwitcher() {
  const { designSystem, setDesignSystem } = useDesignSystem()

  return (
    <div className={styles.root}>
      <div className={styles.options}>
        {OPTIONS.map(option => (
          <button
            key={option.id}
            type="button"
            className={`${styles.option} ${designSystem === option.id ? styles.active : ''} ${!option.available ? styles.unavailable : ''}`}
            onClick={() => {
              if (option.available) setDesignSystem(option.id)
            }}
            title={option.available ? option.label : `${option.label} (coming soon)`}
            disabled={!option.available}
          >
            <span className={styles.optionLogo}>{option.logo}</span>
            <span className={styles.optionLabel}>{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
