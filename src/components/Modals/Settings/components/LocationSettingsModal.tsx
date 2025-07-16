import React, { useEffect, useRef, useState } from "react";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { BusinessLocation } from "@/types/settingTypes";
import SettingFiles from "@/assets/icons/settings";
import Image from "next/image";
import { Check, Trash2, Loader2 } from "lucide-react";
import settingsService from "@/services/settingsService";
import { toast } from "sonner";
import { useBusiness } from "@/hooks/useBusiness";
import { usePureOutlets } from "@/hooks/useSelectedOutlet";
import { ApiResponseType } from "@/types/httpTypes";
import { useBusinessStore } from "@/stores/useBusinessStore";

interface LocationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (heading: string, description: string) => void;
}

export const LocationSettingsModal: React.FC<LocationSettingsModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const outletsList = usePureOutlets();
  const [locations, setLocations] = useState<BusinessLocation[]>([]);
  const [newLocations, setNewLocations] = useState<Partial<BusinessLocation>[]>(
    [{ name: "", address: "", phoneNumber: "" }]
  );
  const { fetchBusinessData } = useBusinessStore();

  // Loading states
  const [isSaving, setIsSaving] = useState(false);
  const [deletingLocationId, setDeletingLocationId] = useState<string | null>(
    null
  );
  const [deletingNewLocationIndex, setDeletingNewLocationIndex] = useState<
    number | null
  >(null);

  const [editingDefaultLocation, setEditingDefaultLocation] = useState(false);

  const business = useBusiness();
  console.log(outletsList, "This is all the outlets");
  console.log(business, "This is the business");

  const businessId = business?.id;

  // Early return moved after hooks
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (isOpen && !hasInitialized.current) {
      const parsedLocations: BusinessLocation[] = outletsList.map((item) => ({
        id: String(item.id),
        name: item.name,
        address: item.address ?? "",
        phoneNumber: item.phoneNumber || "",
        isDefault: item.isMainLocation,
      }));

      setLocations(parsedLocations);
      setNewLocations([{ name: "", address: "", phoneNumber: "" }]);
      hasInitialized.current = true;
    }

    if (!isOpen) {
      hasInitialized.current = false;
      // Reset loading states when modal closes
      setIsSaving(false);
      setDeletingLocationId(null);
      setDeletingNewLocationIndex(null);
    }
  }, [isOpen, outletsList]);

  // Early return after hooks
  if (!businessId) {
    return null;
  }

  const defaultLocation = locations.find((loc) => loc.isDefault);
  const otherLocations = locations.filter((loc) => !loc.isDefault);

  // Check if the last new location has all required fields filled
  const isLastNewLocationComplete = () => {
    if (newLocations.length === 0) return true;
    const lastLocation = newLocations[newLocations.length - 1];
    return !!(
      lastLocation.name &&
      lastLocation.address &&
      lastLocation.phoneNumber
    );
  };

  const addNewLocationField = () => {
    // Only add new field if the last one is complete
    if (!isLastNewLocationComplete()) {
      toast.error(
        "Please fill in all fields for the current location before adding a new one"
      );
      return;
    }

    setNewLocations((prev) => [
      ...prev,
      { name: "", address: "", phoneNumber: "" },
    ]);
  };

  const updateNewLocation = (
    index: number,
    field: keyof BusinessLocation,
    value: string
  ) => {
    setNewLocations((prev) => {
      const updated = prev.map((loc, i) =>
        i === index ? { ...loc, [field]: value } : loc
      );
      console.log("Updated new locations:", updated); // Debug log
      return updated;
    });
  };

  const removeNewLocation = async (index: number) => {
    setDeletingNewLocationIndex(index);

    try {
      // If this is just a new location that hasn't been saved yet, no API call needed
      setNewLocations((prev) => prev.filter((_, i) => i !== index));
      onSuccess(
        "Save Successful!",
        "Your Location has been removed successfully"
      );
    } catch (error) {
      console.error("Error removing location:", error);
      toast.error("Failed to remove location");
    } finally {
      setDeletingNewLocationIndex(null);
    }
  };

  const removeExistingLocation = async (id: string) => {
    setDeletingLocationId(id);

    try {
      const response = (await settingsService.deleteBusinessLocation(
        id
      )) as ApiResponseType;

      console.log(response, "This is the deleted location");

      if (response.status) {
        setLocations((prev) => prev.filter((loc) => loc.id !== id));
        await fetchBusinessData();

onSuccess("Save Successful!", "Your Location has been removed successfully");      } else {
        toast.error("Failed to delete location");
      }
    } catch (error) {
      console.error("Error deleting location:", error);
      toast.error("Failed to delete location");
    } finally {
      setDeletingLocationId(null);
    }
  };

  const updateExistingLocation = (
    id: string,
    field: keyof BusinessLocation,
    value: string
  ) => {
    setLocations((prev) => {
      const updated = prev.map((loc) =>
        loc.id === id ? { ...loc, [field]: value } : loc
      );
      console.log("Updated locations:", updated); // Debug log
      return updated;
    });
  };

  const toggleDefaultLocationEdit = () => {
    setEditingDefaultLocation(!editingDefaultLocation);
  };

  const handleSave = async () => {
    if (!businessId) return;

    setIsSaving(true);

    // Only include locations that have a name and address filled in
    const validNewLocations = newLocations
      .filter((loc) => loc.name && loc.address && loc.phoneNumber)
      .map((loc) => ({
        name: loc.name!,
        address: loc.address!,
        phoneNumber: loc.phoneNumber!,
      }));

    try {
      // Submit each location to the backend
      await Promise.all(
        validNewLocations.map((loc) =>
          settingsService.addNewBusinessLocation({
            businessId,
            name: loc.name,
            address: loc.address,
            phoneNumber: loc.phoneNumber,
          })
        )
      );

      setNewLocations([{ name: "", address: "", phoneNumber: "" }]);
      setEditingDefaultLocation(false);
      onSuccess(
        "Save Successful!",
        "Your Location has been saved successfully"
      );      await fetchBusinessData();
      onClose(); // Close the modal after saving
    } catch (error) {
      console.error("Error saving locations", error);
      toast.error("Failed to save locations");
    } finally {
      setIsSaving(false);
    }
  };

  // Helper component for loading spinner
  const LoadingSpinner = () => <Loader2 className="h-4 w-4 animate-spin" />;

  return (
    <Modal
      size="md"
      subtitle="Add and edit multiple Business location"
      image={SettingFiles.LocationIcon}
      isOpen={isOpen}
      onClose={onClose}
      title="Location"
    >
      <div className="space-y-6">
        {/* Default Business Location */}
        <div>
          <h3 className="font-medium text-gray-900 mb-4">
            Default Business Location
          </h3>
          {defaultLocation && (
            <div className="border border-gray-200 rounded-lg p-4">
              {editingDefaultLocation ? (
                // Edit mode for default location
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <Input
                      value={defaultLocation.name || ""}
                      onChange={(e) => {
                        console.log(
                          "Default location name change:",
                          e.target.value
                        );
                        updateExistingLocation(
                          defaultLocation.id,
                          "name",
                          e.target.value
                        );
                      }}
                      placeholder="Enter Name e.g Main Branch"
                      disabled={isSaving}
                    />
                  </div>
                  <div className="col-span-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <Input
                      value={defaultLocation.address || ""}
                      onChange={(e) => {
                        console.log(
                          "Default location address change:",
                          e.target.value
                        );
                        updateExistingLocation(
                          defaultLocation.id,
                          "address",
                          e.target.value
                        );
                      }}
                      placeholder="Enter Address"
                      disabled={isSaving}
                    />
                  </div>
                  <div className="col-span-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <Input
                      value={defaultLocation.phoneNumber || ""}
                      onChange={(e) => {
                        console.log(
                          "Default location phone change:",
                          e.target.value
                        );
                        updateExistingLocation(
                          defaultLocation.id,
                          "phoneNumber",
                          e.target.value
                        );
                      }}
                      placeholder="Enter Phone Number"
                      disabled={isSaving}
                    />
                  </div>
                  <div className="col-span-1 flex items-end pb-2 justify-center">
                    <button
                      type="button"
                      onClick={toggleDefaultLocationEdit}
                      disabled={isSaving}
                      className="p-2 text-green-500 hover:text-green-700 border border-green-200 rounded-lg hover:border-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                // View mode for default location
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <span className="font-medium block">
                      {defaultLocation.name}
                    </span>
                    <p className="text-sm text-gray-600 mt-1">
                      {defaultLocation.address}
                    </p>
                    <p className="text-sm text-gray-600">
                      {defaultLocation.phoneNumber}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={toggleDefaultLocationEdit}
                    disabled={isSaving}
                    className="bg-[#15BA5C] flex items-center rounded-[20px] px-2.5 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Image
                      src={SettingFiles.EditIcon}
                      alt="Edit"
                      className="h-[14px] w-[14px] mr-1"
                    />
                    <span className="text-white text-sm">Edit</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Other Business Locations */}
        <div>
          <h3 className="font-medium text-gray-900 mb-4">
            Other Business Location
          </h3>
          <div className="space-y-4">
            {/* Existing other locations */}
            {otherLocations.map((location) => (
              <div
                key={location.id}
                className="grid grid-cols-12 gap-4 items-end"
              >
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <Input
                    value={location.name || ""}
                    onChange={(e) => {
                      console.log(
                        "Other location name change:",
                        e.target.value
                      );
                      updateExistingLocation(
                        location.id,
                        "name",
                        e.target.value
                      );
                    }}
                    placeholder="Enter Name e.g Abuja Branch"
                    disabled={isSaving || deletingLocationId === location.id}
                  />
                </div>
                <div className="col-span-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <Input
                    value={location.address || ""}
                    onChange={(e) => {
                      console.log(
                        "Other location address change:",
                        e.target.value
                      );
                      updateExistingLocation(
                        location.id,
                        "address",
                        e.target.value
                      );
                    }}
                    placeholder="Enter Address"
                    disabled={isSaving || deletingLocationId === location.id}
                  />
                </div>
                <div className="col-span-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <Input
                    value={location.phoneNumber || ""}
                    onChange={(e) => {
                      console.log(
                        "Other location phone change:",
                        e.target.value
                      );
                      updateExistingLocation(
                        location.id,
                        "phoneNumber",
                        e.target.value
                      );
                    }}
                    placeholder="Enter Phone Number"
                    disabled={isSaving || deletingLocationId === location.id}
                  />
                </div>
                <div className="col-span-1 flex items-end pb-2 justify-center">
                  <button
                    type="button"
                    onClick={() => removeExistingLocation(location.id)}
                    disabled={isSaving || deletingLocationId === location.id}
                    className="p-2 text-red-500 hover:text-red-700 border border-red-200 rounded-lg hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingLocationId === location.id ? (
                      <LoadingSpinner />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}

            {/* New location fields */}
            {newLocations.map((location, index) => (
              <div
                key={`new-${index}`}
                className="grid grid-cols-12 gap-4 items-end"
              >
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <Input
                    value={location.name || ""}
                    onChange={(e) =>
                      updateNewLocation(index, "name", e.target.value)
                    }
                    placeholder="Enter Name e.g Abuja Branch"
                    disabled={isSaving || deletingNewLocationIndex === index}
                  />
                </div>
                <div className="col-span-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <Input
                    value={location.address || ""}
                    onChange={(e) =>
                      updateNewLocation(index, "address", e.target.value)
                    }
                    placeholder="Enter Address"
                    disabled={isSaving || deletingNewLocationIndex === index}
                  />
                </div>
                <div className="col-span-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <Input
                    value={location.phoneNumber || ""}
                    onChange={(e) =>
                      updateNewLocation(index, "phoneNumber", e.target.value)
                    }
                    placeholder="Enter Phone Number"
                    disabled={isSaving || deletingNewLocationIndex === index}
                  />
                </div>
                <div className="col-span-1 flex items-end pb-2 justify-center">
                  <button
                    type="button"
                    onClick={() => removeNewLocation(index)}
                    disabled={isSaving || deletingNewLocationIndex === index}
                    className="p-2 text-red-500 hover:text-red-700 border border-red-200 rounded-lg hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingNewLocationIndex === index ? (
                      <LoadingSpinner />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add New Location Button */}
        <button
          onClick={addNewLocationField}
          disabled={isSaving}
          className="border border-[#15BA5C] w-full text-[#15BA5C] py-3 rounded-[10px] font-medium text-base mt-5 disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
        >
          + Add a new Location
        </button>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center justify-center gap-2 bg-[#15BA5C] w-full text-[#ffffff] py-3 rounded-[10px] font-medium text-base mt-5 disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
          >
            {isSaving ? <LoadingSpinner /> : <Check className="h-4 w-4" />}
            <span>{isSaving ? "Saving..." : "Save Location"}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
