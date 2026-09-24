import * as z from "zod/v3";
/**
 * Request body for verifying a company bank account with the two micro-deposit amounts.
 */
export type CompanyBankAccountVerifyRequest = {
    /**
     * The first micro-deposit amount (order does not matter).
     */
    deposit1: number;
    /**
     * The second micro-deposit amount (order does not matter).
     */
    deposit2: number;
};
/** @internal */
export type CompanyBankAccountVerifyRequest$Outbound = {
    deposit_1: number;
    deposit_2: number;
};
/** @internal */
export declare const CompanyBankAccountVerifyRequest$outboundSchema: z.ZodType<CompanyBankAccountVerifyRequest$Outbound, z.ZodTypeDef, CompanyBankAccountVerifyRequest>;
export declare function companyBankAccountVerifyRequestToJSON(companyBankAccountVerifyRequest: CompanyBankAccountVerifyRequest): string;
//# sourceMappingURL=companybankaccountverifyrequest.d.ts.map