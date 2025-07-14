export type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type OperatingHour = {
  open: string;
  close: string;
  isActive: boolean;
};

export type PriceTier = {
  id: number;
  name: string;
  description: string;
  pricingRules: {
    markupPercentage?: number;
    discountPercentage?: number;
    fixedMarkup?: number;
    fixedDiscount?: number;
  };
  isActive: boolean;
};

export type ReceiptSettings = {
  customizedLogoUrl: string;
  fontStyle: string;
  paperSize: "80mm" | "A4";
  showBakeryName: boolean;
  showPaymentSuccessText: boolean;
  customSuccessText: string;
  showTotalPaidAtTop: boolean;
  showCustomerName: boolean;
  showOrderName: boolean;
  showOrderTime: boolean;
  showCompanyCashierName:boolean;
  showCompanyPhoneNumber:boolean;
  showCompanyEmail:boolean;
  showCompanyBankDetails:boolean;
  showCompanyBarcode:boolean;
  showModifiedBelowItems:boolean;
  selectedColumns: {
    orderName: boolean;
    sku: boolean;
    qty: boolean;
    subTotal: boolean;
    total: boolean;
  };
  showDiscounts: boolean;
  showTaxDetails: boolean;
  showPaymentMethod: boolean;
  customThankYouMessage: string;

  customHeader: string;
  //showPaymentSuccessText: boolean;
  // customSuccessText: string;
  // showTotalPaidAtTop: boolean;
  // showCustomerName: boolean;
  // showOrderName: boolean;
  // showOrderTime: boolean;
 // showItemList: boolean;
  //showModifiersBelowItems: boolean;
  // displayColumns: string;
  // showDiscounts: boolean;
  // showTaxDetails: boolean;
  // showPaymentMethod: boolean;
  //showTotalAmount: boolean;
  //customThankYouMessage: string;
};

export type LabelSettings = {
  customizedLogoUrl: string;
  paperSize: "80mm" | "A4";
  fontStyle: string;
  showBakeryName: boolean;
  customHeader: string;
  showPaymentSuccessText: boolean;
  customSuccessText: string;
  showTotalPaidAtTop: boolean;
  showLabelName: boolean;
  showLabelType: boolean;
  showProductName: boolean;
  showProductBarCode: boolean;
  showExpiryDate: boolean;
  showBatchNumber: boolean;
  showManufacturingDate: boolean;
  showWeight: boolean;
  showIngredientsSummary: boolean;
  showAllergenInfo: boolean;
  showPrice: boolean;
  customThankYouMessage: string;
};

export type InvoiceSettings = {
  customizedLogoUrl: string;
  fontStyle: string;
  showBakeryName: boolean;
  paperSize: "80mm" | "A4";
  showPaymentSucessText: boolean;
  customizedPaymentSucessText: string;
  showTotalPaidAtTop: boolean;
  showInvoiceNumber: boolean;
  showInvoiceIssueDate: boolean;
  showInvoiceDueDate: boolean;
  showInvoiceClientName: boolean;
  showInvoiceClientAddress: boolean;
  showModifierBelowItems: boolean;
  selectedColumns: {
    orderName: boolean;
    sku: boolean;
    qty: boolean;
    subTotal: boolean;
    total: boolean;
  };
  showDiscountLine: boolean;
  showTax: boolean;
  showShippingFee: boolean;
  showPaymentStatus: boolean;
  showPaymentMethod: boolean;
  showTaxOnOrderReceipt: boolean;
  showTaxOnPaymentReceipt: boolean;
  showAccountDetails: boolean;
  showEmail: boolean;
  showAddress: boolean;
  customThankYouMessage: string;

  // customHeader: string;
  // customFooter: string;
  // // showTaxOnOrderReceipt: boolean;
  // // showTaxOnPaymentReceipt: boolean;
  // // showAccountDetails: boolean;
  // //showEmail: boolean;
  // // showAddress: boolean;
  // customFields: Array<{ name: string; value: string }>;
  // showCustomerName: boolean;
  // showOrderName: boolean;
  // showOrderTime: boolean;
  // showItemList: boolean;
  // showSKU: boolean;
  // showDiscounts: boolean;
  // showTaxDetails: boolean;
  // //showPaymentMethod: boolean;
  // showTotalAmount: boolean;
};

export type GeneralSettings = {
  requireAuthForCartReduction: boolean;
  requireAuthForExistingCartReduction: boolean;
  allowVoidingWithoutAuth: boolean;
  allowGiftingWithoutAuth: boolean;
  allowDeletingWithoutAuth: boolean;
  requireAuthForVirtualTabPayment: boolean;
  requireAuthForSplitPayment: boolean;
  requireAuthForDocketReprinting: boolean;
  requireAuthForDiscountApplication: boolean;
  allowDeletionOfProcessedCartItems: boolean;
};

export type TaxSettings = {
  taxes: Array<{
    id: number;
    name: string;
    rate: number;
    applicationType: "included" | "checkout" | "optional";
    scope: "product" | "category" | "all";
    productIdList?: Array<number> | null;
    categoryIdList?: Array<string> | null;
  }>;
};

export type ServiceCharges = {
  charges: Array<{
    id: number;
    name: string;
    rate: number;
    applicationType: "included" | "checkout" | "optional";
  }>;
};

export type PaymentMethods = {
  methods: Array<{
    id: number;
    name: string;
    isActive: boolean;
  }>;
};

export type Outlet = {
  id: number;
  businessId: number;
  name: string;
  description: string | null;
  address: string | null;
  state: string | null;
  //Just Added
  city?:string
  email?:string
  postalCode: string | null;
  phoneNumber: string | null;
  country: string | null;
  isMainLocation: boolean;
  isActive: boolean;
  operatingHours: Record<Weekday, OperatingHour>;
  logoUrl: string | null;
  taxSettings: TaxSettings | null;
  serviceCharges: ServiceCharges | null;
  paymentMethods: PaymentMethods | null;
  priceTier: PriceTier[];
  receiptSettings: ReceiptSettings | null;
  labelSettings: LabelSettings | null;
  invoiceSettings: InvoiceSettings | null;
  generalSettings: GeneralSettings | null;
  currency: string | null;
  createdAt: string;
  updatedAt: string;
};

export enum AccessType {
  ADMIN = "admin",
  SUPER_AMDIN = "super_admin",
}

export type OutletAccess = {
  outlet: Outlet;
  accessType: AccessType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  permissions: any;
};
