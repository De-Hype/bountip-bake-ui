// InvoiceCustomizationModal.tsx
import React, { useEffect, useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";

import SettingFiles from "@/assets/icons/settings";
import FileUploadComponent from "@/components/Upload/FileUploadComponent";
import { Switch } from "../ui/Switch";
import { Dropdown } from "../ui/Dropdown";
import Image from "next/image";
import { useSelectedOutlet } from "@/hooks/useSelectedOutlet";
import { useBusinessStore } from "@/stores/useBusinessStore";
import LabelPreview from "./LabelPreview";

interface InvoiceCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (heading: string, description: string) => void;
}

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

export const InvoiceCustomizationModal: React.FC<
  InvoiceCustomizationModalProps
// eslint-disable-next-line @typescript-eslint/no-unused-vars
> = ({ isOpen, onClose, onSuccess }) => {
  const [imageUrl, setImageUrl] = useState("");
  const [formData, setFormData] = useState({
    showBakeryName: false,
    fontSize: "",
    paperSize: "",
    showPaymentSuccess: false,
    showBusinessLine: false,
    customBusinessText: "",
    showInvoiceNumber: false,
    showInvoiceIssueDate: false,
    showInvoiceDueDate: false,
    showClientName: false,
    showClientAddress: false,
    showModifierBelowItems: false,
    selectedColumns: {
      orderName: false,
      sku: false,
      qty: false,
      subTotal: false,
      total: false,
    },
    showDiscountLine: false,
    showTax: false,
    showDeliveryFee: false,
    showPaymentStatus: false,
    showPaymentMethod: false,
    showRemoveTaxOnOrderReceipt: false,
    showRemoveTaxOnPaymentReceipt: false,
    showActivateAccountDetails: false,
    showActivateEmail: false,
    showActivateAddress: false,

    customMessage: "",
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { selectedOutletId, loading } = useBusinessStore();
  const selectedOutlet = useSelectedOutlet();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isOpen && selectedOutlet?.outlet.invoiceSettings) {
      const settings = selectedOutlet.outlet.invoiceSettings;
      if (settings.customizedLogoUrl) {
        setImageUrl(settings.customizedLogoUrl);
      }

      setFormData({
        showBakeryName: settings.showBakeryName,
        fontSize: settings.fontStyle,
        paperSize: settings.paperSize,
        showPaymentSuccess: settings.showPaymentMethod,
        showBusinessLine: false,
        customBusinessText: "",
        showInvoiceNumber:settings.showInvoiceNumber,
        showInvoiceIssueDate: settings.showInvoiceIssueDate,
        showInvoiceDueDate: settings.showInvoiceDueDate,
        showClientName: settings.showInvoiceClientName,
        showClientAddress: settings.showInvoiceClientName,
        showModifierBelowItems: settings.showModifierBelowItems,
        selectedColumns: {
          orderName: settings.selectedColumns.orderName,
          sku: settings.selectedColumns.sku,
          qty: settings.selectedColumns.qty,
          subTotal: settings.selectedColumns.subTotal,
          total: settings.selectedColumns.subTotal,
        },
        showDiscountLine: settings.showDiscountLine,
        showTax: settings.showTax,
        showDeliveryFee: settings.showShippingFee,
        showPaymentStatus: settings.showPaymentStatus,
        showPaymentMethod: settings.showPaymentMethod,
        showRemoveTaxOnOrderReceipt: settings.showTaxOnOrderReceipt,
        showRemoveTaxOnPaymentReceipt: settings.showTaxOnPaymentReceipt,
        showActivateAccountDetails: settings.showAccountDetails,
        showActivateEmail: settings.showEmail,
        showActivateAddress: settings.showAddress,

        customMessage: settings.customThankYouMessage || "",
      });

      if (settings.customizedLogoUrl) {
        setImageUrl(settings.customizedLogoUrl);
      }
    }
  }, [isOpen, selectedOutlet]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(imageUrl);
    // Handle save logic here
    onClose();
  };

  return (
    <Modal
      size={"xl"}
      image={SettingFiles.InvoiceCustomization}
      isOpen={isOpen}
      onClose={onClose}
      title="Invoice Customization"
      subtitle="Customize your invoices to fit your brand identity"
    >
      <section className="flex ">
        <div className="space-y-6 flex-1/2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="px-3.5 py-1.5">
              <h4 className="font-medium mb-4">Invoice Branding</h4>
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
              )}{" "}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-[#737373]">
                    Show Bakery name
                  </label>
                  <Switch
                    checked={formData.showBakeryName}
                    onChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        showBakeryName: checked,
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
                        selectedValue={formData.fontSize}
                        placeholder="Select a font"
                        onChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            fontSize: value,
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
                    checked={formData.showPaymentSuccess}
                    onChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        showPaymentSuccess: checked,
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
                        customBusinessText: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-[#737373]">
                    Show total paid at top
                  </label>
                  <Switch
                    checked={formData.showBusinessLine}
                    onChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        showBusinessLine: checked,
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="border border-dashed border-[#D1D1D1] rounded-[10px] px-3.5 py-2.5">
              <h4 className="font-medium mb-4 text-[#1C1B20]">
                Invoice Information
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-[#737373]">
                    Invoice Number
                  </label>
                  <Switch
                    checked={formData.showInvoiceNumber}
                    onChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        showInvoiceNumber: checked,
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-[#737373]">
                    Issue Date
                  </label>
                  <Switch
                    checked={formData.showInvoiceIssueDate}
                    onChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        showInvoiceIssueDate: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-[#737373]">
                    Due Date
                  </label>
                  <Switch
                    checked={formData.showInvoiceDueDate}
                    onChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        showInvoiceDueDate: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-[#737373]">
                    Client Name
                  </label>
                  <Switch
                    checked={formData.showClientName}
                    onChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        showClientName: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-[#737373]">
                    Client Address
                  </label>
                  <Switch
                    checked={formData.showClientName}
                    onChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        showClientAddress: checked,
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
                    checked={formData.showModifierBelowItems}
                    onChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        showModifierBelowItems: checked,
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
              <h4 className="font-medium mb-4 text-[#1C1B20]">
                Payment Breakdown
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-[#737373]">
                    Show Discount line
                  </label>
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
                  <label className="text-sm font-medium text-[#737373]">
                    Show Tax/VAT
                  </label>
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
                  <label className="text-sm font-medium text-[#737373]">
                    Shipping / Delivery Fee
                  </label>
                  <Switch
                    checked={formData.showDeliveryFee}
                    onChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        showDeliveryFee: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-[#737373]">
                    Payment Status
                  </label>
                  <Switch
                    checked={formData.showPaymentStatus}
                    onChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        showPaymentStatus: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-[#737373]">
                    Payment Method
                  </label>
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

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-[#737373]">
                    Remove Tax on Order Receipt
                  </label>
                  <Switch
                    checked={formData.showRemoveTaxOnOrderReceipt}
                    onChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        showRemoveTaxOnOrderReceipt: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-[#737373]">
                    Remove Tax on Payment receipt
                  </label>
                  <Switch
                    checked={formData.showRemoveTaxOnPaymentReceipt}
                    onChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        showRemoveTaxOnPaymentReceipt: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-[#737373]">
                    Activate account details
                  </label>
                  <Switch
                    checked={formData.showActivateAccountDetails}
                    onChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        showActivateAccountDetails: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-[#737373]">
                    Activate Email
                  </label>
                  <Switch
                    checked={formData.showActivateEmail}
                    onChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        showActivateEmail: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-[#737373]">
                    Activate Address
                  </label>
                  <Switch
                    checked={formData.showActivateAddress}
                    onChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        showActivateAddress: checked,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
            <div className="border border-dashed border-[#D1D1D1] rounded-[10px] px-3.5 py-4">
              <label className="block text-sm font-medium text-[#1C1B20] mb-2">
                Custom &quot;Thank you&quot; Message
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none outline-none "
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
        <div className="flex-1/2">
        <LabelPreview formData={formData} imageUrl={imageUrl} type="invoice" />
        </div>
      </section>
    </Modal>
  );
};



