import SettingFiles from "@/assets/icons/settings";
import { Modal } from "../ui/Modal";
import { useState } from "react";
import { Input } from "../ui/Input";
import settingsService from "@/services/settingsService";
import { ApiResponseType } from "@/types/httpTypes";
import { toast } from "sonner";
import { HubType } from "@/types/settingTypes";
import { useBusiness } from "@/hooks/useBusiness";

export const InventoryHubModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  
  const [formData, setFormData] = useState({
    name: "",
    location: "",
  });
  const businessId = useBusiness()?.id;
  if (!businessId) return;

  const handleCreateInventory = async () => {
    const result = (await settingsService.addInventoryHub({
      businessId,
      name: formData.name,
      address: formData.location,
      hubType: HubType.CENTRAL,
    })) as ApiResponseType;
    if (result.status) {
      toast.success("Inventory hub created successfully");
      setFormData({ location: "", name: "" });
      onClose();
      return;
    } else {
      toast.error("Inventory Hub created succesfully");
    }
  };

  

  return (
    <Modal
      image={SettingFiles.InventoryIcon}
      isOpen={isOpen}
      onClose={onClose}
      title="Inventory Hub"
      subtitle="Create a centralized Inventory Hub to manage your in items"
    >
      <div className="space-y-6">
        <Input
          className="outline-none"
          label="Name your Inventory Hub"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder="Enter Your Inventory eg Main Warehouse"
        />

        <Input
          className="outline-none"
          label="Location"
          value={formData.location}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, location: e.target.value }))
          }
          placeholder="Enter Location"
        />

        <button type="button" onClick={handleCreateInventory} className="w-full bg-[#15BA5C] py-[9.8px] text-white rounded-[9.8px]">
          Create Inventory Hub
        </button>
      </div>
    </Modal>
  );
};
