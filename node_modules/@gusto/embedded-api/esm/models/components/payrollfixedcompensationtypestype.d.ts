import * as z from "zod/v3";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
export type PayrollFixedCompensationTypesType = {
    /**
     * The name of an available type of fixed compensation.
     */
    name?: string | undefined;
};
/** @internal */
export declare const PayrollFixedCompensationTypesType$inboundSchema: z.ZodType<PayrollFixedCompensationTypesType, z.ZodTypeDef, unknown>;
export declare function payrollFixedCompensationTypesTypeFromJSON(jsonString: string): SafeParseResult<PayrollFixedCompensationTypesType, SDKValidationError>;
//# sourceMappingURL=payrollfixedcompensationtypestype.d.ts.map