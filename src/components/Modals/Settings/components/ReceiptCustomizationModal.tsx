import React, { useEffect, useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Switch } from "../ui/Switch";
import SettingFiles from "@/assets/icons/settings";
import FileUploadComponent from "@/components/Upload/FileUploadComponent";
import { Dropdown } from "../ui/Dropdown";
import settingsService from "@/services/settingsService";
import { useSelectedOutlet } from "@/hooks/useSelectedOutlet";
import { useBusinessStore } from "@/stores/useBusinessStore";
import { ApiResponseType } from "@/types/httpTypes";
import { toast } from "sonner";
import Image from "next/image";
import LabelPreview from "./LabelPreview";



const fontOptions = [
  { value: "productSans", label: "Product Sans" },
  { value: "outfit", label: "Outfit" },
  { value: "urbanist", label: "Urbanist" },
  { value: "montserrat", label: "Montserrat" },
];

const paperSizeOptions = [
  { value: "a4", label: "A4" },
  { value: "a2", label: "A2" },
  { value: "a3", label: "A3" },
  { value: "a1", label: "A1" },
];

const columnOptions = [
  { value: "orderName", label: "Order Name" },
  { value: "sku", label: "SKU" },
  { value: "qty", label: "Quantity" },
  { value: "subTotal", label: "Subtotal" },
  { value: "total", label: "Total" },
];

interface ReceiptCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptCustomizationModal: React.FC<
  ReceiptCustomizationModalProps
> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<"customer" | "payment">(
    "customer"
  );
  const [formData, setFormData] = useState({
    //New Change
    showRecieptBranding:false,
    showRestaurantName: false,
    fontStyle: "",
    paperSize: "",
    showPaymentSucessText: false,
    customizeSuccessText: "",
    showTotalPaidAtTop: false,
    showOrderCustomizationName: false,
    showOrderName: false,
    showOrderDateTime: false,
    showCashierName: false,
    showCompanyPhoneNo: false,
    showCompanyEmail: false,
    showCompanyBankDetails: false,
    showCompanyBarCode: false,
    showModifiersBelowItems: false,
    selectedColumns: {
      orderName: false,
      sku: false,
      qty: false,
      subTotal: false,
      total: false,
    },
    showDiscountLine: false,
    showTax: false,
    showPaymentMethod: false,
    customMessage: "",
  });
  const [imageUrl, setImageUrl] = useState("");
  const { selectedOutletId, loading } = useBusinessStore();
  const selectedOutlet = useSelectedOutlet();

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isOpen && selectedOutlet?.outlet.receiptSettings) {
      const settings = selectedOutlet.outlet.receiptSettings;
      if (settings.customizedLogoUrl) {
        setImageUrl(settings.customizedLogoUrl);
      }

      setFormData({
        showRecieptBranding:false,
        showRestaurantName: settings.showBakeryName,
        showPaymentSucessText: settings.showPaymentSuccessText,
        fontStyle: settings.fontStyle,
        paperSize: settings.paperSize,
        showOrderName: settings.showOrderName,
        showDiscountLine: settings.showDiscounts,
        showTax: settings.showTaxDetails,
        customizeSuccessText: settings.customSuccessText,
        selectedColumns: {
          orderName: settings.selectedColumns.orderName,
          qty: settings.selectedColumns.qty,
          sku: settings.selectedColumns.sku,
          subTotal: settings.selectedColumns.subTotal,
          total: settings.selectedColumns.total,
        },
        showCashierName: settings.showCompanyCashierName,
        showCompanyPhoneNo: settings.showCompanyPhoneNumber,
        showCompanyEmail: settings.showCompanyEmail,
        showCompanyBankDetails: settings.showCompanyBankDetails,
        showCompanyBarCode: settings.showCompanyBarcode,
        showModifiersBelowItems: settings.showModifiedBelowItems,
        showTotalPaidAtTop: settings.showTotalPaidAtTop,
        showOrderCustomizationName: settings.showOrderName,
        showOrderDateTime: settings.showOrderTime,
        showPaymentMethod: settings.showPaymentMethod,
        customMessage: settings.customThankYouMessage,
      });

      if (settings.customizedLogoUrl) {
        setImageUrl(settings.customizedLogoUrl);
      }
    }
  }, [isOpen, selectedOutlet]);

  // Safe early return now that all hooks are declared
  if (loading || !isClient) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = (await settingsService.updateReceiptSettings(
        formData,
        selectedOutletId as number,
        imageUrl
      )) as ApiResponseType;
      if (result.status) {
        toast.success("Successfully updated receipt settings");
      }
    } catch (error) {
      console.log(error);
    }

    console.log(imageUrl);
    onClose();
  };

  return (
    <Modal
      size={"xl"}
      image={SettingFiles.ReceiptIcon}
      isOpen={isOpen}
      onClose={onClose}
      title="Receipt Customization"
      subtitle="Customize your receipt layout and information"
    >
      <section className="flex ">
        <div className="space-y-6 flex-1/2">
          <div className="flex bg-[#FAFAFC] rounded-[10px] px-5">
            <div className="flex flex-col items-center pt-2.5">
              <button
                className={`font-medium text-sm ${
                  activeTab === "customer" ? "text-[#15BA5C]" : "text-gray-500"
                }`}
                onClick={() => setActiveTab("customer")}
              >
                Customer Receipt
              </button>
              <span
                className={`mt-2 h-[6px] w-[140px] rounded-tl-full rounded-tr-full transition-all duration-200 mx-auto ${
                  activeTab === "customer" ? "bg-[#15BA5C]" : "bg-transparent"
                }`}
              />
            </div>

            <div className="flex flex-col items-center  pt-2.5">
              <button
                className={`font-medium text-sm ${
                  activeTab === "payment" ? "text-green-600" : "text-gray-500"
                }`}
                onClick={() => setActiveTab("payment")}
              >
                Payment Receipt
              </button>
              <span
                className={`mt-2 h-[6px] w-[140px] rounded-tl-full rounded-tr-full transition-all duration-200 mx-auto ${
                  activeTab === "payment" ? "bg-[#15BA5C]" : "bg-transparent"
                }`}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <h4 className="font-medium mb-4">Receipt Branding</h4>
                <Switch
                  checked={formData.showRecieptBranding}
                  onChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      showRecieptBranding: checked,
                    }))
                  }
                />
              </div>
              {imageUrl ? (
                <Image
                  height={140}
                  width={140}
                  alt="Logo"
                  src={imageUrl}
                  className="h-[140px] w-[140px] "
                />
              ) : (
                <FileUploadComponent setImageUrl={setImageUrl} />
              )}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-[#737373]">
                    Show restaurant name
                  </label>
                  <Switch
                    checked={formData.showRestaurantName}
                    onChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        showRestaurantName: checked,
                      }))
                    }
                  />
                </div>
                <div className="">
                  <div className="flex justify-between items-center mb-4">
                    <label className="flex-1/2 block text-sm font-medium text-[#737373] whitespace-nowrap">
                      Font Style
                    </label>

                    <div className="w-full ml-4">
                      <Dropdown
                        className="bg-[#FAFAFC] "
                        label="Fonts"
                        options={fontOptions}
                        selectedValue={formData.fontStyle}
                        placeholder="Select a font"
                        onChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            fontStyle: value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-4">
                    <label className="flex-1/2 block text-sm font-medium text-[#737373] whitespace-nowrap">
                      Paper Size{" "}
                    </label>

                    <div className="w-full ml-4">
                      <Dropdown
                        className="bg-[#FAFAFC] "
                        label="Paper size"
                        options={paperSizeOptions}
                        selectedValue={formData.paperSize}
                        placeholder="Select Paper size"
                        onChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            fontSize: value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-dashed border-[#D1D1D1] rounded-[10px] px-3.5 py-2.5">
              <h4 className="font-medium mb-4 text-[#1C1B20]">Header</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-[#737373]">
                    Show payment Success text
                  </label>
                  <Switch
                    checked={formData.showPaymentSucessText}
                    onChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        showPaymentSucessText: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex flex-col mt-1.5 gap-1.5">
                  <label className="text-[#737373] text-sm font-medium">
                    Customize Success text
                  </label>
                  <input
                    type="text"
                    name=""
                    className="outline-none text-[12px]  border-2 border-[#D1D1D1] w-full px-3.5 py-2.5 bg-[#FAFAFC] rounded-[10px]"
                    id=""
                    placeholder="Enter Success text, e.g Payment successful!"
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        customizeSuccessText: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-[#737373]">
                    Show total paid at top
                  </label>
                  <Switch
                    checked={formData.showTotalPaidAtTop}
                    onChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        showTotalPaidAtTop: checked,
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="border border-dashed border-[#D1D1D1] rounded-[10px] px-3.5 py-2.5">
              <h4 className="font-medium mb-4">Order Information</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#737373]">
                    Customization Name
                  </span>
                  <Switch
                    checked={formData.showOrderCustomizationName}
                    onChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        showOrderCustomizationName: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#737373]">Order Name</span>
                  <Switch
                    checked={formData.showOrderName}
                    onChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        showOrderName: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#737373]">Date & Time</span>
                  <Switch
                    checked={formData.showOrderDateTime}
                    onChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        showOrderDateTime: checked,
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="border border-dashed border-[#D1D1D1] rounded-[10px] px-3.5 py-2.5">
              <h4 className="font-medium mb-4">Company Information</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#737373]">Cashier Name</span>
                  <Switch
                    checked={formData.showCashierName}
                    onChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        showCashierName: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#737373]">Phone Number</span>
                  <Switch
                    checked={formData.showCompanyPhoneNo}
                    onChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        showCompanyPhoneNo: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#737373]">Email</span>
                  <Switch
                    checked={formData.showCompanyEmail}
                    onChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        showCompanyEmail: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#737373]">Bank Details</span>
                  <Switch
                    checked={formData.showCompanyBankDetails}
                    onChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        showCompanyBankDetails: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#737373]">Barcode</span>
                  <Switch
                    checked={formData.showCompanyBarCode}
                    onChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        showCompanyBarCode: checked,
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="border border-dashed border-[#D1D1D1] rounded-[10px] px-3.5 py-2.5">
              <h4 className="font-medium mb-4 text-[#1C1B20]">
                Itemized Details/List
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-[#737373]">
                    Show Modifiers Below Items
                  </label>
                  <Switch
                    checked={formData.showModifiersBelowItems}
                    onChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        showModifiersBelowItems: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex-1/2 text-sm font-medium text-[#737373]">
                    Display Columns
                  </label>
                  <div className="flex-1/2 ml-4">
                    <Dropdown
                      mode="checkbox"
                      label="Select columns to display"
                      options={columnOptions}
                      selectedValues={formData.selectedColumns}
                      onMultiChange={(values) =>
                        setFormData((prev) => ({
                          ...prev,
                          selectedColumns: {
                            orderName: values.orderName || false,
                            sku: values.sku || false,
                            qty: values.qty || false,
                            subTotal: values.subTotal || false,
                            total: values.total || false,
                          },
                        }))
                      }
                      placeholder="Select columns to display"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-dashed border-[#D1D1D1] rounded-[10px] px-3.5 py-2.5">
              <h4 className="font-medium mb-4">Payment Breakdown</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">
                    Show discount line
                  </span>
                  <Switch
                    checked={formData.showDiscountLine}
                    onChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        showDiscountLine: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Show Tax/VAT</span>
                  <Switch
                    checked={formData.showTax}
                    onChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        showTax: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">
                    Show Payment Method
                  </span>
                  <Switch
                    checked={formData.showPaymentMethod}
                    onChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        showPaymentMethod: checked,
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom &quot;Thank you&quot; Message
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                rows={3}
                value={formData.customMessage}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    customMessage: e.target.value,
                  }))
                }
                placeholder="Enter your custom message"
              />
            </div>

            <Button type="submit" className="w-full">
              Save Settings
            </Button>
          </form>
        </div>

        {/* <div className="flex-1/2"></div> */}
        <LabelPreview formData={formData} imageUrl={imageUrl} type="receipt" />
      </section>
    </Modal>
  );
};
