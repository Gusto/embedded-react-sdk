import { MutationKey, UseMutationResult } from "@tanstack/react-query";
import { GustoEmbeddedCore } from "../core.js";
import { RequestOptions } from "../lib/sdks.js";
import { GustoEmbeddedError } from "../models/errors/gustoembeddederror.js";
import { ConnectionError, InvalidRequestError, RequestAbortedError, RequestTimeoutError, UnexpectedClientError } from "../models/errors/httpclienterrors.js";
import { NotFoundErrorObject } from "../models/errors/notfounderrorobject.js";
import { ResponseValidationError } from "../models/errors/responsevalidationerror.js";
import { SDKValidationError } from "../models/errors/sdkvalidationerror.js";
import { PutV1EmployeesEmployeeIdOnboardingDocumentsConfigRequest, PutV1EmployeesEmployeeIdOnboardingDocumentsConfigResponse } from "../models/operations/putv1employeesemployeeidonboardingdocumentsconfig.js";
import { MutationHookOptions } from "./_types.js";
export type EmployeesUpdateOnboardingDocumentsConfigMutationVariables = {
    request: PutV1EmployeesEmployeeIdOnboardingDocumentsConfigRequest;
    options?: RequestOptions;
};
export type EmployeesUpdateOnboardingDocumentsConfigMutationData = PutV1EmployeesEmployeeIdOnboardingDocumentsConfigResponse;
export type EmployeesUpdateOnboardingDocumentsConfigMutationError = NotFoundErrorObject | GustoEmbeddedError | ResponseValidationError | ConnectionError | RequestAbortedError | RequestTimeoutError | InvalidRequestError | UnexpectedClientError | SDKValidationError;
/**
 * Update employee onboarding documents config
 *
 * @remarks
 * Indicate whether to include the Form I-9 for an employee during the onboarding process.
 * If included, the employee will be prompted to complete Form I-9 as part of their onboarding.
 *
 * ## Related guides
 * - [Employee onboarding](doc:employee-onboarding)
 *
 * scope: `employees:manage`
 */
export declare function useEmployeesUpdateOnboardingDocumentsConfigMutation(options?: MutationHookOptions<EmployeesUpdateOnboardingDocumentsConfigMutationData, EmployeesUpdateOnboardingDocumentsConfigMutationError, EmployeesUpdateOnboardingDocumentsConfigMutationVariables>): UseMutationResult<EmployeesUpdateOnboardingDocumentsConfigMutationData, EmployeesUpdateOnboardingDocumentsConfigMutationError, EmployeesUpdateOnboardingDocumentsConfigMutationVariables>;
export declare function mutationKeyEmployeesUpdateOnboardingDocumentsConfig(): MutationKey;
export declare function buildEmployeesUpdateOnboardingDocumentsConfigMutation(client$: GustoEmbeddedCore, hookOptions?: RequestOptions): {
    mutationKey: MutationKey;
    mutationFn: (variables: EmployeesUpdateOnboardingDocumentsConfigMutationVariables) => Promise<EmployeesUpdateOnboardingDocumentsConfigMutationData>;
};
//# sourceMappingURL=employeesUpdateOnboardingDocumentsConfig.d.ts.map