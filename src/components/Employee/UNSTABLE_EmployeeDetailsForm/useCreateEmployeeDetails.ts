import { useEmployeesCreateMutation } from '@gusto/embedded-api/react-query/employeesCreate'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import { RFCDate } from '@gusto/embedded-api/types/rfcdate'
import type { OptionalEmployeeField, EmployeeDetailsFormData } from './schema'
import { useEmployeeDetailsBase } from './useEmployeeDetailsBase'
import { assertResponseData } from '@/helpers/assertResponseData'

interface UseCreateEmployeeDetailsParams {
  companyId: string
  optionalFieldsToRequire?: OptionalEmployeeField[]
}

export function useCreateEmployeeDetails({
  companyId,
  optionalFieldsToRequire = [],
}: UseCreateEmployeeDetailsParams) {
  const { baseSubmitHandler, ...shared } = useEmployeeDetailsBase({ optionalFieldsToRequire })
  const createMutation = useEmployeesCreateMutation()

  const defaultValues = {
    firstName: '',
    middleInitial: '',
    lastName: '',
    email: '',
    ssn: '',
    dateOfBirth: '',
    selfOnboarding: false,
  }

  const onSubmit = async (data: EmployeeDetailsFormData): Promise<Employee | undefined> => {
    return baseSubmitHandler(data, async payload => {
      const { firstName, lastName, middleInitial, email, ssn, dateOfBirth, selfOnboarding } =
        payload

      const { employee } = await createMutation.mutateAsync({
        request: {
          companyId,
          requestBody: {
            firstName,
            lastName,
            middleInitial,
            email: email || undefined,
            ssn: ssn || undefined,
            dateOfBirth: dateOfBirth ? new RFCDate(dateOfBirth) : undefined,
            selfOnboarding,
          },
        },
      })

      assertResponseData(employee, 'employee')
      return employee
    })
  }

  return {
    ...shared,
    defaultValues,
    onSubmit,
    isPending: createMutation.isPending,
  }
}
