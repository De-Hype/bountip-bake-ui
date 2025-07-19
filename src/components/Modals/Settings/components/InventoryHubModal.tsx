import SettingFiles from "@/assets/icons/settings";
import { Modal } from "../ui/Modal";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Input } from "../ui/Input";
import settingsService from "@/services/settingsService";
import { ApiResponseType } from "@/types/httpTypes";
import { HubType } from "@/types/settingTypes";
import { useBusiness } from "@/hooks/useBusiness";

interface Hub {
  name: string;
  address: string;
}

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
  // Remove loading state
  const businessId = useBusiness()?.id;

  // Fetch inventory hub data with react-query
  const {
    data: hubData,
    isLoading: isHubLoading,
    isError: isHubError,
  } = useQuery<ApiResponseType | undefined>({
    queryKey: ["inventoryHub", businessId],
    queryFn: async () => {
      if (businessId) {
        return (await settingsService.getInventoryHub(
          businessId
        )) as ApiResponseType;
      } else {
        return undefined;
      }
    },
    enabled: !!businessId && isOpen,
  });

  useEffect(() => {
    if (
      hubData &&
      typeof hubData === "object" &&
      "data" in hubData &&
      hubData.data &&
      typeof hubData.data === "object" &&
      hubData.data !== null &&
      "hubs" in hubData.data &&
      Array.isArray((hubData.data as { hubs: Hub[] }).hubs)
    ) {
      const hubList: Hub[] = Array.isArray(
        (hubData.data as { hubs: Hub[] }).hubs
      )
        ? ((hubData.data as { hubs: Hub[] }).hubs as Hub[])
        : [];
      if (hubList.length > 0) {
        const firstHub = hubList[0];
        if (
          firstHub &&
          typeof firstHub === "object" &&
          "name" in firstHub &&
          "address" in firstHub
        ) {
          const { name, address } = firstHub as any;
          setFormData({ name, address });
        }
      }
    }
  }, [hubData]);

  useEffect(() => {
    if (isHubError) {
      onError("Failed", "Failed to load inventory hubs.");
    }
  }, [isHubError, onError]);

  // Mutation for creating inventory hub
  const createInventoryMutation = useMutation<ApiResponseType, unknown, void>({
    mutationFn: () =>
      settingsService.addInventoryHub({
        businessId: businessId as number,
        name: formData.name,
        address: formData.address,
        hubType: HubType.CENTRAL,
      }) as Promise<ApiResponseType>,
    onSuccess: (result) => {
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
        onError("Failed", "Inventory Hub failed to create");
      }
    },
    onError: () => {
      onError("Failed", "Something went wrong while creating Inventory Hub");
    },
  });

  const handleCreateInventory = () => {
    if (!formData.name.trim() || !formData.address.trim()) {
      onError("Failed", "Please fill in both name and location");
      return;
    }
    if (!businessId) {
      onError("Failed", "Business ID not found");
      return;
    }
    createInventoryMutation.mutate();
  };

  if (!businessId) return null;
  if (isHubLoading) return <div className="p-6">Loading inventory hub...</div>;
  if (isHubError)
    return <div className="p-6 text-red-500">Error loading inventory hub.</div>;

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
          disabled={createInventoryMutation.isPending}
        >
          {createInventoryMutation.isPending
            ? "Creating..."
            : "Create Inventory Hub"}
        </button>
      </div>
    </Modal>
  );
};
