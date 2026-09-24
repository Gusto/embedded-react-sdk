import * as z from "zod/v3";
import { ClosedEnum } from "../../types/enums.js";
/**
 * The bank account type
 */
export declare const CompanyBankAccountRequestAccountType: {
    readonly Checking: "Checking";
    readonly Savings: "Savings";
};
/**
 * The bank account type
 */
export type CompanyBankAccountRequestAccountType = ClosedEnum<typeof CompanyBankAccountRequestAccountType>;
export type CompanyBankAccountRequest = {
    /**
     * The bank routing number
     */
    routingNumber: string;
    /**
     * The bank account number
     */
    accountNumber: string;
    /**
     * The bank account type
     */
    accountType: CompanyBankAccountRequestAccountType;
};
/** @internal */
export declare const CompanyBankAccountRequestAccountType$outboundSchema: z.ZodNativeEnum<typeof CompanyBankAccountRequestAccountType>;
/** @internal */
export type CompanyBankAccountRequest$Outbound = {
    routing_number: string;
    account_number: string;
    account_type: string;
};
/** @internal */
export declare const CompanyBankAccountRequest$outboundSchema: z.ZodType<CompanyBankAccountRequest$Outbound, z.ZodTypeDef, CompanyBankAccountRequest>;
export declare function companyBankAccountRequestToJSON(companyBankAccountRequest: CompanyBankAccountRequest): string;
//# sourceMappingURL=companybankaccountrequest.d.ts.map