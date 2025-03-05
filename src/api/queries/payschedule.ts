import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useGustoApi } from '@/api/context'
import { Operations } from '@/types/schema'

export function useGetPaySchedule(pay_schedule_id: string, company_id: string) {
  const { GustoClient: client } = useGustoApi()
  return useSuspenseQuery({
    queryKey: ['companies', company_id, 'pay_schedules', pay_schedule_id],
    queryFn: () => client.getPaySchedule(pay_schedule_id, company_id),
  })
}

export function useGetAllPaySchedules(company_id: string) {
  const { GustoClient: client } = useGustoApi()
  return useSuspenseQuery({
    queryKey: ['companies', company_id, 'pay_schedules'],
    queryFn: () => client.getAllPaySchedules(company_id),
  })
}

export function useGetPaySchedulePayPeriodsByCompany(company_id: string) {
  const { GustoClient: client } = useGustoApi()
  return useSuspenseQuery({
    queryKey: ['companies', company_id, 'pay_periods'],
    queryFn: () => client.getPaySchedulePayPeriodsByCompany(company_id),
  })
}

export function useGetPayScheduleAssignmentsByCompany(company_id: string) {
  const { GustoClient: client } = useGustoApi()
  return useSuspenseQuery({
    queryKey: ['companies', company_id, 'pay_schedules', 'assignments'],
    queryFn: () => client.getPayScheduleAssignmentsByCompany(company_id),
  })
}

export function useCreatePaySchedule(opts?: Omit<Parameters<typeof useMutation>[0], 'mutationFn'>) {
  const { GustoClient: client } = useGustoApi()
  const queryClient = useQueryClient()
  return useMutation<
    Awaited<ReturnType<typeof client.createPaySchedule>>,
    Error,
    {
      company_id: string
      body: Parameters<typeof client.createPaySchedule>[1]
    }
  >({
    mutationFn: params => client.createPaySchedule(params.company_id, params.body),
    onSettled: async (data, _error, variables) => {
      if (data?.uuid) {
        await queryClient.invalidateQueries({
          queryKey: ['companies', variables.company_id, 'pay_schedules'],
        })
      }
    },
    ...opts,
  })
}

export function useUpdatePaySchedule(
  opts: Omit<Parameters<typeof useMutation>[0], 'mutationFn'> = {},
) {
  const { GustoClient: client } = useGustoApi()
  const queryClient = useQueryClient()
  return useMutation<
    Awaited<ReturnType<typeof client.updatePaySchedule>>,
    Error,
    {
      company_id: string
      pay_schedule_id: string
      body: Parameters<typeof client.updatePaySchedule>[2]
    }
  >({
    mutationFn: (params: {
      pay_schedule_id: string
      company_id: string
      body: Parameters<typeof client.updatePaySchedule>[2]
    }) => client.updatePaySchedule(params.pay_schedule_id, params.company_id, params.body),
    onSettled: async (data, _error, variables) => {
      if (data?.uuid) {
        // Invalidate list query
        await queryClient.invalidateQueries({
          queryKey: ['companies', variables.company_id, 'pay_schedules'],
        })
        // Invalidate detail query
        await queryClient.invalidateQueries({
          queryKey: ['companies', variables.company_id, 'pay_schedules', variables.pay_schedule_id],
        })
      }
    },
    ...opts,
  })
}

export function useGetPaySchedulePreview(
  company_id: string,
  params: Operations['get-v1-companies-company_id-pay_schedules-preview']['parameters']['query'],
) {
  const { GustoClient: client } = useGustoApi()
  return useSuspenseQuery({
    queryKey: ['companies', company_id, 'pay_schedules', 'preview', params],
    queryFn: () => client.getPaySchedulePreview(company_id, params),
  })
}
