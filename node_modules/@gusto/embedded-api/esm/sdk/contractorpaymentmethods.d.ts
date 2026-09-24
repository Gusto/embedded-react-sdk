import { ClientSDK, RequestOptions } from "../lib/sdks.js";
import { PostV1ContractorsContractorUuidBankAccountsRequest, PostV1ContractorsContractorUuidBankAccountsResponse } from "../models/operations/postv1contractorscontractoruuidbankaccounts.js";
export declare class ContractorPaymentMethods extends ClientSDK {
    /**
     * Create a contractor bank account
     *
     * @remarks
     * Creates a contractor bank account.
     *
     * Note: We currently only support one bank account per contractor. Using this endpoint on a contractor who already has a bank account will just replace it.
     *
     * scope: `contractor_payment_methods:write`
     */
    createBankAccount(request: PostV1ContractorsContractorUuidBankAccountsRequest, options?: RequestOptions): Promise<PostV1ContractorsContractorUuidBankAccountsResponse>;
}
//# sourceMappingURL=contractorpaymentmethods.d.ts.map