import type { AfterSuccessHook } from '@/types/hooks'

// Workaround for EMBPAY-591: the SDK's Zod schema defines
// final_payout_unused_hours_input as z.string().optional() but the API
// returns null for non-termination payrolls. When Zod rejects the
// response, React Query's background refetch silently discards the data,
// leaving the component stuck on stale "calculating" state forever.
// Remove this hook once the SDK schema is fixed upstream.
export const payrollResponseFixHook: AfterSuccessHook = {
  afterSuccess: async (_hookCtx, response) => {
    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      return response
    }

    const text = await response.text()

    if (!text.includes('"final_payout_unused_hours_input":null')) {
      return new Response(text, response)
    }

    const fixed = text.replace(
      /"final_payout_unused_hours_input":null/g,
      '"final_payout_unused_hours_input":"0"',
    )

    return new Response(fixed, response)
  },
}
