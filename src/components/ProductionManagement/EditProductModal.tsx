/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
"use client";
import { Clock3, Plus, Tag, Trash, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Switch } from "../Modals/Settings/ui/Switch";
import { DropdownSelector } from "./ui/DropdownSelector";
import FileUploadComponent from "../Upload/FileUploadComponent";
import getWidthClass from "@/utils/getWidthClass";
import productManagementService from "@/services/productManagementService";
import { ApiResponseType } from "@/types/httpTypes";
import Image from "next/image";
import AssetsFiles from "@/assets";
import { useProductManagementStore } from "@/stores/useProductManagementStore";
import { toast } from "sonner";
import { useSelectedOutlet } from "@/hooks/useSelectedOutlet";
// import Pagination from "../Pagination/Pagination";
import { formatDate } from "@/utils/getTimers";
import { calculateTierPrice } from "@/utils/pricingRule";

interface EditProductModalsProps {
  size?: "sm" | "md" | "lg" | "xl" | "full" | number;
  isOpen: boolean;
}

const units = ["Mg", "Kg", "T"];

interface ProductFormData {
  productName: string;
  category: string;
  sellingPrice: string;
  hasPriceTiers: boolean;
  priceTiers: PricingTier[];
  description: string;
  preparationArea: string;
  hasAllergens: boolean;
  allergens: Allergen[];
  leadTimeHours: string;
  leadTimeMinutes: string;
  leadTimeSeconds: string;
  weight: string;
  weightUnit: string;
  packagingMethod: string;
  imageUrl: string;
}

interface PricingTier {
  id: string;
  label: string;
  price: string;
  checked: boolean;
}

interface Allergen {
  id: string;
  name: string;
  isSelected: boolean;
}

const tabs = [
  { id: "basic", label: "Basic Information" },
  { id: "price", label: "Price History" },
] as const;

const EditProductModals: React.FC<EditProductModalsProps> = ({
  isOpen,
  size = "md",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [showDeleteProductModal, setShowDeleteProductModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isDeleting, setIsDeleting] = useState(false);

  // Zustand store
  const {
    setProductClicked,
    selectedProduct,
    deleteProduct,
    updateProduct,
    addProduct,
    fetchProductPriceHistory,
    categories,
    preparationArea,
    packagingMethod,
    selectedProductPriceHistory,
  } = useProductManagementStore();

  const [activeTab, setActiveTab] = useState<"basic" | "price">("basic");
  const outlet = useSelectedOutlet();
  const outletId = outlet?.outlet.id;
  console.log(outletId);
const outletsData= useSelectedOutlet()
console.log(outletsData?.outlet.priceTier, "This is the businessDATA")

  // Form data state
  const [formData, setFormData] = useState<ProductFormData>({
    productName: "",
    category: "",
    sellingPrice: "",
    hasPriceTiers: false,
    priceTiers: [], // Start with empty array, will be populated from outlet data
    description: "",
    preparationArea: "",
    hasAllergens: false,
    allergens: [
      { id: "1", name: "Cereals", isSelected: true },
      { id: "2", name: "Crustaceans", isSelected: false },
      { id: "3", name: "Eggs", isSelected: true },
      { id: "4", name: "Fish", isSelected: false },
      { id: "5", name: "Peanuts", isSelected: false },
      { id: "6", name: "Soybeans", isSelected: false },
      { id: "7", name: "Milk", isSelected: false },
      { id: "8", name: "Mollusks", isSelected: false },
      { id: "9", name: "Nuts", isSelected: false },
      { id: "10", name: "Celery", isSelected: false },
      { id: "11", name: "Mustard", isSelected: false },
      { id: "12", name: "Sesame seed", isSelected: false },
      { id: "13", name: "Sulphur dioxide and sulphites", isSelected: false },
      { id: "14", name: "Lupin", isSelected: false },
    ],
    leadTimeHours: "",
    leadTimeMinutes: "",
    leadTimeSeconds: "",
    weight: "",
    weightUnit: "Kg",
    packagingMethod: "",
    imageUrl: "",
  });

  useEffect(() => {
    if (outletsData?.outlet.priceTier) {
      const availablePriceTiers = outletsData.outlet.priceTier.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (tier: any) => ({
          id: tier.id,
          name: tier.name,
          description: tier.description,
          pricingRules: tier.pricingRules,
          isActive: tier.isActive,
          checked: selectedProduct?.priceTierId === tier.id, // Check if this tier is selected for the product
        })
      );

      setFormData((prev) => ({
        ...prev,
        priceTiers: availablePriceTiers,
      }));
    }
  }, [outletsData?.outlet.priceTier, selectedProduct?.priceTierId]);
  

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUnitSelect = (unit: string) => {
    handleInputChange("weightUnit", unit);
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      const timeout = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timeout);
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    interface MouseEvent {
      target: EventTarget | null;
    }

    function handleClickOutside(event: MouseEvent): void {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (selectedProduct?.id) {
      fetchProductPriceHistory(selectedProduct.id);
    }
    if (selectedProduct) {
      console.log(selectedProduct);

      // Get available price tiers from outlet data
      const availablePriceTiers =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        outletsData?.outlet.priceTier?.map((tier: any) => ({
          id: tier.id,
          name: tier.name,
          description: tier.description,
          pricingRules: tier.pricingRules,
          isActive: tier.isActive,
          checked: selectedProduct.priceTierId === tier.id, // Check if this tier is selected
        })) || [];
        console.log(selectedProduct, 'This is the selected product')

      setFormData({
        productName: selectedProduct.name,
        category: selectedProduct.category,
        sellingPrice: selectedProduct.price?.toString() || "",
        hasPriceTiers: !!selectedProduct.priceTierId,
        priceTiers: availablePriceTiers,
        description: selectedProduct.description || "",
        preparationArea: selectedProduct.preparationArea || "",
        hasAllergens: !!selectedProduct.allergenList,
        allergens: selectedProduct.allergenList,
        leadTimeHours:
          Math.floor((selectedProduct.leadTime || 0) / 3600).toString() || "",
        leadTimeMinutes:
          Math.floor(
            ((selectedProduct.leadTime || 0) % 3600) / 60
          ).toString() || "",
        leadTimeSeconds:
          ((selectedProduct.leadTime || 0) % 60).toString() || "",
        weight: selectedProduct.weight?.toString() || "",
        weightUnit: selectedProduct.weightScale || "Kg",
        packagingMethod: selectedProduct.packagingArea || "",
        imageUrl: selectedProduct.logoUrl as string,
      });
    }
  }, [
    fetchProductPriceHistory,
    selectedProduct,
    outletsData?.outlet.priceTier,
  ]);
  
  

  if (!isOpen && !isVisible) return null;

  const handleProductSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Get the selected price tier ID
    const selectedPriceTier = formData.priceTiers.find((tier) => tier.checked);
    const selectedPriceTierId = selectedPriceTier ? selectedPriceTier.id : null;

    // VALIDATION STEP
    const requiredFields = [
      "productName",
      "category",
      "sellingPrice",
      "preparationArea",
      "leadTimeHours",
      "leadTimeMinutes",
      "leadTimeSeconds",
      "weight",
      "weightUnit",
      "packagingMethod",
    ];

    const emptyFields = requiredFields.filter((field) => {
      const value = formData[field as keyof ProductFormData];
      return value === "" || value === null || value === undefined;
    });

    if (emptyFields.length > 0) {
      toast.error(`Please fill all required fields: ${emptyFields.join(", ")}`);
      return;
    }

    // Optional: Additional numeric validation
    if (isNaN(parseFloat(formData.sellingPrice))) {
      toast.error("Selling price must be a valid number.");
      return;
    }

    if (isNaN(parseFloat(formData.weight))) {
      toast.error("Weight must be a valid number.");
      return;
    }

    // CREATE PRODUCT OBJECT
    const productData = {
      name: formData.productName,
      description: formData.description || null,
      category: formData.category,
      price: parseFloat(formData.sellingPrice),
      preparationArea: formData.preparationArea,
      priceTierId: selectedPriceTierId, // Use the actual selected tier ID
      allergenList: formData.hasAllergens
        ? {
            allergies: formData.allergens
              .filter((a) => a.isSelected)
              .map((a) => a.name),
          }
        : null,
      logoUrl: formData.imageUrl || "",
      outletId: outletId,
      isActive: true,
      isMainLocation: true,
      logoHash: null,
    };

    try {
      if (selectedProduct) {
        // UPDATE existing product
        const updatedProductData = {
          ...selectedProduct,
          ...productData,
          id: selectedProduct.id,
        };

        // Call API to update product
        const response = (await productManagementService.updateProduct(
          outletId as number,
          selectedProduct.id,
          productData
        )) as ApiResponseType;

        if (response.status) {
          updateProduct(updatedProductData);
          toast.success("Product updated successfully");
          setProductClicked(false);
        } else {
          toast.error("Error updating product");
        }
      } else {
        // CREATE new product
        const response = (await productManagementService.createProduct(
          outletId as number,
          productData
        )) as ApiResponseType;

        if (response.status) {
          // Add the new product to store (assuming API returns the created product)
          const newProduct = {
            ...productData,
            id: response.data?.id || Date.now(), // Fallback ID
          };
          addProduct(newProduct);
          toast.success("Product created successfully");
          setProductClicked(false);
        } else {
          toast.error("Error creating product");
        }
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("An error occurred while saving the product");
    }
  };
  

  const handleDeleteProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !outletId) return;

    setIsDeleting(true);

    try {
      const success = await deleteProduct(outletId, selectedProduct.id);

      if (success) {
        toast.success("Product deleted successfully");
        setShowDeleteProductModal(false);
        setProductClicked(false);
      } else {
        toast.error("Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("An error occurred while deleting the product");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section
      className={`fixed inset-0 bg-black/20 backdrop-blur-sm flex ${
        showDeleteProductModal ? "items-center justify-center" : "justify-end"
      } z-50 transition-opacity duration-300 ease-in-out`}
    >
      {!showDeleteProductModal && (
        <section
          className={`bg-white shadow-xl rounded-l-lg ${getWidthClass(
            size
          )} h-full flex flex-col transition-all duration-300 ease-in-out ${
            isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
          }`}
        >
          {/* Non-scrollable header */}
          <div className="shrink-0 px-5">
            <div className="flex items-center justify-between py-5">
              <div className="">
                <p className="text-[#737373] text-sm">#{selectedProduct?.id}</p>
                <h3 className="text-[#1C1B20] font-bold text-2xl">
                  {selectedProduct?.name}
                </h3>
              </div>
              <button
                onClick={() => setProductClicked(false)}
                className="bg-[#15BA5C] px-1.5 py-1.5 rounded-full"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === tab.id
                        ? "border-green-500 text-green-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {activeTab === "basic" && (
            <div className="flex-1 overflow-y-auto py-5 space-y-4 pr-2 px-5">
              <form
                className="flex flex-col gap-7"
                onSubmit={handleProductSave}
              >
                <div className="flex flex-col gap-2.5">
                  <label
                    className="flex items-center gap-1.5"
                    htmlFor="productName"
                  >
                    <span>Product Name</span>
                    <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="productName"
                    id="productName"
                    value={formData.productName}
                    onChange={(e) =>
                      handleInputChange("productName", e.target.value)
                    }
                    className="font-normal w-full px-5 py-2.5 rounded-[10px] bg-[#FAFAFC] border border-[#E6E6E6] outline-none"
                    placeholder="Enter Product Name"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2.5">
                  <label
                    className="flex items-center gap-1.5"
                    htmlFor="productCategory"
                  >
                    <span>Product Category</span>
                    <span className="text-red-600">*</span>
                  </label>
                  <DropdownSelector
                    outletId={outletId}
                    searchPlaceholder="Search Product Category"
                    items={categories}
                    placeholder={formData.category || "Select a category"}
                    onSelect={(item) => handleInputChange("category", item)}
                  />
                </div>

                <div className="flex flex-col gap-2.5">
                  <label
                    className="flex items-center gap-1.5"
                    htmlFor="defaultSellingPrice"
                  >
                    <span>Set Default Selling Price</span>
                    <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    name="sellingPrice"
                    value={formData.sellingPrice}
                    onChange={(e) =>
                      handleInputChange("sellingPrice", e.target.value)
                    }
                    className="font-normal w-full px-5 py-2.5 rounded-[10px] bg-[#FAFAFC] border border-[#E6E6E6] outline-none"
                    placeholder="Enter Selling Price"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between gap-4">
                    <label className="flex flex-col">
                      <span>Price Tier</span>
                      <span className="text-[#898989] text-[13px]">
                        Activate price tiers for your selling price
                      </span>
                    </label>
                    <Switch
                      checked={formData.hasPriceTiers}
                      onChange={(checked) =>
                        handleInputChange("hasPriceTiers", checked)
                      }
                    />
                  </div>

                  {formData.hasPriceTiers && (
                    <div className="flex flex-col gap-3.5 mt-4">
                      <PricingTierSelector
                        price={formData.sellingPrice}
                        tiers={formData.priceTiers}
                        onTiersChange={(tiers) =>
                          handleInputChange("priceTiers", tiers)
                        }
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2.5">
                  <label className="flex">Product Description</label>
                  <textarea
                    placeholder="Product description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    className="font-normal w-full h-[122px] px-5 py-2.5 rounded-[10px] bg-[#FAFAFC] border border-[#E6E6E6] outline-none"
                  />
                </div>

                <div className="flex flex-col gap-2.5">
                  <label
                    className="flex items-center gap-1.5"
                    htmlFor="preparationArea"
                  >
                    <span>Preparation Area</span>
                    <span className="text-red-600">*</span>
                  </label>
                  <DropdownSelector
                    outletId={outletId}
                    searchPlaceholder="Search Preparation Area"
                    items={preparationArea}
                    placeholder={
                      formData.preparationArea || "Select a preparation area"
                    }
                    onSelect={(item) =>
                      handleInputChange("preparationArea", item)
                    }
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between gap-4">
                    <label className="flex flex-col">
                      <span>Add Allergens</span>
                      <span className="text-[#898989] text-[13px]">
                        Does this product have allergens?
                      </span>
                    </label>
                    <Switch
                      checked={formData.hasAllergens}
                      onChange={(checked) =>
                        handleInputChange("hasAllergens", checked)
                      }
                    />
                  </div>

                  {formData.hasAllergens && (
                    <AllergenSelector
                      allergens={formData.allergens}
                      onAllergensChange={(allergens) =>
                        handleInputChange("allergens", allergens)
                      }
                    />
                  )}
                </div>

                <div className="flex flex-col gap-2.5">
                  <label
                    className="flex items-center gap-1.5"
                    htmlFor="leadTime"
                  >
                    <span>Lead Time</span>
                    <span className="text-red-600">*</span>
                  </label>
                  <LeadTimeInputs
                    hours={formData.leadTimeHours}
                    minutes={formData.leadTimeMinutes}
                    seconds={formData.leadTimeSeconds}
                    onTimeChange={(field, value) =>
                      handleInputChange(field as keyof ProductFormData, value)
                    }
                  />
                </div>

                <div className="flex flex-col gap-2.5">
                  <label
                    className="flex items-center gap-1.5"
                    htmlFor="productWeight"
                  >
                    <span>Weight</span>
                    <span className="text-red-600">*</span>
                  </label>

                  <div className="relative" ref={dropdownRef}>
                    <div className="flex items-center relative w-full px-5 py-2.5 rounded-[10px] bg-[#FAFAFC] border border-[#E6E6E6]">
                      <input
                        type="number"
                        name="weight"
                        id="weight"
                        value={formData.weight}
                        onChange={(e) =>
                          handleInputChange("weight", e.target.value)
                        }
                        placeholder="Enter Weight"
                        className="font-normal outline-none bg-transparent flex-1"
                        required
                      />
                      <button
                        type="button"
                        onClick={toggleDropdown}
                        className="text-gray-600 flex items-center gap-1"
                      >
                        {formData.weightUnit}
                        <svg
                          className={`w-4 h-4 transition-transform ${
                            isDropdownOpen ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                    </div>
                    {isDropdownOpen && (
                      <div className="absolute flex flex-col top-full right-0 mt-1 bg-[#2C2C2C] rounded-lg shadow-lg z-10 min-w-[60px]">
                        {units.map((unit) => (
                          <button
                            key={unit}
                            type="button"
                            onClick={() => handleUnitSelect(unit)}
                            className={`px-4 py-2 text-center hover:bg-gray-600 first:rounded-t-lg last:rounded-b-lg ${
                              formData.weightUnit === unit
                                ? "text-[#15BA5C]"
                                : "text-white"
                            }`}
                          >
                            {unit}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  <label
                    className="flex items-center gap-1.5"
                    htmlFor="packagingMethod"
                  >
                    <span>Packaging Method</span>
                    <span className="text-red-600">*</span>
                  </label>
                  <DropdownSelector
                    outletId={outletId}
                    searchPlaceholder="Search packaging method"
                    items={packagingMethod}
                    placeholder={
                      formData.packagingMethod || "Select a packaging method"
                    }
                    onSelect={(item) =>
                      handleInputChange("packagingMethod", item)
                    }
                  />
                </div>

                {formData.imageUrl ? (
                  <Image
                    height={140}
                    width={140}
                    alt="Logo"
                    src={formData.imageUrl}
                    className="h-[140px] w-[140px] "
                  />
                ) : (
                  <div className="flex flex-col gap-2.5">
                    <label className="flex">Upload an Image</label>
                    <FileUploadComponent
                      setImageUrl={(url) => handleInputChange("imageUrl", url)}
                    />
                  </div>
                )}
                <div className="flex items-center gap-3.5">
                  <button
                    className="w-full bg-[#15BA5C] text-[#FFFFFF] hover:border-[#15BA5C] hover:border hover:bg-white hover:text-[#15BA5C] text-[14px] font-medium py-2.5 rounded-[10px]"
                    type="submit"
                  >
                    Save Product
                  </button>
                  <button
                    className="w-full flex items-center justify-center gap-2 text-[#FF5247] border border-[#FF5247] hover:bg-[#FF5247]  hover:text-white text-[14px] font-medium py-2.5 rounded-[10px]"
                    type="button"
                    onClick={() => setShowDeleteProductModal(true)}
                  >
                    <Trash className="h-[16px]" />
                    <span className="">Delete Product</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "price" && (
            <div className="flex-1 overflow-y-auto py-5 space-y-4 pr-2 px-5">
              <div className="bg-[#15BA5C] h-[128px] flex items-center justify-between rounded-[10px] px-4">
                <div className="text-white flex flex-col gap-2">
                  <h3 className="text-[17px]">Price History</h3>
                  <p className="text-[14px]">
                    Monitor Prices changes for your product
                  </p>
                </div>
                <div className="">
                  <div className="flex items-center justify-center h-[258px] w-[258px] rounded-full border border-white">
                    <div className="flex items-center justify-center h-[215px] w-[215px] rounded-full border border-white">
                      <div className="flex items-center justify-center h-[166px] w-[166px] rounded-full border border-white">
                        <Image
                          alt="ATM Card"
                          src={AssetsFiles.AtmCard}
                          className=""
                          width={100}
                          height={100}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full ">
                <div className=" rounded-lg shadow-sm overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-[#FAFAFC]  ">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Previous Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          New Selling Price
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedProductPriceHistory?.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {row.changedBy}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            Admin
                            {/* {row.role || "Admin"} */}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(row.changedAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            £{row.oldPrice}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            £{row.newPrice}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </section>
      )}
      {showDeleteProductModal && (
        <div className="w-full flex justify-center px-4">
          <div className="bg-white w-full max-w-[482px] relative flex flex-col items-center pt-[100px] rounded-lg shadow-lg overflow-visible">
            <div className="absolute -top-[70px] left-1/2 transform -translate-x-1/2 h-[150px] w-[150px] rounded-full bg-[#FF5247] flex items-center justify-center">
              <div className="absolute bottom-0 left-0 w-full h-1/2 rounded-b-full border-b-[4px] border-black pointer-events-none"></div>

              <Trash2 className="h-[100px] w-[100px] text-[#1C1B20] z-10" />
            </div>

            <div className="px-6 text-[#1C1B20] w-full mt-6">
              <h3 className="text-center font-medium text-[18px]">
                Delete Price History
              </h3>
              <p className="text-center font-normal text-[14px] mt-2">
                Are you sure you want to delete this price history?
              </p>
              <div className="flex flex-col my-4 gap-2.5">
                <button
                  className="bg-[#FF5247] rounded-[14px] text-white py-[10px]"
                  type="button"
                  onClick={(e) => handleDeleteProduct(e)}
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setShowDeleteProductModal(false)}
                  className="border text-[#FF5247] rounded-[14px] border-[#FF0000] py-[10px]"
                  type="button"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default EditProductModals;

// Updated PricingTierSelector Component
interface PricingTierSelectorProps {
  tiers: PricingTier[];
  price:number,
  onTiersChange: (tiers: PricingTier[]) => void;
}

const PricingTierSelector: React.FC<PricingTierSelectorProps> = ({
  tiers,
  price,
  onTiersChange,
}) => {
  const handleTierChange = (id: number) => {
    // Changed from string to number
    const updatedTiers = tiers.map(
      (tier) =>
        tier.id === id
          ? { ...tier, checked: !tier.checked }
          : { ...tier, checked: false } // Only allow one selection
    );
    onTiersChange(updatedTiers);
  };

  return (
    <>
      {tiers.map((tier, index) => (
        <div
          key={tier.id}
          className={`flex items-center justify-between p-4 bg-white w-full rounded-lg shadow-sm ${
            index !== tiers.length - 1 ? "border-b border-gray-100" : ""
          }`}
        >
          {console.log(tiers)}
          <div className="flex items-center gap-4 justify-between w-full">
            <div className="flex items-center gap-3.5">
              <div className="border border-[#E6E6E6] px-2.5 py-2.5 rounded-full">
                <Tag className="h-[15px] w-[15px] text-[#15BA5C]" />
              </div>
              <div className="flex flex-col">
                <label
                  htmlFor={tier.id.toString()}
                  className="text-[#1E1E1E] text-[14px] flex items-center gap-1.5 font-medium cursor-pointer select-none"
                >
                  <span>{tier.name}</span> -{" "}
                  {tier.pricingRules.markupPercentage > 0 && (
                    <span>
                      Markup: {tier.pricingRules.markupPercentage}% - Value:  
                       {calculateTierPrice(price, {
                        ...tier.pricingRules
                      })}
                    </span>
                  )}
                  {tier.pricingRules.discountPercentage > 0 && (
                    <span>
                      Discount: {tier.pricingRules.discountPercentage}% - Value:  
                       {calculateTierPrice(price, {
                        ...tier.pricingRules,
                      })}
                    </span>
                  )}
                </label>
              </div>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                id={tier.id.toString()}
                checked={tier.checked}
                onChange={() => handleTierChange(tier.id)}
                className="sr-only"
              />
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-all duration-200 ${
                  tier.checked
                    ? "bg-green-500 border-green-500"
                    : "bg-white border-gray-300 hover:border-gray-400"
                }`}
                onClick={() => handleTierChange(tier.id)}
              >
                {tier.checked && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};


// Updated AllergenSelector Component
interface AllergenSelectorProps {
  allergens: Allergen[];
  onAllergensChange: (allergens: Allergen[]) => void;
}

const AllergenSelector: React.FC<AllergenSelectorProps> = ({
  allergens,
  onAllergensChange,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [newAllergen, setNewAllergen] = useState("");

  const toggleAllergen = (id: string) => {
    const updatedAllergens = allergens.map((allergen) =>
      allergen.id === id
        ? { ...allergen, isSelected: !allergen.isSelected }
        : allergen
    );
    onAllergensChange(updatedAllergens);
  };

  const handleAddAllergen = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAllergen.trim()) {
      const newId = Date.now().toString();
      const updatedAllergens = [
        ...allergens,
        {
          id: newId,
          name: newAllergen.trim(),
          isSelected: true,
        },
      ];
      onAllergensChange(updatedAllergens);
      setNewAllergen("");
      setShowForm(false);
    }
  };

  const removeAllergen = (id: string) => {
    const updatedAllergens = allergens.filter((allergen) => allergen.id !== id);
    onAllergensChange(updatedAllergens);
  };

  console.log(allergens, "This is the allergens");

  return (
    <div className="my-4">
      <div className="flex flex-wrap gap-3 mb-4">
        {[allergens]?.map((allergen) => (
          <div key={allergen?.id} className="relative group">
            <button
              type="button"
              onClick={() => toggleAllergen(allergen.allergies.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:shadow-sm ${
                allergen.isSelected
                  ? "bg-green-100 text-[#15BA5C] border border-[#15BA5C] hover:bg-green-200"
                  : "bg-[#FAFAFC] text-[#1C1B20] border border-[#E6E6E6] hover:bg-gray-100"
              }`}
            >
              {allergen.allergies?.name}
            </button>
            {allergen.allergies?.isSelected && (
              <button
                type="button"
                aria-label={`Remove ${allergen.allergie.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  removeAllergen(allergen.allergies.id);
                }}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
              >
                <X size={12} />
              </button>
            )}
          </div>
        ))}

        {!showForm ? (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="px-4 py-2 rounded-full text-sm font-medium bg-white text-green-600 border-2 border-green-200 hover:bg-green-50 hover:border-green-300 transition-all duration-200 flex items-center gap-2 hover:shadow-md"
          >
            <Plus size={16} />
            Add
          </button>
        ) : (
          <form className="flex items-center gap-2">
            <input
              type="text"
              value={newAllergen}
              onChange={(e) => setNewAllergen(e.target.value)}
              placeholder="Enter allergen name"
              className="px-3 py-2 rounded-full text-sm border-2 border-green-200 focus:border-green-400 focus:outline-none bg-green-50 text-green-800 placeholder-green-500 min-w-48"
              autoFocus
            />
            <button
              onClick={handleAddAllergen}
              type="button"
              disabled={!newAllergen.trim()}
              className="px-3 py-2 rounded-full text-sm font-medium bg-green-600 text-white hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setNewAllergen("");
              }}
              className="px-3 py-2 rounded-full text-sm font-medium bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

// Updated LeadTimeInputs Component
interface LeadTimeInputsProps {
  hours: string;
  minutes: string;
  seconds: string;
  onTimeChange: (field: string, value: string) => void;
}

const LeadTimeInputs: React.FC<LeadTimeInputsProps> = ({
  hours,
  minutes,
  seconds,
  onTimeChange,
}) => {
  const validateNumber = (value: string, max: number) => {
    if (value === "") return true;
    if (!/^\d+$/.test(value)) return false;
    const num = parseInt(value, 10);
    return num >= 0 && num <= max;
  };

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (validateNumber(value, 23)) {
      onTimeChange("leadTimeHours", value);
    }
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (validateNumber(value, 59)) {
      onTimeChange("leadTimeMinutes", value);
    }
  };

  const handleSecondsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (validateNumber(value, 59)) {
      onTimeChange("leadTimeSeconds", value);
    }
  };

  return (
    <div className="flex gap-4">
      <div className="bg-[#FAFAFC] border border-[#E6E6E6] rounded-[10px] flex py-2.5 relative flex-1">
        <input
          type="text"
          name="hours"
          value={hours}
          onChange={handleHoursChange}
          className="font-normal pl-5 pr-9 outline-none w-full"
          placeholder="Hours"
          maxLength={2}
        />
        <Clock3 className="h-[17px] absolute right-2 top-3.5 text-gray-500" />
      </div>
      <div className="bg-[#FAFAFC] border border-[#E6E6E6] rounded-[10px] flex py-2.5 relative flex-1">
        <input
          type="text"
          name="minutes"
          value={minutes}
          onChange={handleMinutesChange}
          className="font-normal pl-5 pr-9 outline-none w-full"
          placeholder="Minutes"
          maxLength={2}
        />
        <Clock3 className="h-[17px] absolute right-2 top-3.5 text-gray-500" />
      </div>
      <div className="bg-[#FAFAFC] border border-[#E6E6E6] rounded-[10px] flex py-2.5 relative flex-1">
        <input
          type="text"
          name="seconds"
          value={seconds}
          onChange={handleSecondsChange}
          className="font-normal pl-5 pr-9 outline-none w-full"
          placeholder="Seconds"
          maxLength={2}
        />
        <Clock3 className="h-[17px] absolute right-2 top-3.5 text-gray-500" />
      </div>
    </div>
  );
};
