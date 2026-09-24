import * as z from "zod/v3";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
export type RecurringReimbursement = {
    /**
     * The unique identifier of this recurring reimbursement.
     */
    uuid: string;
    /**
     * The UUID of the employee.
     */
    employeeUuid: string;
    /**
     * The description of the reimbursement.
     */
    description: string;
    /**
     * The dollar amount of the reimbursement.
     */
    amount: string;
    /**
     * The current version of the object. See the [versioning guide](https://docs.gusto.com/embedded-payroll/docs/idempotency) for information on how to use this field.
     */
    version: string;
    /**
     * The timestamp when this reimbursement was created.
     */
    createdAt?: string | undefined;
    /**
     * The timestamp when this reimbursement was last updated.
     */
    updatedAt?: string | undefined;
};
/** @internal */
export declare const RecurringReimbursement$inboundSchema: z.ZodType<RecurringReimbursement, z.ZodTypeDef, unknown>;
export declare function recurringReimbursementFromJSON(jsonString: string): SafeParseResult<RecurringReimbursement, SDKValidationError>;
//# sourceMappingURL=recurringreimbursement.d.ts.map