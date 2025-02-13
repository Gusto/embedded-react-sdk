import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useGustoApi } from '@/api/context'
import { OnError } from '@/api/typeHelpers'
import { handleResponse } from './helpers'

export function useGetCompany(company_id: string) {
  const { GustoClient: client } = useGustoApi()
  return useSuspenseQuery({
    queryKey: ['companies', company_id],
    queryFn: () => client.getCompany(company_id),
  })
}

export function useGetCompanyOnboardingStatus(company_id: string) {
  const { GustoClient: client } = useGustoApi()
  return useSuspenseQuery({
    queryKey: ['companies', company_id, 'onboarding_status'],
    queryFn: () => client.getCompanyOnboardingStatus(company_id).then(handleResponse),
  })
}
//Addresses
export function useGetCompanyAddresses(company_id: string) {
  const { GustoClient: client } = useGustoApi()
  return useSuspenseQuery({
    queryKey: ['companies', company_id, 'addresses'],
    queryFn: () => client.getCompanyAddresses(company_id),
  })
}
//Employees
export function useGetEmployeesByCompany({
  company_id,
  per = 10,
  page = 1,
}: {
  company_id: string
  per?: number
  page?: number
}) {
  const { GustoClient: client } = useGustoApi()
  return useSuspenseQuery({
    queryKey: ['companies', company_id, 'employees', page, per],
    queryFn: () => client.getCompanyEmployees(company_id, per, page),
  })
}

export function useCreateEmployee(opts?: Omit<Parameters<typeof useMutation>[0], 'mutationFn'>) {
  const { GustoClient: client } = useGustoApi()
  return useMutation<
    Awaited<ReturnType<typeof client.createEmployee>>,
    Error,
    { company_id: string; body: Parameters<typeof client.createEmployee>[1] }
  >({
    mutationFn: params => client.createEmployee(params.company_id, params.body),
    ...opts,
  })
}

export function useDeleteEmployee(
  companyId: string,
  opts?: Omit<Parameters<typeof useMutation>[0], 'mutationFn'>,
) {
  const { GustoClient: client } = useGustoApi()
  const queryClient = useQueryClient()
  const onSettled = async (data: unknown, error: unknown, variables: unknown, context: unknown) => {
    if (opts?.onSettled) opts.onSettled(data, error, variables, context)
    await queryClient.invalidateQueries({
      queryKey: ['companies', companyId, 'employees'],
    })
  }

  return useMutation<Awaited<ReturnType<typeof client.deleteEmployee>>, Error, string>({
    mutationFn: employee_id => client.deleteEmployee(employee_id),
    ...opts,
    onSettled,
  })
}

// COMPANY LOCATIONS

export function useGetCompanyLocations(company_uuid: string) {
  const { GustoClient: client } = useGustoApi()
  return useSuspenseQuery({
    queryKey: ['companies', company_uuid, 'locations'],
    queryFn: () => client.getCompanyLocations(company_uuid),
  })
}

export function useGetCompanyLocation(location_uuid: string) {
  const { GustoClient: client } = useGustoApi()
  return useSuspenseQuery({
    queryKey: ['companies', 'locations', location_uuid],
    queryFn: () => client.getCompanyLocation(location_uuid).then(handleResponse),
  })
}

export function useUpdateCompanyLocation(
  opts: Omit<Parameters<typeof useMutation>[0], 'mutationFn'>,
) {
  const { GustoClient: client } = useGustoApi()
  return useMutation({
    mutationFn: (params: {
      locationId: string
      body: Parameters<typeof client.updateCompanyLocation>[1]
    }) => client.updateCompanyLocation(params.locationId, params.body).then(handleResponse),
    ...opts,
  })
}

export function useCreateCompanyLocation(
  opts: Omit<Parameters<typeof useMutation>[0], 'mutationFn'>,
) {
  const { GustoClient: client } = useGustoApi()
  return useMutation<
    Awaited<ReturnType<typeof client.createCompanyLocation>>,
    Error,
    { companyId: string; body: Parameters<typeof client.createCompanyLocation>[1] }
  >({
    mutationFn: params => client.createCompanyLocation(params.companyId, params.body),
    ...opts,
  })
}

export function useCreateCompanyBankAccount(
  companyId: string,
  opts: { onError: OnError } & Omit<Parameters<typeof useMutation>[0], 'mutationFn' | 'onError'>,
) {
  const { GustoClient: client } = useGustoApi()
  const queryClient = useQueryClient()
  const onSettled = async (data: unknown, error: unknown, variables: unknown, context: unknown) => {
    if (opts.onSettled) opts.onSettled(data, error, variables, context)
    await queryClient.invalidateQueries({
      queryKey: ['companies', companyId, 'bank_accounts'],
    })
  }

  return useMutation({
    mutationFn: (body: Parameters<typeof client.createCompanyBankAccount>[1]) =>
      client.createCompanyBankAccount(companyId, body).then(handleResponse),
    onSettled,
    ...opts,
  })
}

export function useGetMinimumWagesForLocation(location_uuid: string | undefined) {
  const { GustoClient: client } = useGustoApi()
  return useSuspenseQuery({
    queryKey: ['locations', location_uuid, 'minimum_wages'],
    queryFn: () => {
      if (!location_uuid) return []
      return client.getMinimumWagesForLocation(location_uuid)
    },
  })
}

// Company Federal Taxes

export function useGetCompanyFederalTaxes(company_id: string) {
  const { GustoClient: client } = useGustoApi()
  return useSuspenseQuery({
    queryKey: ['company', company_id, 'federal_taxes'],
    queryFn: () => client.getCompanyFederalTaxes(company_id).then(handleResponse),
  })
}

export function useUpdateCompanyFederalTaxes(
  opts: Omit<Parameters<typeof useMutation>[0], 'mutationFn'>,
) {
  const { GustoClient: client } = useGustoApi()
  return useMutation({
    mutationFn: (params: {
      companyId: string
      body: Parameters<typeof client.updateCompanyFederalTaxes>[1]
    }) => client.updateCompanyFederalTaxes(params.companyId, params.body).then(handleResponse),
    ...opts,
  })
}

// Company Industry

export function useGetCompanyIndustry(company_id: string) {
  const { GustoClient: client } = useGustoApi()
  return useSuspenseQuery({
    queryKey: ['company', company_id, 'industry_selection'],
    queryFn: () => client.getCompanyIndustry(company_id).then(handleResponse),
  })
}

export function useUpdateCompanyIndustry(
  opts?: Omit<Parameters<typeof useMutation>[0], 'mutationFn'>,
) {
  const { GustoClient: client } = useGustoApi()
  return useMutation({
    mutationFn: (params: {
      companyId: string
      body: Parameters<typeof client.updateCompanyIndustry>[1]
    }) => client.updateCompanyIndustry(params.companyId, params.body).then(handleResponse),
    ...opts,
  })
}

// State Tax Requirements

export function useGetStateTaxRequirements(company_uuid: string, state: string) {
  const { GustoClient: client } = useGustoApi()
  return useSuspenseQuery({
    queryKey: ['companies', company_uuid, 'tax_requirements', state],
    queryFn: () => client.getStateTaxRequirements(company_uuid, state).then(handleResponse),
  })
}
