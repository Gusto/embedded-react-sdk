import { ThemeEditor } from './ThemeEditor'
import { DesignSystemSwitcher } from './DesignSystemSwitcher'
import styles from './ThemePanel.module.scss'

interface ThemePanelProps {
  onClose: () => void
}

export function ThemePanel({ onClose }: ThemePanelProps) {
  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h2>Theme &amp; Appearance</h2>
        <button
          className={styles.close}
          onClick={onClose}
          type="button"
          aria-label="Close theme panel"
        >
          &times;
        </button>
      </div>
      <div className={styles.body}>
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Component Adapter</h3>
          <DesignSystemSwitcher />
        </section>
        <section className={styles.tokenSection}>
          <ThemeEditor />
        </section>
      </div>
    </div>
  )
}
