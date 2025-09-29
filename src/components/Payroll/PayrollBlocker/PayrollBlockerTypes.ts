/**
 * Status of a payroll blocker
 */
export type PayrollBlockerStatus = 'unresolved' | 'in_progress' | 'resolved' | 'skipped'

/**
 * Individual step in the resolution process
 */
export interface PayrollBlockerResolutionStep {
  id: string
  title: string
  description: string
  /**
   * Optional action button for this step
   */
  action?: {
    label: string
    variant?: 'primary' | 'secondary' | 'tertiary'
    onClick: () => void
  }
  /**
   * External link if resolution requires navigation
   */
  externalLink?: {
    url: string
    label: string
    opensInNewTab?: boolean
  }
  /**
   * Whether this step has been completed
   */
  completed?: boolean
  /**
   * Whether this step is currently active/in progress
   */
  active?: boolean
}

/**
 * Complete information about a payroll blocker including resolution steps
 */
export interface PayrollBlocker {
  id: string
  title: string
  description: string
  /**
   * Additional context or help text
   */
  helpText?: string
  /**
   * Current resolution status (defaults to 'unresolved' for backward compatibility)
   */
  status?: PayrollBlockerStatus
  /**
   * Estimated time to resolve (for user planning)
   */
  estimatedResolutionTime?: string
  /**
   * Category for grouping blockers
   */
  category?: string
  /**
   * Sequential steps to resolve this blocker (defaults to empty array for backward compatibility)
   */
  resolutionSteps?: PayrollBlockerResolutionStep[]
  /**
   * Quick action for simple one-click resolutions (used in alert view)
   */
  quickAction?: {
    label: string
    onClick: () => void
  }
  /**
   * Legacy action format for backward compatibility
   */
  action?: {
    label: string
    onClick: () => void
  }
  /**
   * Contact information if user needs help
   */
  supportContact?: {
    label: string
    url: string
    type: 'email' | 'phone' | 'chat' | 'help_center'
  }
}

export interface PayrollBlockerProps {
  blockers: PayrollBlocker[]
  /**
   * Handler for viewing all blockers when multiple exist.
   * Should be provided when there are multiple blockers to give users a way to address them.
   */
  onMultipleViewClick?: () => void
  multipleViewLabel?: string
  className?: string
}

export interface PayrollBlockerListProps {
  blockers: PayrollBlocker[]
  onBack?: () => void
  className?: string
}
