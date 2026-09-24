import * as z from "zod/v3";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
/**
 * Response containing the calculated gross up amount
 */
export type PayrollGrossUpResponse = {
    /**
     * Gross up earnings.
     */
    grossUp?: string | undefined;
};
/** @internal */
export declare const PayrollGrossUpResponse$inboundSchema: z.ZodType<PayrollGrossUpResponse, z.ZodTypeDef, unknown>;
export declare function payrollGrossUpResponseFromJSON(jsonString: string): SafeParseResult<PayrollGrossUpResponse, SDKValidationError>;
//# sourceMappingURL=payrollgrossupresponse.d.ts.map