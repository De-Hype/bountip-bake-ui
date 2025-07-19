import { StaticImageData } from "next/image";
import { Outlet } from "./outlet";



export enum HistoryType {
  PRICE = "price",
  BULK = "bulk",
}

export interface ProductHistory {
  id: number;
  oldPrice: number;
  newPrice: number;
  changedBy?: string | null;
  role?: string | null;
  historyType: HistoryType;
  changeReason?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bulkData?: any[] | null;
  changedAt: Date;
  product?: Product | null;
  productId?: number | null;
}


export interface Product {
  id: number;
  outletId: number;
  isActive: boolean;
  name: string;
  description: string | null;
  category: string | null;
  price: number | null;
  preparationArea: string | null;
  weight: number | null;
  weightScale: string | null;
  packagingMethod: string[] | null;
  priceTierId: number[] | null;
  allergenList: {
    allergies: string[];
  } | null;
  logoUrl: StaticImageData | string | null;
  logoHash: string | null;
  leadTime: number | null;
  createdAt: Date;
  updatedAt: Date;
  outlet: Outlet;
  priceHistory: ProductHistory[];
}
