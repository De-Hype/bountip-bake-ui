import { OnboardBusinessData } from "@/types/businessTypes";
import { HttpService } from "./httpService";
import { COOKIE_NAMES } from "@/utils/cookiesUtils";

class BusinessService {
  private request = new HttpService();

  async onboardBusiness(data: OnboardBusinessData, cookieName:COOKIE_NAMES) {
    return this.request.post(
      "/business/onboard",
      {
        businessId: data.businessId,
        outletId: data.outletId,
        country: data.country,
        logoUrl: data.logoUrl,
        address: data.address,
        businessType: data.businessType,
        currency: data.currency,
        revenueRange: data.revenueRange,
      },
      cookieName
      //"bountipRegisteredUsers"
    );
  }

  async getUserBusiness(cookieName= COOKIE_NAMES.BOUNTIP_REGISTERED_USERS) {
    return this.request.get("/business", cookieName);
  }
}

export const businessService = new BusinessService();
