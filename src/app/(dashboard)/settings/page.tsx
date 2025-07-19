"use client";
import React, { useEffect, useState } from "react";

import { PriceSettingsModal } from "@/components/Modals/Settings/components/PriceSettingsModal";
import { PaymentMethodsModal } from "@/components/Modals/Settings/components/PaymentMethodsModal";
import { BusinessDetailsModal } from "@/components/Modals/Settings/components/BusinessDetailsModal";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { LabellingSettingsModal } from "@/components/Modals/Settings/components/LabellingSettingsModal";
import { InventoryHubModal } from "@/components/Modals/Settings/components/InventoryHubModal";
import { InvoiceCustomizationModal } from "@/components/Modals/Settings/components/InvoiceCustomizationModal";
import { AccountSettingsModal } from "@/components/Modals/Settings/components/AccountSettingsModal";
import { PasswordSettingsModal } from "@/components/Modals/Settings/components/PasswordSettingsModal";
import { OperatingHoursModal } from "@/components/Modals/Settings/components/OperatingHoursModal";
import settingsItems from "@/data/settingItems";
import { LocationSettingsModal } from "@/components/Modals/Settings/components/LocationSettingsModal";
import { ReceiptCustomizationModal } from "@/components/Modals/Settings/components/ReceiptCustomizationModal";
import { useSelectedOutlet } from "@/hooks/useSelectedOutlet";
import { useBusinessStore } from "@/stores/useBusinessStore";
import { useProductManagementStore } from "@/stores/useProductManagementStore";
import SuccessToast from "@/components/Modals/Success/SuccessModal";
import ErrorModal from "@/components/Modals/Errors/ErrorModal";

interface SuccessState {
  isOpen: boolean;
  heading: string;
  description: string;
}

interface ErrorState {
  isOpen: boolean;
  heading: string;
  description: string;
}

const SettingsPage: React.FC = () => {
  const outletId = useSelectedOutlet()?.outlet.id;
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [successModal, setSuccessModal] = useState<SuccessState>({
    isOpen: false,
    heading: "",
    description: "",
  });
  const [errorModal, setErrorModal] = useState<ErrorState>({
    isOpen: false,
    heading: "",
    description: "",
  });

  const { fetchBusinessData } = useBusinessStore();
  const { fetchCategory } = useProductManagementStore();

  const handleSettingClick = (id: string) => {
    setActiveModal(id);
  };

  const handleModalClose = () => {
    setActiveModal(null);
  };

  const handleSuccessModalClose = () => {
    setSuccessModal({
      isOpen: false,
      heading: "",
      description: "",
    });
  };

  const showSuccessModal = (heading: string, description: string) => {
    setSuccessModal({
      isOpen: true,
      heading,
      description,
    });
  };

  const handleErrorModalClose = () => {
    setErrorModal({
      isOpen: false,
      heading: "",
      description: "",
    });
  };

  const showErrorModal = (heading: string, description: string) => {
    setErrorModal({
      isOpen: true,
      heading,
      description,
    });
  };

  useEffect(() => {
    fetchBusinessData();
    fetchCategory(outletId as number);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-5 py-3">
        <div className="">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            General Settings
          </h1>
          <p className="text-[#737373]">
            Manage your business and personal preferences here
          </p>
        </div>
        <hr className="border border-[#E7E7E7] my-8" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-white px-2 py-3.5">
          {settingsItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSettingClick(item.id)}
              className="relative overflow-hidden bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="absolute -top-14 right-0 h-[100px] w-[100px] rounded-full border border-[#15BA5C80]" />
              <div className="absolute -top-7 -right-12 h-[100px] w-[100px] rounded-full border border-[#15BA5C80]" />

              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-full ${item.color}`}>
                  <Image
                    src={item.icon}
                    alt={item.title}
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <ChevronRight className="h-[14px]" />
              </div>

              <p className="text-sm text-[#737373]">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* All your existing modals with success callback */}
      <BusinessDetailsModal
        isOpen={activeModal === "business-info"}
        onClose={handleModalClose}
        onSuccess={(heading, description) => {
          handleModalClose();
          showSuccessModal(heading, description);
        }}
        onError={(heading, description) => {
          handleModalClose();
          showErrorModal(heading, description);
        }}
        outletId={outletId as number}
      />

      <PaymentMethodsModal
        isOpen={activeModal === "payment-methods"}
        onClose={handleModalClose}
        onSuccess={(heading, description) => {
          handleModalClose();
          showSuccessModal(heading, description);
        }}
        onError={(heading, description) => {
          handleModalClose();
          showErrorModal(heading, description);
        }}
      />

      <LocationSettingsModal
        isOpen={activeModal === "location"}
        onClose={handleModalClose}
        onSuccess={(heading, description) => {
          handleModalClose();
          showSuccessModal(heading, description);
        }}
        onError={(heading, description) => {
          handleModalClose();
          showErrorModal(heading, description);
        }}
      />

      <PriceSettingsModal
        isOpen={activeModal === "pricing"}
        onClose={handleModalClose}
        onSuccess={(heading, description) => {
          handleModalClose();
          showSuccessModal(heading, description);
        }}
        onError={(heading, description) => {
          handleModalClose();
          showErrorModal(heading, description);
        }}
      />

      <PasswordSettingsModal
        isOpen={activeModal === "password-settings"}
        onClose={handleModalClose}
        onSuccess={(heading, description) => {
          handleModalClose();
          showSuccessModal(heading, description);
        }}
        onError={(heading, description) => {
          handleModalClose();
          showErrorModal(heading, description);
        }}
      />

      <LabellingSettingsModal
        isOpen={activeModal === "labelling-settings"}
        onClose={handleModalClose}
        onSuccess={(heading, description) => {
          handleModalClose();
          showSuccessModal(heading, description);
        }}
        onError={(heading, description) => {
          handleModalClose();
          showErrorModal(heading, description);
        }}
      />

      <InventoryHubModal
        isOpen={activeModal === "inventory-hub"}
        onClose={handleModalClose}
        onSuccess={(heading, description) => {
          handleModalClose();
          showSuccessModal(heading, description);
        }}
        onError={(heading, description) => {
          handleModalClose();
          showErrorModal(heading, description);
        }}
      />

      <InvoiceCustomizationModal
        isOpen={activeModal === "invoice-customization"}
        onClose={handleModalClose}
        onSuccess={(heading, description) => {
          handleModalClose();
          showSuccessModal(heading, description);
        }}
        onError={(heading, description) => {
          handleModalClose();
          showErrorModal(heading, description);
        }}
        
      />

      <OperatingHoursModal
        isOpen={activeModal === "operating-hours"}
        onClose={handleModalClose}
        onSuccess={(heading, description) => {
          handleModalClose();
          showSuccessModal(heading, description);
        }}
        onError={(heading, description) => {
          handleModalClose();
          showErrorModal(heading, description);
        }}
      />

      <ReceiptCustomizationModal
        isOpen={activeModal === "receipt-customization"}
        onClose={handleModalClose}
        onSuccess={(heading, description) => {
          handleModalClose();
          showSuccessModal(heading, description);
        }}
        onError={(heading, description) => {
          handleModalClose();
          showErrorModal(heading, description);
        }}
      />

      <AccountSettingsModal
        isOpen={activeModal === "account-settings"}
        onClose={handleModalClose}
        onSuccess={(heading, description) => {
          handleModalClose();
          showSuccessModal(heading, description);
        }}
        onError={(heading, description) => {
          handleModalClose();
          showErrorModal(heading, description);
        }}
      />

      {/* Success Modal */}
      <SuccessToast
        isOpen={successModal.isOpen}
        heading={successModal.heading}
        description={successModal.description}
        onClose={handleSuccessModalClose}
      />
      <ErrorModal
        isOpen={errorModal.isOpen}
        heading={errorModal.heading}
        description={errorModal.description}
        onClose={handleErrorModalClose}
      />
    </div>
  );
};

export default SettingsPage;
