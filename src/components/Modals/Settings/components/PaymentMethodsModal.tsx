import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Switch } from "../ui/Switch";
import { CreditCard, Smartphone, Banknote, Trash2 } from "lucide-react";
import { PaymentMethod } from "@/types/settingTypes";
import SettingFiles from "@/assets/icons/settings";

interface PaymentMethodsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (heading: string, description: string) => void;
  onError: (heading: string, description: string) => void;
}

const defaultMethods: PaymentMethod[] = [
  { id: "1", name: "Cash", type: "cash", enabled: false },
  { id: "2", name: "Virtual Wallet", type: "virtual", enabled: false },
  { id: "3", name: "Others", type: "others", enabled: false },
];

export const PaymentMethodsModal: React.FC<PaymentMethodsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onError,
}) => {
  const [methods, setMethods] = useState<PaymentMethod[]>(defaultMethods);
  const [customName, setCustomName] = useState("");
  const [idCounter, setIdCounter] = useState(100);

  const handleToggle = (id: string, enabled: boolean) => {
    setMethods((prev) =>
      prev.map((m) =>
        enabled
          ? { ...m, enabled: m.id === id }
          : m.id === id
          ? { ...m, enabled: false }
          : m
      )
    );
    if (!enabled) {
      setCustomName("");
    }
  };

  const handleOthersSubmit = () => {
    if (!customName.trim()) return;

    const newMethod: PaymentMethod = {
      id: idCounter.toString(),
      name: customName.trim(),
      type: "others",
      enabled: true,
    };

    setMethods((prev) =>
      prev.map((m) => ({ ...m, enabled: false })).concat(newMethod)
    );

    setCustomName("");
    setIdCounter((prev) => prev + 1);
  };

  const handleDelete = (id: string) => {
    setMethods((prev) => prev.filter((m) => m.id !== id));
    setCustomName("");
  };

  const handleSave = () => {
    onClose();
  };

  const selectedMethod = methods.find((m) => m.enabled);
  const isSaveDisabled = !selectedMethod;

  const isOthersSelected = methods.some(
    (m) => m.type === "others" && m.name === "Others" && m.enabled
  );

  const getCustomOthersMethod = () =>
    methods.find((m) => m.type === "others" && m.name !== "Others");

  const getIcon = (type: string) => {
    switch (type) {
      case "cash":
        return <Banknote className="w-5 h-5 text-green-600" />;
      case "virtual":
        return <Smartphone className="w-5 h-5 text-blue-600" />;
      default:
        return <CreditCard className="w-5 h-5 text-purple-600" />;
    }
  };

  return (
    <Modal
      size="sm"
      image={SettingFiles.PaymentMethods}
      isOpen={isOpen}
      onClose={onClose}
      title="Payment Methods"
      subtitle="Manage your payment methods"
    >
      <div className="space-y-4">
        <PaymentBanner heading="Activate Payment Methods for your Business" />

        <div className="flex flex-col gap-6">
          {methods.map((method) => (
            <div
              key={method.id}
              className="flex items-center justify-between p-4 border border-[#D1D1D1] rounded-lg"
            >
              <div className="flex items-center gap-3">
                {getIcon(method.type)}
                <span className="font-medium">{method.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={method.enabled}
                  onChange={(enabled) => handleToggle(method.id, enabled)}
                />
                {method.type === "others" && method.name !== "Others" && (
                  <button
                    onClick={() => handleDelete(method.id)}
                    className="text-red-500 hover:text-red-700"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {isOthersSelected && (
          <div className="mt-4 flex flex-col gap-3 border border-[#D1D1D1] p-4 rounded-lg">
            <label className="text-[#1C1B20] text-[16px]">
              Name of Payment Method
            </label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Enter payment method name"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="flex-1 border border-[#D1D1D1] outline-none rounded-[10px] px-4 py-3"
              />
              {getCustomOthersMethod() && (
                <button
                  onClick={() => handleDelete(getCustomOthersMethod()!.id)}
                  className="text-red-500 hover:text-red-700"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
            <button
              onClick={handleOthersSubmit}
              className="w-full hover:bg-[#15BA5C] hover:text-white border border-[#15BA5C] py-[9.8px] text-[#15BA5C] rounded-[9.8px] text-[15px]"
              disabled={!customName.trim()}
            >
              + Add a Payment Method
            </button>
          </div>
        )}

        <div className="flex justify-end mt-6">
          <Button
            onClick={handleSave}
            className="w-full"
            disabled={isSaveDisabled}
          >
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
};

interface PaymentBannerProps {
  className?: string;
  heading: string;
}

const PaymentBanner: React.FC<PaymentBannerProps> = ({
  className = "",
  heading,
}) => {
  return (
    <div
      className={`relative bg-[#15BA5C] rounded-lg px-6 py-6 overflow-hidden ${className}`}
    >
      <h2 className="text-white text-lg font-medium relative z-10">
        {heading}
      </h2>
      <div className="absolute right-0 bottom-1/2 transform -translate-y-1/2 pointer-events-none">
        <div className="absolute w-40 h-40 border-2 border-white/30 rounded-full -top-24 -right-20"></div>
        <div className="absolute w-24 h-24 border-2 border-white/40 rounded-full -top-12 -right-10"></div>
        <div className="absolute w-5 h-5 bg-white rounded-full -top-3 right-10"></div>
        <div className="absolute w-8 h-8 bg-green-900 rounded-full top-2 right-2"></div>
      </div>
    </div>
  );
};
