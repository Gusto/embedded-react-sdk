import { ClientSDK, RequestOptions } from "../lib/sdks.js";
import { GetV1ContractorsContractorUuidBankAccountsRequest, GetV1ContractorsContractorUuidBankAccountsResponse } from "../models/operations/getv1contractorscontractoruuidbankaccounts.js";
import { GetV1ContractorsContractorUuidPaymentMethodRequest, GetV1ContractorsContractorUuidPaymentMethodResponse } from "../models/operations/getv1contractorscontractoruuidpaymentmethod.js";
import { PutV1ContractorsContractorIdPaymentMethodRequest, PutV1ContractorsContractorIdPaymentMethodResponse } from "../models/operations/putv1contractorscontractoridpaymentmethod.js";
export declare class ContractorPaymentMethod extends ClientSDK {
    /**
     * Get all contractor bank accounts
     *
     * @remarks
     * Returns all contractor bank accounts.
     *
     * scope: `contractor_payment_methods:read`
     */
    getBankAccounts(request: GetV1ContractorsContractorUuidBankAccountsRequest, options?: RequestOptions): Promise<GetV1ContractorsContractorUuidBankAccountsResponse>;
    /**
     * Get a contractor's payment method
     *
     * @remarks
     * Fetches a contractor's payment method. A contractor payment method
     * describes how the payment should be split across the contractor's associated
     * bank accounts.
     *
     * scope: `contractor_payment_methods:read`
     */
    get(request: GetV1ContractorsContractorUuidPaymentMethodRequest, options?: RequestOptions): Promise<GetV1ContractorsContractorUuidPaymentMethodResponse>;
    /**
     * Update a contractor's payment method
     *
     * @remarks
     * Updates a contractor's payment method. Note that creating a contractor
     * bank account will also update the contractor's payment method.
     *
     * scope: `contractor_payment_methods:write`
     */
    update(request: PutV1ContractorsContractorIdPaymentMethodRequest, options?: RequestOptions): Promise<PutV1ContractorsContractorIdPaymentMethodResponse>;
}
//# sourceMappingURL=contractorpaymentmethod.d.ts.map