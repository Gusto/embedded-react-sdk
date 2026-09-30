import { useLanguageModeContext } from './LanguageModeContext'
import type { LanguageMode } from './useLanguageMode'
import styles from './LanguageSwitcher.module.scss'

const options: { lng: LanguageMode; label: string; title: string }[] = [
  { lng: 'en', label: 'EN', title: 'English' },
  { lng: 'es_US', label: 'ES', title: 'Español (US)' },
]

export function LanguageSwitcher() {
  const { lng, setLng } = useLanguageModeContext()

  return (
    <div className={styles.root}>
      {options.map(({ lng: optionLng, label, title }) => (
        <button
          key={optionLng}
          type="button"
          className={`${styles.option} ${lng === optionLng ? styles.active : ''}`}
          onClick={() => {
            setLng(optionLng)
          }}
          title={title}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
