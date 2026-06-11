import type { ReactNode } from 'react'
import { useCodeBlockContext } from '@docusaurus/theme-common/internal'
import styles from './styles.module.css'

type IconProps = { className?: string }

function TerminalIcon({ className }: IconProps): ReactNode {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" x2="20" y1="19" y2="19" />
    </svg>
  )
}

function CodeIcon({ className }: IconProps): ReactNode {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  )
}

function PaletteIcon({ className }: IconProps): ReactNode {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  )
}

function BracesIcon({ className }: IconProps): ReactNode {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5a2 2 0 0 0 2 2h1" />
      <path d="M16 21h1a2 2 0 0 0 2-2v-5a2 2 0 0 1 2-2 2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1" />
    </svg>
  )
}

function FileTextIcon({ className }: IconProps): ReactNode {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
      <path d="M10 9H8" />
    </svg>
  )
}

function FileIcon({ className }: IconProps): ReactNode {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  )
}

function pickIconByLanguage(language: string): ReactNode | null {
  const lang = language.toLowerCase()
  if (/^(bash|sh|shell|zsh|console|terminal|cli)$/.test(lang)) {
    return <TerminalIcon className={styles.titleIcon} />
  }
  if (/^(tsx|ts|typescript|jsx|js|mjs|cjs|javascript)$/.test(lang)) {
    return <CodeIcon className={styles.titleIcon} />
  }
  if (/^(css|scss|sass|less)$/.test(lang)) {
    return <PaletteIcon className={styles.titleIcon} />
  }
  if (lang === 'json') {
    return <BracesIcon className={styles.titleIcon} />
  }
  if (/^(md|mdx|markdown)$/.test(lang)) {
    return <FileTextIcon className={styles.titleIcon} />
  }
  if (/^(yaml|yml)$/.test(lang)) {
    return <FileIcon className={styles.titleIcon} />
  }
  return null
}

function pickIconByTitle(title: string): ReactNode | null {
  if (/\b(command line|terminal|shell)\b/i.test(title)) {
    return <TerminalIcon className={styles.titleIcon} />
  }
  if (/\.(tsx?|jsx?|mjs|cjs)$/i.test(title)) {
    return <CodeIcon className={styles.titleIcon} />
  }
  if (/\.(css|scss|sass|less)$/i.test(title)) {
    return <PaletteIcon className={styles.titleIcon} />
  }
  if (/\.json$/i.test(title)) {
    return <BracesIcon className={styles.titleIcon} />
  }
  if (/\.(md|mdx)$/i.test(title)) {
    return <FileTextIcon className={styles.titleIcon} />
  }
  if (/\.ya?ml$/i.test(title)) {
    return <FileIcon className={styles.titleIcon} />
  }
  if (/\//.test(title)) {
    return <FileIcon className={styles.titleIcon} />
  }
  return null
}

export default function CodeBlockTitle({ children }: { children: ReactNode }): ReactNode {
  const { metadata } = useCodeBlockContext()
  const text = typeof children === 'string' ? children : ''
  const icon = pickIconByTitle(text) ?? pickIconByLanguage(metadata.language ?? '')
  if (!icon) {
    return children
  }
  return (
    <span className={styles.titleWrapper}>
      {icon}
      <span>{children}</span>
    </span>
  )
}
