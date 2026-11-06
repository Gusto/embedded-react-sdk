import type { UseIndustryFormReady } from './shared/useIndustryForm'
import { createCompoundContext } from '@/components/Base'

const [useIndustryFormContext, IndustryFormProvider] =
  createCompoundContext<UseIndustryFormReady>('IndustryForm')

export { IndustryFormProvider, useIndustryFormContext }
