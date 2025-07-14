import { HttpService } from "./httpService";
import { COOKIE_NAMES } from "@/utils/cookiesUtils";
import {
  InventoryHubType,
  OperatingHoursType,
  TaxApplicationType,
  TaxScopeType,
} from "@/types/settingTypes";

function getLabelEnabled(
  labelItems: { name: string; enabled: boolean }[],
  label: string
): boolean {
  return labelItems.find((item) => item.name === label)?.enabled ?? false;
}

class SettingsService {
  private request = new HttpService();
  async updateBusinessDetails(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any,
    outletId: number | number
  ) {
    return this.request.patch(
      `/outlet/${outletId}`,
      {
        name: data.name,
        address: data.address,
        phoneNumber: data.phone,
        city: data.city,
        state: data.state,
        country: data.country,
        postalCode: data.postalCode,
        businessType: data.businessType,
        logoUrl: data.logoUrl,
        currency: data.currency,
        revenueRange: data.revenueRange,
      },
      COOKIE_NAMES.BOUNTIP_LOGIN_USER_TOKENS
    );
  }

  async updateOperatingHours(
    outletId: number | string,
    data: OperatingHoursType
  ) {
    return this.request.patch(
      `/outlet/${outletId}/operating-hours`,
      data,
      COOKIE_NAMES.BOUNTIP_LOGIN_USER_TOKENS
    );
  }

  async addNewBusinessLocation({
    businessId,
    name,
    address,
    phoneNumber,
  }: {
    businessId: number;
    name: string;
    address: string;
    phoneNumber: string;
  }) {
    return this.request.post(
      `/outlet`,
      { businessId, name, address, phoneNumber },
      COOKIE_NAMES.BOUNTIP_LOGIN_USER_TOKENS
    );
  }

  async updatePasswordSettings(data: {
    oldPassword: string;
    newPassword: string;
  }) {
    return this.request.patch(
      `/auth/change-password`,
      {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      },
      COOKIE_NAMES.BOUNTIP_LOGIN_USER_TOKENS
    );
  }

  async addPriceTier({
    outletId,
    name,
    description,
    pricingRules,
    isActive,
  }: {
    outletId: number;
    name: string;
    description?: string;
    pricingRules?: {
      markupPercentage?: number;
      discountPercentage?: number;
      fixedMarkup?: number;
      fixedDiscount?: number;
    };
    isActive?: boolean;
  }) {
    return this.request.post(
      `/outlet/${outletId}/price-tier`,
      { name, description, pricingRules, isActive },
      COOKIE_NAMES.BOUNTIP_LOGIN_USER_TOKENS
    );
  }

  async deletePriceTier({
    outletId,
    priceTierId,
  }: {
    outletId: number | string;
    priceTierId: number | string;
  }) {
    return this.request.delete(
      `/outlet/${outletId}/price-tier/${priceTierId}`,

      COOKIE_NAMES.BOUNTIP_LOGIN_USER_TOKENS
    );
  }

  async addInventoryHub({
    businessId,
    name,
    address,
    hubType,
  }: Pick<InventoryHubType, "address" | "businessId" | "name" | "hubType">) {
    return this.request.post(
      `/inventory-hubs`,
      {
        businessId,
        name,
        address,
        hubType,
      },
      COOKIE_NAMES.BOUNTIP_LOGIN_USER_TOKENS
    );
  }

  async createTax(
    outletId: string | number,
    name: string,
    rate: number,
    applicationType: TaxApplicationType,
    scope: TaxScopeType,
    categoryIdList?: string[],
    productIdList?:number[]
  ) {
    return this.request.post(
      `/outlet/${outletId}/taxes`,
      { name, rate, applicationType, scope, categoryIdList, productIdList },
      COOKIE_NAMES.BOUNTIP_LOGIN_USER_TOKENS
    );
  }

  async editTax(
    outletId: string | number,
    tierId: string | number,
    name: string,
    rate: number,
    applicationType: TaxApplicationType
  ) {
    return this.request.patch(
      `/outlet/${outletId}/taxes/${tierId}`,
      { name, rate, applicationType },
      COOKIE_NAMES.BOUNTIP_LOGIN_USER_TOKENS
    );
  }

  async deleteTax(outletId: string | number, tierId: string | number) {
    return this.request.delete(
      `/outlet/${outletId}/taxes/${tierId}`,
      COOKIE_NAMES.BOUNTIP_LOGIN_USER_TOKENS
    );
  }

  async createCharges(
    outletId: string | number,
    name: string,
    rate: number | string,
    applicationType: TaxApplicationType
  ) {
    return this.request.post(
      `/outlet/${outletId}/service-charges`,
      { name, rate, applicationType },
      COOKIE_NAMES.BOUNTIP_LOGIN_USER_TOKENS
    );
  }

  async editCharges(
    outletId: string | number,
    chargeId: string | number,
    name: string,
    rate: number,
    applicationType: TaxApplicationType
  ) {
    return this.request.post(
      `/outlet/${outletId}/service-charges/${chargeId}`,
      { name, rate, applicationType },
      COOKIE_NAMES.BOUNTIP_LOGIN_USER_TOKENS
    );
  }

  async deleteCharges(outletId: string | number, chargeId: string | number) {
    return this.request.post(
      `/outlet/${outletId}/service-charges/${chargeId}`,
      COOKIE_NAMES.BOUNTIP_LOGIN_USER_TOKENS
    );
  }
  async updateLabelSettings(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formData: any,
    outletId: string | number,
    imageUrl: string
  ) {
    const payload = {
      customizedLogoUrl: imageUrl, // Set this if you have it
      paperSize: formData.paperSize === "tape" ? "80mm" : "A4",
      fontStyle: "Arial", // or whatever default/font picker value you're using
      showBakeryName: formData.showBakeyName,
      customHeader: formData.header,
      showPaymentSuccessText: formData.showPaymentSuccess,
      customSuccessText: formData.customBusinessText,
      showTotalPaidAtTop: formData.showBusinessLine,
      showLabelName: getLabelEnabled(formData.labelItems, "Label Name"),
      showLabelType: getLabelEnabled(formData.labelItems, "Label Type"),
      showProductName: getLabelEnabled(formData.labelItems, "Product Name"),
      showProductBarCode: getLabelEnabled(formData.labelItems, "Barcode"),
      showExpiryDate: getLabelEnabled(formData.labelItems, "Best Before"),
      showWeight: getLabelEnabled(formData.labelItems, "Product Weight"),
      showBatchNumber: getLabelEnabled(formData.labelItems, "Best Number"),
      showManufacturingDate: getLabelEnabled(
        formData.labelItems,
        "ManufacturedDate"
      ),
      showIngredientsSummary: getLabelEnabled(
        formData.labelItems,
        "Business Summary"
      ),
      showAllergenInfo: getLabelEnabled(formData.labelItems, "Allergen"),
      showPrice: getLabelEnabled(formData.labelItems, "Price"),
      customThankYouMessage: formData.customMessage,
    };

    return this.request.patch(
      `/outlet/${outletId}/label-settings`,
      payload,
      COOKIE_NAMES.BOUNTIP_LOGIN_USER_TOKENS
    );
  }

  // Utility function to extract enabled status
}

const settingsService = new SettingsService();
export default settingsService;
