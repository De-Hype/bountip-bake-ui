import SettingFiles from "@/assets/icons/settings";
import { Modal } from "../ui/Modal";
import { useEffect, useState } from "react";
import { Input } from "../ui/Input";
import settingsService from "@/services/settingsService";
import { ApiResponseType } from "@/types/httpTypes";
import { HubType } from "@/types/settingTypes";
import { useBusiness } from "@/hooks/useBusiness";

interface InventoryForm {
  name: string;
  address: string;
}

export const InventoryHubModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (heading: string, description: string) => void;
  onError: (heading: string, description: string) => void;
}> = ({ isOpen, onClose, onSuccess, onError }) => {
  const [formData, setFormData] = useState<InventoryForm>({
    name: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const businessId = useBusiness()?.id;

  useEffect(() => {
    if (!isOpen || !businessId) return;

    const fetchData = async () => {
      console.log("Fetching inventory hubs...");

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response:any = await settingsService.getInventoryHub(
          businessId as number
        ) 
        console.log("Response:", response);

        const hubList = response?.data?.hubs;
        if (Array.isArray(hubList) && hubList.length > 0) {
          const firstHub = hubList[0];
          const { name, address } = firstHub;
          setFormData({ name, address });
        }
      } catch (error) {
        console.error("Error fetching inventory hubs:", error);
        onError("Failed to load inventory hubs.", "Failed to load inventory hubs.");
      }
    };

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId, isOpen]);
  

  const handleCreateInventory = async () => {
    if (!formData.name.trim() || !formData.address.trim()) {
      onError("Please fill in both name and location", "Please fill in both name and location");
      return;
    }

    if (!businessId) {
      onError("Business ID not found", "Business ID not found");
      return;
    }

    setLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result:any = (await settingsService.addInventoryHub({
        businessId,
        name: formData.name,
        address: formData.address,
        hubType: HubType.CENTRAL,
      })) as ApiResponseType;

      if (result.status && result.data) {
        onSuccess(
          "Inventory Hub Created!",
          "Your Inventory has been created successfully"
        );
        setFormData({
          name: result.data.name,
          address: result.data.address,
        });
        onClose();
      } else {
        onError("Inventory Hub failed to create", "Inventory Hub failed to create");
      }
    } catch (error) {
      console.error(error);
      onError("Something went wrong while creating Inventory Hub", "Something went wrong while creating Inventory Hub");
    } finally {
      setLoading(false);
    }
  };

  if (!businessId) return null;

  return (
    <Modal
      image={SettingFiles.InventoryIcon}
      isOpen={isOpen}
      onClose={onClose}
      title="Inventory Hub"
      subtitle="Create a centralized Inventory Hub to manage your items"
    >
      <div className="space-y-6">
        <Input
          className="outline-none"
          label="Name your Inventory Hub"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder="Enter Your Inventory e.g. Main Warehouse"
        />

        <Input
          className="outline-none"
          label="Location"
          value={formData.address}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, address: e.target.value }))
          }
          placeholder="Enter Location"
        />

        <button
          type="button"
          onClick={handleCreateInventory}
          className="w-full bg-[#15BA5C] py-[9.8px] text-white rounded-[9.8px] hover:bg-[#13A652] transition-colors disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Inventory Hub"}
        </button>
      </div>
    </Modal>
  );
};
