import { COOKIE_NAMES } from "@/utils/cookiesUtils";
import { HttpService } from "./httpService";
import { Product } from "@/types/product";
import { SystemDefaults } from "@/types/systemDefaults";

class ProductManagementService {
  private request = new HttpService();
  async createProduct(
    outletId: number,
    data: Pick<
      Product,
      | "name"
      | "description"
      | "price"
      | "category"
      | "isActive"
      | "preparationArea"
      | "priceTierId"
      | "allergenList"
      | "logoUrl"
      | "weightScale"
      | "weight"
      | "leadTime"
      // | "packagingArea"
    >
  ) {
    return this.request.post(
      `/outlets/${outletId}/products`,
      {
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        isActive: data.isActive,
        preparationArea: data.preparationArea,
        priceTierId: data.priceTierId,
        allergenList: {
          allergies: data.allergenList?.allergies,
        },
        logoUrl: data.logoUrl,
        weightScale: data.weightScale,
        weight: data.weight,
        leadTime: data.leadTime,
        // packagingArea: data.packagingArea,
      },
      COOKIE_NAMES.BOUNTIP_LOGIN_USER_TOKENS
    );
  }

  async fetchProducts(
    outletId: number,
    options?: {
      page?: number;
      limit?: number;
      search?: string;
      category?: string;
      isActive?: boolean;
    }
  ) {
    const params = new URLSearchParams();

    if (options?.page !== undefined)
      params.append("page", options.page.toString());
    if (options?.limit !== undefined)
      params.append("limit", options.limit.toString());
    if (options?.search) params.append("search", options.search);
    if (options?.category) params.append("category", options.category);
    if (options?.isActive !== undefined)
      params.append("isActive", options.isActive.toString());

    const queryString = params.toString() ? `?${params.toString()}` : "";

    return this.request.get(
      `/outlets/${outletId}/products${queryString}`,
      COOKIE_NAMES.BOUNTIP_LOGIN_USER_TOKENS
    );
  }

  async deleteProduct(outletId: number, productId: number) {
    return this.request.delete(
      `/outlets/${outletId}/products/${productId}`,
      null,
      COOKIE_NAMES.BOUNTIP_LOGIN_USER_TOKENS
    );
  }

  async updateProduct(
    outletId: number,
    productId: number,
    data: Pick<
      Product,
      | "name"
      | "description"
      | "price"
      | "category"
      | "isActive"
      | "preparationArea"
      | "priceTierId"
      | "allergenList"
      | "logoUrl"
      | "weightScale"
      | "weight"
      | "leadTime"
      // Removed "packagingArea" as it is not a key of Product
    >
  ) {
    return this.request.patch(
      `/outlets/${outletId}/products/${productId}`,
      {
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        isActive: data.isActive,
        preparationArea: data.preparationArea,
        priceTierId: data.priceTierId,
        allergenList: {
          allergies: data.allergenList?.allergies,
        },
        logoUrl: data.logoUrl,
        weightScale: data.weightScale,
        weight: data.weight,
        leadTime: data.leadTime,
       // packagingArea: data.packagingArea,
      },
      COOKIE_NAMES.BOUNTIP_LOGIN_USER_TOKENS
    );
  }

  async fetchProductPriceHistory(
    outletId: number,
    productId: number,
    options?: {
      page?: number;
      limit?: number;
    }
  ) {
    const params = new URLSearchParams();

    if (options?.page !== undefined)
      params.append("page", options.page.toString());
    if (options?.limit !== undefined)
      params.append("limit", options.limit.toString());

    const queryString = params.toString() ? `?${params.toString()}` : "";

    return this.request.get(
      `/outlets/${outletId}/products/${productId}/history${queryString}`,
      COOKIE_NAMES.BOUNTIP_LOGIN_USER_TOKENS
    );
  }

  async fetchSystemDefaults(key: SystemDefaults, outletId: number | string) {
    return await this.request.get(
      `/${outletId}/system-defaults/${key}`,
      COOKIE_NAMES.BOUNTIP_LOGIN_USER_TOKENS
    );
  }

  async createSystemDefaults(
    key: SystemDefaults,
    item: string,
    outletId: number
  ) {
    return await this.request.post(
      `/${outletId}/system-defaults/${key}/data`,
      {
        item: {
          name: item,
        },
      },
      COOKIE_NAMES.BOUNTIP_LOGIN_USER_TOKENS
    );
  }

  async deleteSystemDefaults(
    key: SystemDefaults,
    item: string,
    outletId: number
  ) {
    return await this.request.delete(
      `/${outletId}/system-defaults/${key}/data`,
      {
        item: {
          name: item,
        },
      },
      COOKIE_NAMES.BOUNTIP_LOGIN_USER_TOKENS
    );
  }
}

const productManagementService = new ProductManagementService();
export default productManagementService;
