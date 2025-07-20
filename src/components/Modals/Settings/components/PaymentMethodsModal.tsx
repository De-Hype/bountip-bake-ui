import React, { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { Switch } from "../ui/Switch";
import { Trash2 } from "lucide-react";
import SettingFiles from "@/assets/icons/settings";
import { useSelectedOutlet } from "@/hooks/useSelectedOutlet";
import settingsService from "@/services/settingsService";
import { ApiResponseType } from "@/types/httpTypes";
import { useBusinessStore } from "@/stores/useBusinessStore";

interface PaymentMethod {
  id: number;
  name: string;
  isActive: boolean;
}

interface PaymentMethodsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (heading: string, description: string) => void;
  onError: (heading: string, description: string) => void;
}

const defaultMethods: Omit<PaymentMethod, "id">[] = [
  { name: "Cash", isActive: false },
  { name: "Virtual Wallet", isActive: false },
];

export const PaymentMethodsModal: React.FC<PaymentMethodsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onError,
}) => {
  const outlet = useSelectedOutlet();
  const outletId = outlet?.outlet?.id;
  const outletPaymenthods = outlet?.outlet?.paymentMethods?.methods;
  const { fetchBusinessData } = useBusinessStore();

  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [customName, setCustomName] = useState("");
  const [loading, setLoading] = useState(false);
  const [unsaved, setUnsaved] = useState(false);

  // Initialize from outletPaymenthods
  useEffect(() => {
    if (!isOpen) return;
    if (outletPaymenthods && Array.isArray(outletPaymenthods)) {
      // Ensure default methods are present
      const mapped = [...defaultMethods].map((def) => {
        const found = outletPaymenthods.find((m) => m.name === def.name);
        return found ? { ...found } : { id: Math.random(), ...def };
      });
      // Add any custom methods from outlet
      const customs = outletPaymenthods.filter(
        (m) => !defaultMethods.some((def) => def.name === m.name)
      );
      setMethods([...mapped, ...customs]);
    } else {
      setMethods(defaultMethods.map((def) => ({ id: Math.random(), ...def })));
    }
    setCustomName("");
    setUnsaved(false);
  }, [isOpen, outletPaymenthods]);

  // Track unsaved changes: if methods or customName differ from initial
  useEffect(() => {
    if (!isOpen) return;
    // Compare methods to outletPaymenthods
    const initial = outletPaymenthods || [];
    const current = methods.map(({ name, isActive }) => ({ name, isActive }));
    const initialSimple = initial.map(({ name, isActive }) => ({
      name,
      isActive,
    }));
    const methodsChanged =
      current.length !== initialSimple.length ||
      current.some(
        (m, i) =>
          !initialSimple[i] ||
          m.name !== initialSimple[i].name ||
          m.isActive !== initialSimple[i].isActive
      );
    setUnsaved(methodsChanged || !!customName.trim());
  }, [methods, customName, outletPaymenthods, isOpen]);

  const handleToggle = (id: number, isActive: boolean) => {
    setMethods((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isActive } : m))
    );
  };

  const handleCustomSubmit = () => {
    if (!customName.trim()) return;
    setMethods((prev) => [
      ...prev,
      {
        id: Math.random(),
        name: customName.trim(),
        isActive: false,
      },
    ]);
    setCustomName("");
  };

  const handleDelete = (id: number) => {
    setMethods((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSave = async () => {
    if (!outletId) return;
    setLoading(true);
    try {
      const response = (await settingsService.addPaymentMethod(
        outletId,
        methods.map(({ name, isActive }) => ({ name, isActive }))
      )) as ApiResponseType;
      if (response.status) {
        await fetchBusinessData();
        onSuccess("Payment Methods", "Payment Methods updated successfully");
      } else {
        onError("Payment Methods", "Failed to update payment methods");
      }
      console.log(response, "This is the response we got");
    } catch {
      onError("Payment Methods", "Failed to update payment methods");
    } finally {
      setLoading(false);
      onClose();
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
                {/* Icon logic can be improved if needed */}
                <span className="font-medium">{method.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={method.isActive}
                  onChange={(enabled) => handleToggle(method.id, enabled)}
                />
                {/* Only allow delete for custom methods */}
                {!defaultMethods.some((def) => def.name === method.name) && (
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
        {/* Always show custom payment method input */}
        <div className="mt-5 flex flex-col gap-3  mb-7 rounded-lg">
          <label className="text-[#1C1B20] font-bold text-[16px]">
            Name of Payment Method
          </label>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Enter payment method name"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="flex-1 bg-[#FAFAFC] border border-[#D1D1D1] outline-none rounded-[10px] px-4 py-3"
            />
          </div>
          <button
            onClick={handleCustomSubmit}
            className="w-full hover:bg-[#15BA5C] hover:text-white border border-[#15BA5C] py-[9.8px] text-[#15BA5C] rounded-[9.8px] text-[15px]"
            disabled={!customName.trim()}
          >
            + Add a Payment Method
          </button>
        </div>
        <div className="flex justify-end mt-6">
          <button
            onClick={handleSave}
            className={`w-full text-white h-10 rounded transition ${
              unsaved && !loading
                ? "bg-[#15BA5C] hover:bg-[#129b4f]"
                : "bg-gray-300 text-gray-400 border-gray-300 cursor-not-allowed"
            }`}
            disabled={!unsaved || loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
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
