import { useThemeEditor } from './ThemeEditorContext'
import styles from './ThemeEditor.module.scss'
import type { GustoSDKTheme } from '@/contexts/ThemeProvider/theme'

interface TokenGroup {
  label: string
  tokens: (keyof GustoSDKTheme)[]
}

const TOKEN_GROUPS: TokenGroup[] = [
  {
    label: 'Body',
    tokens: ['colorBody', 'colorBodyAccent', 'colorBodyContent', 'colorBodySubContent'],
  },
  {
    label: 'Primary',
    tokens: ['colorPrimary', 'colorPrimaryAccent', 'colorPrimaryContent'],
  },
  {
    label: 'Secondary',
    tokens: ['colorSecondary', 'colorSecondaryAccent', 'colorSecondaryContent'],
  },
  {
    label: 'Status',
    tokens: [
      'colorInfo',
      'colorInfoAccent',
      'colorInfoContent',
      'colorWarning',
      'colorWarningAccent',
      'colorWarningContent',
      'colorError',
      'colorErrorAccent',
      'colorErrorContent',
      'colorSuccess',
      'colorSuccessAccent',
      'colorSuccessContent',
    ],
  },
  {
    label: 'Borders & Icons',
    tokens: ['colorBorderPrimary', 'colorBorderSecondary', 'colorButtonIcon'],
  },
]

function tokenLabel(token: keyof GustoSDKTheme): string {
  return (token as string)
    .replace(/^color/, '')
    .replace(/([A-Z])/g, ' $1')
    .trim()
}

interface ColorSwatchProps {
  token: keyof GustoSDKTheme
}

function ColorSwatch({ token }: ColorSwatchProps) {
  const { themeOverrides, setThemeOverride } = useThemeEditor()
  const value = (themeOverrides[token] as string | undefined) ?? ''

  return (
    <div className={styles.token}>
      <div className={styles.tokenPreview}>
        <div
          className={styles.colorSwatch}
          style={{
            backgroundColor: value || 'transparent',
            border: value ? 'none' : '1px dashed currentColor',
          }}
        />
      </div>
      <label className={styles.tokenLabel} htmlFor={`theme-${token}`}>
        {tokenLabel(token)}
      </label>
      <input
        id={`theme-${token}`}
        className={styles.colorInput}
        type="text"
        value={value}
        placeholder="e.g. red, #1a73e8"
        onChange={e => {
          setThemeOverride(token, e.target.value)
        }}
        spellCheck={false}
      />
    </div>
  )
}

export function ThemeEditor() {
  const { clearThemeOverrides, themeOverrides } = useThemeEditor()
  const hasOverrides = Object.keys(themeOverrides).length > 0

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <span className={styles.title}>Theme Editor</span>
        {hasOverrides && (
          <button className={styles.clearBtn} onClick={clearThemeOverrides} type="button">
            Reset
          </button>
        )}
      </div>
      <div className={styles.groups}>
        {TOKEN_GROUPS.map(group => (
          <div key={group.label} className={styles.group}>
            <div className={styles.groupLabel}>{group.label}</div>
            {group.tokens.map(token => (
              <ColorSwatch key={token} token={token} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
