export interface BusinessDetails {
  name: string;
  email: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  streetAddress: string;
  businessType: string;
  postalCode: string;
  logo: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: "cash" | "virtual" | "others";
  enabled: boolean;
}

export interface ServiceCharge {
  id: string;
  name: string;
  rate: number;
  includeInMenuPrice: boolean;
  applyAtOrderCheckout: boolean;
  applyForOrderCheckout: boolean;
}

export interface Tax {
  id: string;
  name: string;
  rate: number;
  includeInMenuPrice: boolean;
  applyToAllProducts: boolean;
  applyToOrderCheckout: boolean;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  phone: string;
  isDefault?: boolean;
}

export interface OperatingHours {
  [key: string]: {
    enabled: boolean;
    from: string;
    to: string;
  };
}

export interface PriceTier {
  id: string;
  name: string;
  description?: string;
  markupPercent: number;
  discountPercent: number;
}

export interface LabelSettings {
  shopName: string;
  fontSize: string;
  paperSize: string;
  showPaymentSuccessText: boolean;
  customizeSuccessText: boolean;
  customSuccessMessage: string;
  showSubtotalAtOrderLevel: boolean;
  labelInformation: {
    labelName: boolean;
    orderDate: boolean;
    productName: boolean;
    sku: boolean;
    expiry: boolean;
    batchNumber: boolean;
    manufacturingDate: boolean;
    weight: boolean;
    ingredients: boolean;
    allergens: boolean;
    price: boolean;
  };
}

export interface BusinessLocation {
  id: string;
  name: string;
  address: string;
  phoneNumber: string;
  isDefault: boolean;
}

interface DayHours {
  open: string;
  close: string;
  isActive: boolean;
}

export interface OperatingHoursType {
  sunday: DayHours;
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
}

export enum HubType{
  CENTRAL = 'central',
  OUTLET = 'outlet',
  PROUCTION = 'production',
}
export interface InventoryHubType{
  businessId:string | number;
  name:string;
  description?:string;
  hubType:string;
  address?:string;
  region?:string;
  isActive:boolean
}

export enum TaxApplicationType {
  INCLUDED = "included",
  CHECKOUT = "checkout",
  OPTIONAL = "optional",
}
export enum TaxScopeType {
  PRODUCT = "product",
  CATEGORY = "category",
  ALL = "all",
}

export enum TransferStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  IN_TRANSIT = "in_transit",
  RETURNED = "returned",
}

export enum TransaferMethod {
  PICKUP = "pickup",
  DISPATCH = "dispatch",
  DIRECT = "direct",
}

export enum PrintOrientation {
  PORTRAIT = "portrait",
  LANDSCAPE = "landscape",
}

export enum LabelType {
  PRODUCT = "product",
  BATCH = "batch",
  DISPATCH = "dispatch",
  INVENTORY = "inventory",
}

export enum PrintFormat {
  PDF = "pdf",
  THERMAL = "thermal",
  LASER = "laser",
}

