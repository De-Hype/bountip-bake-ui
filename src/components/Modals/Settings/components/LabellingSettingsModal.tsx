"use client"

import React, { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Switch } from "../ui/Switch";
import SettingFiles from "@/assets/icons/settings";
import FileUploadComponent from "@/components/Upload/FileUploadComponent";
import { Dropdown } from "../ui/Dropdown";
import settingsService from "@/services/settingsService";
import { useBusinessStore } from "@/stores/useBusinessStore";
import { ApiResponseType } from "@/types/httpTypes";
import { toast } from "sonner";
import { useSelectedOutlet } from "@/hooks/useSelectedOutlet";
import Image from "next/image";
import LabelPreview from "./LabelPreview";

interface LabellingSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
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

export const LabellingSettingsModal: React.FC<LabellingSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { selectedOutletId, loading } = useBusinessStore();
  const selectedOutlet = useSelectedOutlet();

  const [isClient, setIsClient] = useState(false);
  const [formData, setFormData] = useState({
    showBakeyName: false,
    showPaymentSuccess: false,
    fontSize: "productSans",
    paperSize: "a4",
    showBarcode: true,
    header: "",
    customBusinessText: "",
    showBusinessLine: true,
    labelItems: [
      { name: "Label Name", enabled: true },
      { name: "Label Type", enabled: true },
      { name: "Product Name", enabled: true },
      { name: "Best Before", enabled: true },
      { name: "Product Weight", enabled: true },
      { name: "Best Number", enabled: true },
      { name: "ManufacturedDate", enabled: true },
      { name: "Barcode", enabled: true },
      { name: "Business Summary", enabled: true },
      { name: "Allergen", enabled: true },
      { name: "Price", enabled: true },
    ],
    customMessage: "",
  });
  const [imageUrl, setImageUrl] = useState("");

  // Always call hooks before early returns
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isOpen && selectedOutlet?.outlet.labelSettings) {
      const settings = selectedOutlet.outlet.labelSettings;

      setFormData({
        showBakeyName: settings.showBakeryName,
        showPaymentSuccess: settings.showPaymentSuccessText,
        fontSize: settings.fontStyle,
        paperSize: settings.paperSize,
        showBarcode: settings.showProductBarCode,
        header: settings.customHeader,
        customBusinessText: settings.customSuccessText,
        showBusinessLine: settings.showTotalPaidAtTop,
        customMessage: settings.customThankYouMessage,
        labelItems: [
          { name: "Label Name", enabled: settings.showLabelName },
          { name: "Label Type", enabled: settings.showLabelType },
          { name: "Product Name", enabled: settings.showProductName },
          { name: "Best Before", enabled: settings.showExpiryDate },
          { name: "Product Weight", enabled: settings.showWeight },
          { name: "Best Number", enabled: settings.showBatchNumber },
          { name: "ManufacturedDate", enabled: settings.showManufacturingDate },
          { name: "Barcode", enabled: settings.showProductBarCode },
          {
            name: "Business Summary",
            enabled: settings.showIngredientsSummary,
          },
          { name: "Allergen", enabled: settings.showAllergenInfo },
          { name: "Price", enabled: settings.showPrice },
        ],
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
      const result = (await settingsService.updateLabelSettings(
        formData,
        selectedOutletId as number,
        imageUrl
      )) as ApiResponseType;

      if (result.status) {
        toast.success("Successfully created the labelling");
        onClose();
      } else {
        toast.error("Failed to update labelling settings");
      }
    } catch (error) {
      console.error("Error updating label settings:", error);
      toast.error("An error occurred while updating settings");
    }
  };

  const toggleLabelItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      labelItems: prev.labelItems.map((item, i) =>
        i === index ? { ...item, enabled: !item.enabled } : item
      ),
    }));
  };

  return (
    <Modal
      size={"xl"}
      image={SettingFiles.LabelingSettings}
      isOpen={isOpen}
      onClose={onClose}
      title="Labelling"
      subtitle="Customize your product labels"
    >
      <section className="flex">
        <div className="space-y-6 flex-1">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="px-3.5 py-1.5">
              <h4 className="font-medium mb-4">Label Branding</h4>
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
              <div className="space-y-4 mt-3.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-[#737373]">
                    Show Bakery name
                  </label>
                  <Switch
                    checked={formData.showBakeyName}
                    onChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        showBakeyName: checked,
                      }))
                    }
                  />
                </div>

                <div className="">
                  <div className="flex justify-between items-center mb-4">
                    <label className="flex-1 block text-sm font-medium text-[#737373] whitespace-nowrap mr-4">
                      Font Style
                    </label>
                    <div className="w-full">
                      <Dropdown
                        className="bg-[#FAFAFC]"
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
                    <label className="flex-1 block text-sm font-medium text-[#737373] whitespace-nowrap mr-4">
                      Paper Size
                    </label>
                    <div className="w-full">
                      <Dropdown
                        className="bg-[#FAFAFC]"
                        label="Paper size"
                        options={paperSizeOptions}
                        selectedValue={formData.paperSize}
                        placeholder="Select Paper size"
                        onChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            paperSize: value,
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
                    value={formData.customBusinessText}
                    className="outline-none text-[12px] border-2 border-[#D1D1D1] w-full px-3.5 py-2.5 bg-[#FAFAFC] rounded-[10px]"
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
                Label Information
              </h4>
              <div className="space-y-3">
                {formData.labelItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-[#737373]">{item.name}</span>
                    <Switch
                      checked={item.enabled}
                      onChange={() => toggleLabelItem(index)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-dashed border-[#D1D1D1] rounded-[10px] px-3.5 py-4">
              <label className="block text-sm font-medium text-[#1C1B20] mb-2">
                Custom &quot;Thank you&quot; Message
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none outline-none"
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
          <LabelPreview type="label" formData={formData} imageUrl={imageUrl} />{" "}
      </section>
    </Modal>
  );
};


