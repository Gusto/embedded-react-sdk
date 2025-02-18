import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { queryClient, useGustoApi } from '@/api/context'

export function useGetAllCompanyForms(company_id: string) {
  const { GustoClient: client } = useGustoApi()
  return useSuspenseQuery({
    queryKey: ['companies', company_id, 'forms'],
    queryFn: () => client.getAllCompanyForms(company_id),
  })
}

export function useGetCompanyFormPdf(form_id: string) {
  const { GustoClient: client } = useGustoApi()
  return useSuspenseQuery({
    queryKey: ['companies', 'forms', form_id, 'pdf'],
    queryFn: () => client.getCompanyFormPdf(form_id),
  })
}

export function useSignCompanyForm(
  company_id: string,
  opts?: Omit<Parameters<typeof useMutation>[0], 'mutationFn'>,
) {
  const { GustoClient: client } = useGustoApi()
  const onSettled = async (data: unknown, error: unknown, variables: unknown, context: unknown) => {
    if (opts?.onSettled) opts.onSettled(data, error, variables, context)
    await queryClient.invalidateQueries({
      queryKey: ['companies', company_id, 'forms'],
    })
  }

  return useMutation({
    mutationFn: ({
      form_id,
      body,
    }: {
      form_id: string
      body: Parameters<typeof client.signCompanyForm>[1]
    }) => client.signCompanyForm(form_id, body),
    ...opts,
    onSettled,
  })
}
