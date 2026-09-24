import * as z from "zod/v3";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
export type EmployeeHomeAddress = {
    street1?: string | null | undefined;
    street2?: string | null | undefined;
    city?: string | null | undefined;
    state?: string | null | undefined;
    zip?: string | null | undefined;
    country: string | null;
    /**
     * The status of the location. Inactive locations have been deleted, but may still have historical data associated with them.
     */
    active?: boolean | undefined;
    /**
     * Unique identifier for this address.
     */
    uuid?: string | undefined;
};
/** @internal */
export declare const EmployeeHomeAddress$inboundSchema: z.ZodType<EmployeeHomeAddress, z.ZodTypeDef, unknown>;
export declare function employeeHomeAddressFromJSON(jsonString: string): SafeParseResult<EmployeeHomeAddress, SDKValidationError>;
//# sourceMappingURL=employeehomeaddress.d.ts.map