export interface ProgressBarProps {
  /**
   * Total number of steps in the progress sequence
   */
  totalSteps: number
  /**
   * Current step in the progress sequence
   */
  currentStep: number
  /**
   * Additional CSS class name for the progress bar container
   */
  className?: string
  /**
   * Accessible label describing the progress bar's purpose
   */
  label: string
  /**
   * Component to render as the progress bar's CTA
   */
  cta?: React.ComponentType | null
}
