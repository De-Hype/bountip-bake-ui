"use client";
import AssetsFiles from "@/assets";
import { Switch } from "@/components/Modals/Settings/ui/Switch";
import BulkUploadHistory from "@/components/ProductionManagement/BulkUploadHistory";
import CreateProductModals from "@/components/ProductionManagement/CreateProductModals";
import EditProductModals from "@/components/ProductionManagement/EditProductModal";
import ProductCatalog from "@/components/ProductionManagement/ProductCatalog";
import ProductCatalogGrid from "@/components/ProductionManagement/ProductCatalogGrid";
import ProductFilters from "@/components/ProductionManagement/ProductFilters";
import UploadCsvModal from "@/components/ProductionManagement/UploadCsvModal";
import { useSelectedOutlet } from "@/hooks/useSelectedOutlet";
import { useProductManagementStore } from "@/stores/useProductManagementStore";
import { useQuery } from "@tanstack/react-query";
import productManagementService from "@/services/productManagementService";
import { SystemDefaults } from "@/types/systemDefaults";
import {
  Clock3,
  CloudUpload,
  LayoutGrid,
  List,
  Plus,
  Search,
  Share2,
  SlidersHorizontal,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

const ProductionManagement = () => {
  const [selectedView, setSelectedView] = useState<"list" | "card">("list");
  const [hideImages, setHideImages] = useState<boolean>(false);
  const [showFilter, setShowFilter] = useState<boolean>(false);
  const [showBulkUpload, setShowBulkUpload] = useState<boolean>(false);
  const [showUploadCSV, setShowUploadCSV] = useState<boolean>(false);
  const [showBulkUploadHistory, setShowBulkUploadHistory] =
    useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");
  const [showCreateProductModal, setShowCreateProductModal] =
    useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const { productClicked } = useProductManagementStore();

  const selectedOutlet = useSelectedOutlet();
  const outletId = selectedOutlet?.outlet.id;

  // Refetch products on search by changing query key
  const handleSearchProduct = useCallback(() => {
    setIsSearching(true);
    // No need to manually fetch, react-query will refetch due to queryKey change
    setTimeout(() => setIsSearching(false), 500); // Simulate loading
  }, []);

  // Handle search on Enter key press
  const handleSearchKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSearchProduct();
      }
    },
    [handleSearchProduct]
  );

  // Fetch products with react-query
  const currentPage = 1; // Replace with state if pagination is needed
  const {
    data: productsData,
    isLoading: isProductsLoading,
    isError: isProductsError,
    error: productsError,
  } = useQuery({
    queryKey: ["products", outletId, currentPage, searchText],
    queryFn: () =>
      outletId
        ? productManagementService.fetchProducts(outletId, {
            page: currentPage,
            search: searchText,
          })
        : Promise.resolve({
            status: false,
            data: { data: [], meta: { totalPages: 1, total: 0 } },
          }),
    enabled: !!outletId,
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ["categories", outletId],
    queryFn: () =>
      outletId
        ? productManagementService.fetchSystemDefaults(
            SystemDefaults.CATEGORY,
            outletId
          )
        : Promise.resolve({ status: false, data: { data: [] } }),
    enabled: !!outletId,
  });

  // Fetch preparation areas
  const { data: prepAreaData } = useQuery({
    queryKey: ["preparationArea", outletId],
    queryFn: () =>
      outletId
        ? productManagementService.fetchSystemDefaults(
            SystemDefaults.PREPARATION_AREA,
            outletId
          )
        : Promise.resolve({ status: false, data: { data: [] } }),
    enabled: !!outletId,
  });

  // Fetch packaging methods
  const { data: packagingData } = useQuery({
    queryKey: ["packagingMethod", outletId],
    queryFn: () =>
      outletId
        ? productManagementService.fetchSystemDefaults(
            SystemDefaults.PACKAGING_METHOD,
            outletId
          )
        : Promise.resolve({ status: false, data: { data: [] } }),
    enabled: !!outletId,
  });

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".bulk-upload-dropdown")) {
        setShowBulkUpload(false);
      }
      if (!target.closest(".filter-dropdown")) {
        setShowFilter(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBulkUploadToggle = useCallback(() => {
    setShowBulkUpload((prev) => !prev);
  }, []);

  const handleUploadCSV = useCallback(() => {
    setShowUploadCSV(true);
    setShowBulkUpload(false);
  }, []);

  const handleViewUploadHistory = useCallback(() => {
    setShowBulkUploadHistory(true);
    setShowBulkUpload(false);
  }, []);

  const handleFilterToggle = useCallback(() => {
    setShowFilter((prev) => !prev);
  }, []);

  const handleCreateProduct = useCallback(() => {
    setShowCreateProductModal(true);
  }, []);

  return (
    <section className="mx-3.5 my-[20px]">
      {showBulkUploadHistory ? (
        <BulkUploadHistory
          isOpen={showBulkUploadHistory}
          onClose={() => setShowBulkUploadHistory(false)}
        />
      ) : (
        <>
          <div className="flex items-center justify-between gap-8 my-2.5">
            <div className="flex items-center gap-2">
              <div className="bg-[#15BA5C] flex items-center justify-center w-[58px] h-[58px] rounded-full">
                <Image
                  src={AssetsFiles.ProductionManagementIcon}
                  alt="Production Management"
                  className="h-[28px] w-[28px]"
                />
              </div>

              <div className="text-[#1C1B20]">
                <h3 className="font-bold text-xl">Product Management</h3>
                <p className="text-[#737373] text-[15px]">
                  Create, organize, and manage all your bakery products in one
                  place
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative bulk-upload-dropdown">
                <button
                  className="flex items-center bg-white border border-[#15BA5C] px-4 py-2 rounded-xl hover:bg-[#15BA5C] hover:text-white transition-colors group"
                  type="button"
                  onClick={handleBulkUploadToggle}
                  aria-expanded={showBulkUpload}
                  aria-haspopup="true"
                >
                  <CloudUpload className="text-[#15BA5C] group-hover:text-white text-[15px]" />
                  <span className="text-[#15BA5C] group-hover:text-white font-normal text-[14px] ml-2 text-nowrap">
                    Bulk Upload
                  </span>
                </button>
                {showBulkUpload && (
                  <div className="absolute top-12 -right-4 bg-[#1C1B20] z-10 shadow-md rounded-lg min-w-[160px]">
                    <button
                      className="w-full flex items-center text-[#15BA5C] px-3 py-2.5 hover:bg-[#2C2B30] transition-colors"
                      type="button"
                      onClick={handleUploadCSV}
                    >
                      <CloudUpload className="h-[15px]" />
                      <span className="font-normal text-[14px] ml-2 text-nowrap">
                        Upload CSV
                      </span>
                    </button>
                    <hr className="border-[#898989]" />
                    <button
                      className="w-full flex items-center text-[#15BA5C] px-3 py-2.5 hover:bg-[#2C2B30] transition-colors"
                      type="button"
                      onClick={handleViewUploadHistory}
                    >
                      <Clock3 className="h-[15px]" />
                      <span className="font-normal text-[14px] ml-2 text-nowrap">
                        View Upload History
                      </span>
                    </button>
                  </div>
                )}
              </div>

              <button
                className="flex items-center bg-white border border-[#15BA5C] px-4 py-2 rounded-xl hover:bg-[#15BA5C] hover:text-white transition-colors group"
                type="button"
              >
                <Share2 className="text-[#15BA5C] group-hover:text-white text-[15px]" />
                <span className="text-[#15BA5C] group-hover:text-white font-normal text-[14px] ml-2 text-nowrap">
                  Export
                </span>
              </button>

              <button
                className="flex items-center text-white px-4 py-2 rounded-xl bg-[#15BA5C] hover:bg-[#129B4D] transition-colors"
                type="button"
                onClick={handleCreateProduct}
              >
                <Plus className="text-[15px]" />
                <span className="font-normal text-[14px] ml-2 text-nowrap">
                  Create a Product
                </span>
              </button>
            </div>
          </div>

          <div className="bg-white flex flex-col gap-3.5 shadow-md rounded-[10px] my-2">
            <div className="text-[#1C1B20] flex items-center justify-between gap-4 p-4">
              <h3 className="font-normal text-[18px]">All Products</h3>
              <div className="flex items-center gap-4">
                <div className="relative border rounded-[10px] border-[#E7E7E7] flex">
                  <input
                    placeholder="Search by Product name, category...."
                    type="text"
                    name="searchProduct"
                    id="searchProduct"
                    className="outline-none border-none text-sm px-3.5 py-2 min-w-[250px]"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onKeyDown={handleSearchKeyPress}
                  />
                  <button
                    onClick={handleSearchProduct}
                    className="bg-[#15BA5C] h-[38px] rounded-tr-[10px] rounded-br-[10px] px-2.5 hover:bg-[#129B4D] transition-colors disabled:opacity-50"
                    type="button"
                    disabled={isSearching}
                  >
                    <Search className="h-[20px] text-white" />
                  </button>
                </div>

                {selectedView === "card" && (
                  <button
                    className="border border-[#E7E7E7] px-2.5 py-2 flex items-center rounded-[10px] gap-2.5 hover:bg-gray-50 transition-colors"
                    type="button"
                  >
                    <span className="text-base">Hide Images</span>
                    <Switch checked={hideImages} onChange={setHideImages} />
                  </button>
                )}

                <div className="relative filter-dropdown">
                  <button
                    className="border border-[#E7E7E7] px-2.5 py-2 flex items-center rounded-[10px] gap-2.5 hover:bg-gray-50 transition-colors"
                    type="button"
                    onClick={handleFilterToggle}
                    aria-expanded={showFilter}
                    aria-haspopup="true"
                  >
                    <span className="text-base">Filters</span>
                    <SlidersHorizontal className="h-[16px]" />
                  </button>
                  {showFilter && (
                    <div className="absolute w-[360px] top-9 -right-4 bg-white z-10 p-4 shadow-md rounded-lg border border-[#E7E7E7]">
                      <ProductFilters />
                    </div>
                  )}
                </div>

                <div className="bg-[#FAFAFC] border border-[#E6E6E6] rounded-md flex items-center gap-3.5 p-1">
                  <button
                    type="button"
                    onClick={() => setSelectedView("list")}
                    className={`flex items-center gap-1 px-3 py-1 rounded-md transition-colors ${
                      selectedView === "list"
                        ? "bg-white shadow-sm"
                        : "bg-transparent hover:bg-gray-100"
                    }`}
                  >
                    <List className="h-[16px]" />
                    <span>Lists</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedView("card")}
                    className={`flex items-center gap-1 px-3 py-1 rounded-md transition-colors ${
                      selectedView === "card"
                        ? "bg-white shadow-sm"
                        : "bg-transparent hover:bg-gray-100"
                    }`}
                  >
                    <LayoutGrid className="h-[16px]" />
                    <span>Card View</span>
                  </button>
                </div>
              </div>
            </div>

            {selectedView === "list" ? (
              <ProductCatalog />
            ) : (
              <ProductCatalogGrid hideImages={hideImages} />
            )}
          </div>

          {productClicked && (
            <EditProductModals isOpen={productClicked} size="md" />
          )}

          {showCreateProductModal && (
            <CreateProductModals
              onClose={() => setShowCreateProductModal(false)}
              isOpen={showCreateProductModal}
              size="md"
            />
          )}

          <UploadCsvModal
            isOpen={showUploadCSV}
            onClose={() => setShowUploadCSV(false)}
            size="md"
          />
        </>
      )}
    </section>
  );
};

export default ProductionManagement;
