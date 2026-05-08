import { useState } from 'react'
import { useThemeEditor } from './ThemeEditorContext'
import styles from './ThemeEditor.module.scss'
import type { GustoSDKTheme } from '@/contexts/ThemeProvider/theme'

interface TokenDef {
  key: keyof GustoSDKTheme
  isColor?: boolean
}

interface TokenGroup {
  label: string
  tokens: TokenDef[]
  defaultOpen?: boolean
}

const TOKEN_GROUPS: TokenGroup[] = [
  {
    label: 'Body',
    defaultOpen: true,
    tokens: [
      { key: 'colorBody', isColor: true },
      { key: 'colorBodyAccent', isColor: true },
      { key: 'colorBodyContent', isColor: true },
      { key: 'colorBodySubContent', isColor: true },
    ],
  },
  {
    label: 'Primary',
    defaultOpen: true,
    tokens: [
      { key: 'colorPrimary', isColor: true },
      { key: 'colorPrimaryAccent', isColor: true },
      { key: 'colorPrimaryContent', isColor: true },
    ],
  },
  {
    label: 'Secondary',
    defaultOpen: true,
    tokens: [
      { key: 'colorSecondary', isColor: true },
      { key: 'colorSecondaryAccent', isColor: true },
      { key: 'colorSecondaryContent', isColor: true },
    ],
  },
  {
    label: 'Status',
    defaultOpen: false,
    tokens: [
      { key: 'colorInfo', isColor: true },
      { key: 'colorInfoAccent', isColor: true },
      { key: 'colorInfoContent', isColor: true },
      { key: 'colorWarning', isColor: true },
      { key: 'colorWarningAccent', isColor: true },
      { key: 'colorWarningContent', isColor: true },
      { key: 'colorError', isColor: true },
      { key: 'colorErrorAccent', isColor: true },
      { key: 'colorErrorContent', isColor: true },
      { key: 'colorSuccess', isColor: true },
      { key: 'colorSuccessAccent', isColor: true },
      { key: 'colorSuccessContent', isColor: true },
    ],
  },
  {
    label: 'Borders & Icons',
    defaultOpen: false,
    tokens: [
      { key: 'colorBorderPrimary', isColor: true },
      { key: 'colorBorderSecondary', isColor: true },
      { key: 'colorButtonIcon', isColor: true },
    ],
  },
  {
    label: 'Input Colors',
    defaultOpen: false,
    tokens: [
      { key: 'inputBackgroundColor', isColor: true },
      { key: 'inputBorderColor', isColor: true },
      { key: 'inputContentColor', isColor: true },
      { key: 'inputPlaceholderColor', isColor: true },
      { key: 'inputAdornmentColor', isColor: true },
      { key: 'inputDisabledBackgroundColor', isColor: true },
      { key: 'inputLabelColor', isColor: true },
      { key: 'inputDescriptionColor', isColor: true },
      { key: 'inputErrorColor', isColor: true },
    ],
  },
  {
    label: 'Input Dimensions',
    defaultOpen: false,
    tokens: [
      { key: 'inputBorderWidth' },
      { key: 'inputRadius' },
      { key: 'inputLabelFontSize' },
      { key: 'inputLabelFontWeight' },
    ],
  },
  {
    label: 'Radius',
    defaultOpen: false,
    tokens: [
      { key: 'buttonRadius' },
      { key: 'cardRadius' },
      { key: 'badgeRadius' },
      { key: 'bannerRadius' },
      { key: 'boxRadius' },
    ],
  },
  {
    label: 'Typography',
    defaultOpen: false,
    tokens: [
      { key: 'fontFamily' },
      { key: 'fontSizeRoot' },
      { key: 'fontSizeExtraSmall' },
      { key: 'fontSizeSmall' },
      { key: 'fontSizeRegular' },
      { key: 'fontSizeLarge' },
      { key: 'fontSizeHeading1' },
      { key: 'fontSizeHeading2' },
      { key: 'fontSizeHeading3' },
      { key: 'fontSizeHeading4' },
      { key: 'fontSizeHeading5' },
      { key: 'fontSizeHeading6' },
      { key: 'fontWeightRegular' },
      { key: 'fontWeightMedium' },
      { key: 'fontWeightSemibold' },
      { key: 'fontWeightBold' },
    ],
  },
  {
    label: 'Line Heights',
    defaultOpen: false,
    tokens: [
      { key: 'fontLineHeightLarge' },
      { key: 'fontLineHeightRegular' },
      { key: 'fontLineHeightSmall' },
      { key: 'fontLineHeightExtraSmall' },
    ],
  },
  {
    label: 'Focus',
    defaultOpen: false,
    tokens: [{ key: 'focusRingColor', isColor: true }, { key: 'focusRingWidth' }],
  },
  {
    label: 'Shadows',
    defaultOpen: false,
    tokens: [{ key: 'shadowResting' }, { key: 'shadowTopmost' }],
  },
  {
    label: 'Transitions',
    defaultOpen: false,
    tokens: [{ key: 'transitionDuration' }],
  },
]

function tokenLabel(token: keyof GustoSDKTheme): string {
  return (token as string)
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, s => s.toUpperCase())
    .trim()
}

function matchesSearch(token: TokenDef, query: string): boolean {
  if (!query) return true
  const q = query.toLowerCase()
  return (
    (token.key as string).toLowerCase().includes(q) ||
    tokenLabel(token.key).toLowerCase().includes(q)
  )
}

interface TokenRowProps {
  def: TokenDef
}

function TokenRow({ def }: TokenRowProps) {
  const { themeOverrides, resolvedTheme, setThemeOverride } = useThemeEditor()
  const override = (themeOverrides[def.key] as string | undefined) ?? ''
  const resolved = (resolvedTheme[def.key] as string | undefined) ?? ''
  const swatchColor = override || resolved

  return (
    <div className={styles.token}>
      {def.isColor ? (
        <div className={styles.tokenPreview}>
          <label
            className={styles.colorPickerLabel}
            htmlFor={`theme-picker-${def.key}`}
            aria-label="Open color picker"
          >
            <div
              className={styles.colorSwatch}
              style={{ backgroundColor: swatchColor || 'transparent' }}
            />
            <input
              id={`theme-picker-${def.key}`}
              className={styles.colorPickerInput}
              type="color"
              value={
                swatchColor.startsWith('#') && swatchColor.length >= 4 ? swatchColor : '#000000'
              }
              onChange={e => {
                setThemeOverride(def.key, e.target.value)
              }}
              tabIndex={-1}
            />
          </label>
        </div>
      ) : (
        <div className={styles.tokenPreviewPlaceholder} />
      )}
      <label className={styles.tokenLabel} htmlFor={`theme-${def.key}`}>
        {tokenLabel(def.key)}
      </label>
      <input
        id={`theme-${def.key}`}
        className={styles.colorInput}
        type="text"
        value={override}
        placeholder={resolved}
        onChange={e => {
          setThemeOverride(def.key, e.target.value)
        }}
        spellCheck={false}
      />
    </div>
  )
}

interface AccordionGroupProps {
  group: TokenGroup
  query: string
  isOpen: boolean
  onToggle: () => void
}

function AccordionGroup({ group, query, isOpen, onToggle }: AccordionGroupProps) {
  const visibleTokens = group.tokens.filter(t => matchesSearch(t, query))
  if (visibleTokens.length === 0) return null

  return (
    <div className={styles.group}>
      <button
        type="button"
        className={styles.groupHeader}
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className={styles.groupLabel}>{group.label}</span>
        <span className={styles.groupCount}>{visibleTokens.length}</span>
        <span className={`${styles.groupChevron} ${isOpen ? styles.groupChevronOpen : ''}`}>▸</span>
      </button>
      {isOpen && (
        <div className={styles.groupBody}>
          {visibleTokens.map(def => (
            <TokenRow key={def.key} def={def} />
          ))}
        </div>
      )}
    </div>
  )
}

export function ThemeEditor() {
  const { clearThemeOverrides, themeOverrides } = useThemeEditor()
  const hasOverrides = Object.values(themeOverrides).some(Boolean)
  const [query, setQuery] = useState('')

  const initialOpen = () => {
    const state: Record<string, boolean> = {}
    for (const group of TOKEN_GROUPS) {
      state[group.label] = group.defaultOpen ?? false
    }
    return state
  }
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(initialOpen)

  const isSearching = query.trim().length > 0

  const toggleGroup = (label: string) => {
    setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }))
  }

  const isGroupOpen = (group: TokenGroup) => {
    if (isSearching) return group.tokens.some(t => matchesSearch(t, query))
    return openGroups[group.label] ?? false
  }

  return (
    <div className={styles.root}>
      <div className={styles.searchRow}>
        <input
          className={styles.searchInput}
          type="search"
          placeholder="Search tokens…"
          value={query}
          onChange={e => {
            setQuery(e.target.value)
          }}
          aria-label="Search theme tokens"
        />
        {hasOverrides && (
          <button className={styles.clearBtn} onClick={clearThemeOverrides} type="button">
            Reset
          </button>
        )}
      </div>
      <div className={styles.groups}>
        {TOKEN_GROUPS.map(group => (
          <AccordionGroup
            key={group.label}
            group={group}
            query={query}
            isOpen={isGroupOpen(group)}
            onToggle={() => {
              toggleGroup(group.label)
            }}
          />
        ))}
      </div>
    </div>
  )
}
