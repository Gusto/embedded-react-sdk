import * as z from "zod/v3";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
export type ActiveCompanies = {
    /**
     * unique identifier for the company associated with the invoice data
     */
    companyUuid?: string | undefined;
    /**
     * The number of active employees the company was or will be invoiced for that invoice period. Active employees are calculated as the count of onboarded employees hired before the end of the invoice period and not terminated before the start of the invoice period.
     */
    activeEmployees?: number | undefined;
    /**
     * The number of active contractors the company was or will be invoiced for that invoice period. Active contractors are calculated as any contractor with an active contractor payment during the invoice period.
     */
    activeContractors?: number | undefined;
    /**
     * The first invoice period for the company. This will either be the invoice period of the first invoice-able event (first payroll or contractor payment) or the date they migrated to embedded, whichever is later.
     */
    initialInvoicePeriod?: string | undefined;
};
/**
 * Representation of a partners invoice data
 */
export type InvoiceData = {
    /**
     * The list of companies that are active within the invoice period
     */
    activeCompanies?: Array<ActiveCompanies> | undefined;
};
/** @internal */
export declare const ActiveCompanies$inboundSchema: z.ZodType<ActiveCompanies, z.ZodTypeDef, unknown>;
export declare function activeCompaniesFromJSON(jsonString: string): SafeParseResult<ActiveCompanies, SDKValidationError>;
/** @internal */
export declare const InvoiceData$inboundSchema: z.ZodType<InvoiceData, z.ZodTypeDef, unknown>;
export declare function invoiceDataFromJSON(jsonString: string): SafeParseResult<InvoiceData, SDKValidationError>;
//# sourceMappingURL=invoicedata.d.ts.map