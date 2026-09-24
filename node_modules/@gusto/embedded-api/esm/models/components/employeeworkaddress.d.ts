import * as z from "zod/v3";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
export type EmployeeWorkAddress = {
    /**
     * The unique identifier of this work address.
     */
    uuid: string;
    /**
     * The date the employee began working at this location.
     */
    effectiveDate?: string | undefined;
    /**
     * Signifies if this address is the active work address for the current date
     */
    active?: boolean | undefined;
    /**
     * UUID reference to the company location for this work address.
     */
    locationUuid?: string | undefined;
    /**
     * UUID reference to the employee for this work address.
     */
    employeeUuid?: string | undefined;
    /**
     * The current version of the object. See the [versioning guide](https://docs.gusto.com/embedded-payroll/docs/idempotency) for information on how to use this field.
     */
    version: string;
    street1?: string | undefined;
    street2?: string | null | undefined;
    city?: string | undefined;
    state?: string | undefined;
    zip?: string | undefined;
    country: string;
};
/** @internal */
export declare const EmployeeWorkAddress$inboundSchema: z.ZodType<EmployeeWorkAddress, z.ZodTypeDef, unknown>;
export declare function employeeWorkAddressFromJSON(jsonString: string): SafeParseResult<EmployeeWorkAddress, SDKValidationError>;
//# sourceMappingURL=employeeworkaddress.d.ts.map