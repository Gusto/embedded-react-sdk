import * as z from "zod/v3";
import { ClosedEnum } from "../../types/enums.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
/**
 * The status of the external payroll. The status will be `unprocessed` when the external payroll is created and transition to `processed` once tax liabilities are entered and finalized.  Once in the `processed` status all actions that can edit an external payroll will be disabled.
 */
export declare const ExternalPayrollBasicStatus: {
    readonly Unprocessed: "unprocessed";
    readonly Processed: "processed";
};
/**
 * The status of the external payroll. The status will be `unprocessed` when the external payroll is created and transition to `processed` once tax liabilities are entered and finalized.  Once in the `processed` status all actions that can edit an external payroll will be disabled.
 */
export type ExternalPayrollBasicStatus = ClosedEnum<typeof ExternalPayrollBasicStatus>;
/**
 * The representation of an external payroll with minimal information.
 */
export type ExternalPayrollBasic = {
    /**
     * The UUID of the external payroll.
     */
    uuid: string;
    /**
     * The UUID of the company.
     */
    companyUuid?: string | undefined;
    /**
     * External payroll's check date.
     */
    checkDate?: string | undefined;
    /**
     * External payroll's pay period start date.
     */
    paymentPeriodStartDate?: string | undefined;
    /**
     * External payroll's pay period end date.
     */
    paymentPeriodEndDate?: string | undefined;
    /**
     * The status of the external payroll. The status will be `unprocessed` when the external payroll is created and transition to `processed` once tax liabilities are entered and finalized.  Once in the `processed` status all actions that can edit an external payroll will be disabled.
     */
    status?: ExternalPayrollBasicStatus | undefined;
};
/** @internal */
export declare const ExternalPayrollBasicStatus$inboundSchema: z.ZodNativeEnum<typeof ExternalPayrollBasicStatus>;
/** @internal */
export declare const ExternalPayrollBasic$inboundSchema: z.ZodType<ExternalPayrollBasic, z.ZodTypeDef, unknown>;
export declare function externalPayrollBasicFromJSON(jsonString: string): SafeParseResult<ExternalPayrollBasic, SDKValidationError>;
//# sourceMappingURL=externalpayrollbasic.d.ts.map