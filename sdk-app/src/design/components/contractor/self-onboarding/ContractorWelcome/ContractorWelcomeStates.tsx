import { ContractorWelcome } from './ContractorWelcome'

export interface ContractorWelcomeDemoProps {
  contractorName: string
  companyName: string
}

/**
 * Renders ContractorWelcome for state demos. The component is purely
 * presentational, so no extra context is needed.
 */
export function ContractorWelcomeDemo(props: ContractorWelcomeDemoProps) {
  return <ContractorWelcome {...props} onStart={() => {}} />
}
