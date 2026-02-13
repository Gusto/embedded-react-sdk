import { useCallback } from 'react'
import { useIndustrySelectionGetSuspense } from '@gusto/embedded-api/react-query/industrySelectionGet'
import { useIndustrySelectionUpdateMutation } from '@gusto/embedded-api/react-query/industrySelectionUpdate'
import type { IndustryFormFields } from './Edit'
import { useBase } from '@/components/Base'
import { componentEvents } from '@/shared/constants'

interface UseCompanyIndustryProps {
  companyId: string
}

export function useCompanyIndustry({ companyId }: UseCompanyIndustryProps) {
  const { baseSubmitHandler, onEvent } = useBase()

  const {
    data: { industry },
  } = useIndustrySelectionGetSuspense({ companyId })

  const { isPending, mutateAsync: mutateIndustry } = useIndustrySelectionUpdateMutation()

  const onValid = useCallback(
    async (data: IndustryFormFields) => {
      await baseSubmitHandler(data, async ({ naics_code }) => {
        const response = await mutateIndustry({
          request: { companyId, requestBody: { naicsCode: naics_code } },
        })
        onEvent(componentEvents.COMPANY_INDUSTRY_SELECTED, response.industry)
      })
    },
    [baseSubmitHandler, companyId, mutateIndustry, onEvent],
  )

  return {
    data: {
      industry,
    },
    actions: {
      onValid,
    },
    meta: {
      isPending,
    },
  }
}
