import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useGustoApi } from '@/api/context'
import { OnError } from '@/api/typeHelpers'
import { handleResponse, type ApiError } from './helpers'

export function useGetEmployee(employee_id: string) {
  const { GustoClient: client } = useGustoApi()
  return useSuspenseQuery({
    queryKey: ['employees', employee_id],
    queryFn: () => {
      return client.getEmployee(employee_id).then(handleResponse)
    },
  })
}

export function useUpdateEmployee(opts?: Omit<Parameters<typeof useMutation>[0], 'mutationFn'>) {
  const { GustoClient: client } = useGustoApi()
  return useMutation<
    Awaited<ReturnType<typeof client.updateEmployee>>,
    Error,
    { employee_id: string; body: Parameters<typeof client.updateEmployee>[1] }
  >({
    mutationFn: params => client.updateEmployee(params.employee_id, params.body),
    ...opts,
  })
}

// HOME ADDRESS

export function useGetEmployeeHomeAddresses(employee_id: string) {
  const { GustoClient: client } = useGustoApi()
  return useSuspenseQuery({
    queryKey: ['employees', employee_id, 'home_addresses'],
    queryFn: () => client.getEmployeeHomeAddresses(employee_id).then(handleResponse),
  })
}
export function useGetEmployeeHomeAddress(home_address_uuid: string) {
  const { GustoClient: client } = useGustoApi()
  return useSuspenseQuery({
    queryKey: ['home_addresses', home_address_uuid],
    queryFn: () => client.getEmployeeHomeAddress(home_address_uuid).then(handleResponse),
  })
}

export function useUpdateEmployeeHomeAddress(
  opts: Omit<Parameters<typeof useMutation>[0], 'mutationFn'> = {},
) {
  const { GustoClient: client } = useGustoApi()
  return useMutation<
    Awaited<ReturnType<typeof client.updateEmployeeHomeAddress>>,
    Error,
    { home_address_uuid: string; body: Parameters<typeof client.updateEmployeeHomeAddress>[1] }
  >({
    mutationFn: params => client.updateEmployeeHomeAddress(params.home_address_uuid, params.body),
    ...opts,
  })
}

export function useAddEmployeeHomeAddress(
  opts: Omit<Parameters<typeof useMutation>[0], 'mutationFn'> = {},
) {
  const { GustoClient: client } = useGustoApi()
  return useMutation<
    Awaited<ReturnType<typeof client.createEmployeeHomeAddress>>,
    Error,
    { employee_id: string; body: Parameters<typeof client.createEmployeeHomeAddress>[1] }
  >({
    mutationFn: params => client.createEmployeeHomeAddress(params.employee_id, params.body),
    ...opts,
  })
}

export function useDeleteEmployeeHomeAddress(
  employee_id: string,
  opts: { onError: OnError } & Omit<Parameters<typeof useMutation>[0], 'mutationFn' | 'onError'>,
) {
  const { GustoClient: client } = useGustoApi()
  const queryClient = useQueryClient()
  const onSettled = async (data: unknown, error: unknown, variables: unknown, context: unknown) => {
    if (opts.onSettled) opts.onSettled(data, error, variables, context)
    await queryClient.invalidateQueries({
      queryKey: ['employees', employee_id, 'home_addresses'],
    })
  }

  return useMutation({
    mutationFn: (home_address_uuid: string) =>
      client.deleteEmployeeHomeAddress(home_address_uuid).then(x =>
        handleResponse(x, {
          statusCodeOverrides: { 422: 'Cannot remove an already onboarded employee' },
        }),
      ),
    onSettled,
    ...opts,
  })
}

// WORK ADDRESS

export function useGetEmployeeWorkAddresses(employee_id: string) {
  const { GustoClient: client } = useGustoApi()
  return useSuspenseQuery({
    queryKey: ['employees', employee_id, 'work_addresses'],
    queryFn: () => client.getEmployeeWorkAddresses(employee_id).then(handleResponse),
  })
}

export function useGetEmployeeWorkAddress(work_address_uuid: string) {
  const { GustoClient: client } = useGustoApi()
  return useSuspenseQuery({
    queryKey: ['work_addresses', work_address_uuid],
    queryFn: () => client.getEmployeeWorkAddresses(work_address_uuid).then(handleResponse),
  })
}

export function useUpdateEmployeeWorkAddress(
  opts?: Omit<Parameters<typeof useMutation>[0], 'mutationFn'>,
) {
  const { GustoClient: client } = useGustoApi()
  return useMutation<
    Awaited<ReturnType<typeof client.updateEmployeeWorkAddress>>,
    Error,
    { work_address_uuid: string; body: Parameters<typeof client.updateEmployeeWorkAddress>[1] }
  >({
    mutationFn: params => client.updateEmployeeWorkAddress(params.work_address_uuid, params.body),
    ...opts,
  })
}

export function useAddEmployeeWorkAddress(
  opts?: Omit<Parameters<typeof useMutation>[0], 'mutationFn'>,
) {
  const { GustoClient: client } = useGustoApi()
  return useMutation<
    Awaited<ReturnType<typeof client.createEmployeeWorkAddress>>,
    Error,
    { employee_id: string; body: Parameters<typeof client.createEmployeeWorkAddress>[1] }
  >({
    mutationFn: params => client.createEmployeeWorkAddress(params.employee_id, params.body),
    ...opts,
  })
}

export function useDeleteEmployeeWorkAddress(
  employee_id: string,
  opts: { onError: OnError } & Omit<Parameters<typeof useMutation>[0], 'mutationFn' | 'onError'>,
) {
  const { GustoClient: client } = useGustoApi()
  const queryClient = useQueryClient()
  const onSettled = async (data: unknown, error: unknown, variables: unknown, context: unknown) => {
    if (opts.onSettled) opts.onSettled(data, error, variables, context)
    await queryClient.invalidateQueries({
      queryKey: ['employees', employee_id, 'work_addresses'],
    })
  }

  return useMutation({
    mutationFn: (work_address_uuid: string) =>
      client.deleteEmployeeWorkAddress(work_address_uuid).then(x =>
        handleResponse(x, {
          statusCodeOverrides: { 422: "Cannot remove an already onboarded employee's address" },
        }),
      ),
    onSettled,
    ...opts,
  })
}

// EMPLOYEE DEDUCTIONS

export function useGetEmployeeDeductions(employee_id: string) {
  const { GustoClient: client } = useGustoApi()
  return useSuspenseQuery({
    queryKey: ['employees', employee_id, 'garnishments'],
    queryFn: () => client.getEmployeeDeductions(employee_id).then(handleResponse),
  })
}

export function useGetDeduction(garnishment_id: string) {
  const { GustoClient: client } = useGustoApi()
  return useSuspenseQuery({
    queryKey: ['garnishments', garnishment_id],
    queryFn: () => client.getDeduction(garnishment_id).then(handleResponse),
  })
}

export function useUpdateDeduction(
  employee_id: string,
  opts?: Omit<Parameters<typeof useMutation>[0], 'mutationFn'>,
) {
  const { GustoClient: client } = useGustoApi()
  const queryClient = useQueryClient()

  return useMutation<
    Awaited<ReturnType<typeof client.updateDeduction>>,
    Error,
    { garnishment_id: string; body: Parameters<typeof client.updateDeduction>[1] }
  >({
    mutationFn: ({ garnishment_id, body }) => client.updateDeduction(garnishment_id, body),
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['employees', employee_id, 'garnishments'],
      })
    },
    ...opts,
  })
}

export function useAddEmployeeDeduction(
  opts?: Omit<Parameters<typeof useMutation>[0], 'mutationFn'>,
) {
  const { GustoClient: client } = useGustoApi()
  const queryClient = useQueryClient()

  return useMutation<
    Awaited<ReturnType<typeof client.createEmployeeDeduction>>,
    Error,
    { employee_id: string; body: Parameters<typeof client.createEmployeeDeduction>[1] }
  >({
    mutationFn: ({
      employee_id,
      body,
    }: {
      employee_id: string
      body: Parameters<typeof client.createEmployeeDeduction>[1]
    }) => client.createEmployeeDeduction(employee_id, body),
    ...opts,
    onSettled: async data => {
      if (data?.employee_uuid)
        await queryClient.invalidateQueries({
          queryKey: ['employees', data.employee_uuid, 'garnishments'],
        })
    },
  })
}

// Employee payment methods

export function useGetEmployeeBankAccounts(employee_id: string) {
  const { GustoClient: client } = useGustoApi()
  return useSuspenseQuery({
    queryKey: ['employees', employee_id, 'bank_accounts'],
    queryFn: () => client.getEmployeeBankAccounts(employee_id).then(handleResponse),
  })
}

/**
 * Creates new bank account for an employee
 */
export function useAddEmployeeBankAccount(
  employee_id: string,
  opts: Omit<Parameters<typeof useMutation>[0], 'mutationFn'> = {},
) {
  const { GustoClient: client } = useGustoApi()
  const queryClient = useQueryClient()

  return useMutation<
    Awaited<ReturnType<typeof client.createEmployeeBankAccount>>,
    ApiError,
    { body: Parameters<typeof client.createEmployeeBankAccount>[1] }
  >({
    mutationFn: ({ body }) => client.createEmployeeBankAccount(employee_id, body),
    ...opts,
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['employees', employee_id], //invalidates not just bank_accounts, but payment_methods as well
      })
    },
  })
}

export function useUpdateEmployeeBankAccount(
  employee_id: string,
  opts: Omit<Parameters<typeof useMutation>[0], 'mutationFn'> = {},
) {
  const { GustoClient: client } = useGustoApi()
  const queryClient = useQueryClient()

  return useMutation<
    Awaited<ReturnType<typeof client.updateEmployeeBankAccount>>,
    Error,
    { bank_account_uuid: string; body: Parameters<typeof client.updateEmployeeBankAccount>[2] }
  >({
    mutationFn: ({ bank_account_uuid, body }) =>
      client.updateEmployeeBankAccount(employee_id, bank_account_uuid, body),
    ...opts,
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['employees', employee_id], //invalidates not just bank_accounts, but payment_methods as well
      })
    },
  })
}

export function useDeleteEmployeeBankAccount(
  employee_id: string,
  opts: Omit<Parameters<typeof useMutation>[0], 'mutationFn'> = {},
) {
  const { GustoClient: client } = useGustoApi()
  const queryClient = useQueryClient()

  return useMutation<Awaited<ReturnType<typeof client.deleteEmployeeBankAccount>>, Error, string>({
    mutationFn: bank_account_uuid =>
      client.deleteEmployeeBankAccount(employee_id, bank_account_uuid),
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['employees', employee_id],
      })
    },
    ...opts,
  })
}

export function useGetEmployeePaymentMethod(employee_id: string) {
  const { GustoClient: client } = useGustoApi()
  return useSuspenseQuery({
    queryKey: ['employees', employee_id, 'payment_method'],
    queryFn: () => client.getEmployeePaymentMethod(employee_id).then(handleResponse),
  })
}

export function useUpdateEmployeePaymentMethod(
  employee_id: string,
  opts?: Omit<Parameters<typeof useMutation>[0], 'mutationFn'>,
) {
  const { GustoClient: client } = useGustoApi()
  const queryClient = useQueryClient()

  return useMutation<
    Awaited<ReturnType<typeof client.updateEmployeePaymentMethod>>,
    Error,
    { body: Parameters<typeof client.updateEmployeePaymentMethod>[1] }
  >({
    mutationFn: params => client.updateEmployeePaymentMethod(employee_id, params.body),
    ...opts,
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['employees', employee_id],
      })
    },
  })
}

// Jobs and Compensations

export function useGetEmployeeJobs(employee_id: string) {
  const { GustoClient: client } = useGustoApi()
  return useSuspenseQuery({
    queryKey: ['employees', employee_id, 'jobs'],
    queryFn: () => client.getEmployeeJobs(employee_id).then(handleResponse),
  })
}

export function useGetEmployeeJob(job_id: string) {
  const { GustoClient: client } = useGustoApi()
  return useSuspenseQuery({
    queryKey: ['employees', 'job', job_id],
    queryFn: () => client.getEmployeeJob(job_id).then(handleResponse),
  })
}
//TODO: replicate type across other hooks
export function useCreateEmployeeJob(opts?: Omit<Parameters<typeof useMutation>[0], 'mutationFn'>) {
  const { GustoClient: client } = useGustoApi()
  const queryClient = useQueryClient()

  return useMutation<
    Awaited<ReturnType<typeof client.createEmployeeJob>>,
    Error,
    { employee_id: string; body: Parameters<typeof client.createEmployeeJob>[1] }
  >({
    mutationFn: params => client.createEmployeeJob(params.employee_id, params.body),
    onSettled: async data => {
      if (data?.employee_uuid) {
        await queryClient.invalidateQueries({
          queryKey: ['employees', data.employee_uuid],
        })
      }
    },
    ...opts,
  })
}

export function useUpdateEmployeeJob(
  opts: Omit<Parameters<typeof useMutation>[0], 'mutationFn'> = {},
) {
  const { GustoClient: client } = useGustoApi()
  return useMutation<
    Awaited<ReturnType<typeof client.updateEmployeeJob>>,
    Error,
    { job_id: string; body: Parameters<typeof client.updateEmployeeJob>[1] }
  >({
    mutationFn: (params: {
      job_id: string
      body: Parameters<typeof client.updateEmployeeJob>[1]
    }) => client.updateEmployeeJob(params.job_id, params.body),
    ...opts,
  })
}

export function useDeleteEmployeeJob(
  employee_id: string,
  opts?: Omit<Parameters<typeof useMutation>[0], 'mutationFn'>,
) {
  const { GustoClient: client } = useGustoApi()
  const queryClient = useQueryClient()

  return useMutation<Awaited<ReturnType<typeof client.deleteEmployeeJob>>, Error, string>({
    mutationFn: job_id => client.deleteEmployeeJob(job_id),
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['employees', employee_id],
      })
    },
    ...opts,
  })
}

export function useCreateEmployeeCompensation(
  opts: Omit<Parameters<typeof useMutation>[0], 'mutationFn'>,
) {
  const { GustoClient: client } = useGustoApi()
  return useMutation({
    mutationFn: (params: {
      job_id: string
      body: Parameters<typeof client.createEmployeeCompensation>[1]
    }) => client.createEmployeeCompensation(params.job_id, params.body).then(handleResponse),
    ...opts,
  })
}
export function useUpdateEmployeeCompensation(
  employee_id: string,
  opts: Omit<Parameters<typeof useMutation>[0], 'mutationFn'> = {},
) {
  const { GustoClient: client } = useGustoApi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: {
      compensation_id: string
      body: Parameters<typeof client.updateEmployeeCompensation>[1]
    }) =>
      client.updateEmployeeCompensation(params.compensation_id, params.body).then(handleResponse),
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['employees', employee_id],
      })
    },
    ...opts,
  })
}

export function useGetEmployeeFederalTaxes(employee_id: string) {
  const { GustoClient: client } = useGustoApi()
  return useSuspenseQuery({
    queryKey: ['employees', employee_id, 'federal_taxes'],
    queryFn: () => client.getEmployeeFederalTaxes(employee_id).then(handleResponse),
  })
}

export function useUpdateEmployeeFederalTaxes(
  opts: Omit<Parameters<typeof useMutation>[0], 'mutationFn'> = {},
) {
  const { GustoClient: client } = useGustoApi()
  return useMutation<
    Awaited<ReturnType<typeof client.updateEmployeeFederalTaxes>>,
    Error,
    { employeeId: string; body: Parameters<typeof client.updateEmployeeFederalTaxes>[1] }
  >({
    mutationFn: params => client.updateEmployeeFederalTaxes(params.employeeId, params.body),
    ...opts,
  })
}

export function useGetEmployeeStateTaxes(employee_id: string) {
  const { GustoClient: client } = useGustoApi()
  return useSuspenseQuery({
    queryKey: ['employees', employee_id, 'state_taxes'],
    queryFn: () => client.getEmployeeStateTaxes(employee_id),
  })
}

export function useUpdateEmployeeStateTaxes(
  employeeId: string,
  opts: Omit<Parameters<typeof useMutation>[0], 'mutationFn'> = {},
) {
  const { GustoClient: client } = useGustoApi()
  return useMutation<
    Awaited<ReturnType<typeof client.updateEmployeeStateTaxes>>,
    Error,
    { body: Parameters<typeof client.updateEmployeeStateTaxes>[1] }
  >({
    mutationFn: params => client.updateEmployeeStateTaxes(employeeId, params.body),
    ...opts,
  })
}

//Employee onboarding status
export function useGetEmployeeOnboardingStatus(employee_id: string) {
  const { GustoClient: client } = useGustoApi()
  return useSuspenseQuery({
    queryKey: ['employees', employee_id, 'onboarding_status'],
    queryFn: () => client.getEmployeeOnboardingStatus(employee_id),
  })
}
