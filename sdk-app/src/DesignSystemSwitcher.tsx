import { useDesignSystem, type DesignSystem } from './DesignSystemContext'
import styles from './DesignSystemSwitcher.module.scss'

interface DesignSystemOption {
  id: DesignSystem
  label: string
  logo: string
}

const OPTIONS: DesignSystemOption[] = [
  {
    id: 'default',
    label: 'Gusto Default',
    logo: '🎨',
  },
  {
    id: 'material',
    label: 'Material UI',
    logo: 'G',
  },
  {
    id: 'polaris',
    label: 'Polaris',
    logo: '🛍',
  },
]

export function DesignSystemSwitcher() {
  const { designSystem, setDesignSystem } = useDesignSystem()

  return (
    <div className={styles.root}>
      <span className={styles.label}>Design System</span>
      <div className={styles.options}>
        {OPTIONS.map(option => (
          <button
            key={option.id}
            type="button"
            className={`${styles.option} ${designSystem === option.id ? styles.active : ''}`}
            onClick={() => {
              setDesignSystem(option.id)
            }}
            title={option.label}
          >
            <span className={styles.optionLogo}>{option.logo}</span>
            <span className={styles.optionLabel}>{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
