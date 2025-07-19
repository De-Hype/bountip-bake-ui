import React, { useState, useRef } from "react";
import { Modal } from "../ui/Modal";
import SettingFiles from "@/assets/icons/settings";
import Image from "next/image";
import { Input } from "../ui/Input";
import settingsService from "@/services/settingsService";
import { useBusinessStore } from "@/stores/useBusinessStore";
import { ApiResponseType } from "@/types/httpTypes";

interface PriceTier {
  id: number;
  name: string;
  description: string;
  pricingRules: {
    markupPercentage?: number;
    discountPercentage?: number;
    fixedMarkup?: number;
    fixedDiscount?: number;
  };
  isActive: boolean;
  isEditing?: boolean;
  isNew?: boolean; // Flag to track newly added tiers
}

interface PriceTierFormRef {
  addPendingTier: () => PriceTier | null;
  getPendingTier: () => PriceTier | null;
  resetForm: () => void;
  hasFormData: () => boolean;
}

interface PriceTierFormProps {
  onAdd: (tier: Omit<PriceTier, "id" | "isActive">) => void;
  onError: (heading: string, description: string) => void;
}

interface PriceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (heading: string, description: string) => void;
  onError: (heading: string, description: string) => void;
}

// Temporary ID counter for new tiers (ensures uniqueness without uuid)
let tempIdCounter = -1;

export const PriceSettingsModal: React.FC<PriceSettingsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onError,
}) => {
  const { selectedOutletId, outlets, fetchBusinessData } = useBusinessStore();
  const [tiers, setTiers] = useState<PriceTier[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<{ [key: number]: boolean }>({});
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isEditing, setIsEditing] = useState<{ [key: number]: boolean }>({});
  const priceTierFormRef = useRef<PriceTierFormRef>(null);

  // Initialize tiers only when modal opens and selectedOutletId exists
  React.useEffect(() => {
    if (isOpen && selectedOutletId) {
      const outlet = outlets.find((val) => val.outlet.id === selectedOutletId);
      if (outlet && Array.isArray(outlet.outlet.priceTier)) {
        console.log(outlet.outlet.priceTier, "Loaded tiers");
        setTiers(
          outlet.outlet.priceTier.map((tier) => ({ ...tier, isEditing: false }))
        );
      } else {
        setTiers([]);
      }
    }
  }, [isOpen, selectedOutletId, outlets]);

  if (!selectedOutletId) return null;

  const addTier = (tier: Omit<PriceTier, "id" | "isActive">) => {
    const newTier: PriceTier = {
      ...tier,
      id: tempIdCounter--, // Use decrementing counter for unique temp IDs
      isActive: true,
      isNew: true, // Mark as new
    };
    setTiers((prev) => [...prev, newTier]);
  };

  const deleteTier = async (id: number) => {
    const tierToDelete = tiers.find((t) => t.id === id);

    // Set deleting state for this specific tier
    setIsDeleting((prev) => ({ ...prev, [id]: true }));

    try {
      // If it's a new tier (not saved to backend), just remove from state
      if (tierToDelete?.isNew) {
        setTiers((prev) => prev.filter((t) => t.id !== id));
        return;
      }

      // Otherwise, delete from backend
      const result = (await settingsService.deletePriceTier({
        outletId: selectedOutletId,
        priceTierId: id,
      })) as ApiResponseType;

      if (result.status) {
        setTiers((prev) => prev.filter((t) => t.id !== id));
        onSuccess(
          "Delete Successful!",
          "Your Price Tier has been Deleted Successfully"
        );
        await fetchBusinessData();
      } else {
        onError("Failed ", "Failed to delete price tier");
      }
    } catch (error) {
      console.error("Failed to delete tier", error);
      onError("Failed to delete price tier", "Failed to delete price tier");
    } finally {
      setIsDeleting((prev) => ({ ...prev, [id]: false }));
    }
  };

  const toggleEdit = (id: number) => {
    setTiers((prev) =>
      prev.map((tier) =>
        tier.id === id ? { ...tier, isEditing: !tier.isEditing } : tier
      )
    );
  };

  const updateTier = async (id: number, updatedTier: Partial<PriceTier>) => {
    const { description, name, pricingRules } = updatedTier;
    const response = (await settingsService.updatePriceTier({
      outletId: selectedOutletId,
      tierId: id,
      name,
      description,
      pricingRules: {
        discountPercentage: pricingRules?.discountPercentage,
        fixedDiscount: pricingRules?.fixedDiscount,
        fixedMarkup: pricingRules?.fixedMarkup,
        markupPercentage: pricingRules?.markupPercentage,
      },
    })) as ApiResponseType;
    if (response.status) {
      const tier = tiers.find((t) => t.id === id);
      if (tier && !tier.isNew) {
        saveTierToBackend({ ...tier, ...updatedTier });
      }
      setTiers((prev) =>
        prev.map((tier) =>
          tier.id === id ? { ...tier, ...updatedTier } : tier
        )
      );
      await fetchBusinessData();
    }

    // If it's not a new tier, save to backend immediately
  };

  const saveTierToBackend = async (tier: PriceTier) => {
    try {
      if (tier.isNew) {
        // Create new tier
        const result = (await settingsService.addPriceTier({
          outletId: selectedOutletId,
          name: tier.name,
          description: tier.description,
          pricingRules: tier.pricingRules,
          isActive: tier.isActive,
        })) as ApiResponseType;

        if (result.status) {
          // Update the tier in state to mark it as saved
          setTiers((prev) =>
            prev.map((t) => (t.id === tier.id ? { ...t, isNew: false } : t))
          );
          return true;
        } else {
          throw new Error("Failed to save tier");
        }
      }
      return true;
    } catch (error) {
      console.error("Failed to save tier", error);
      onError("Failed to save price tier", "Failed to save price tier");
      return false;
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const formRef = priceTierFormRef.current;
      const hasFormData = formRef?.hasFormData();
      const tiersToSave: PriceTier[] = [];

      // ✅ Step 1: Add pending tier from form
      if (hasFormData) {
        const pendingTier = formRef?.addPendingTier();
        if (!pendingTier) {
          setIsSaving(false);
          return;
        }
        // Add the pending tier to the state so it's managed like others
        setTiers((prev) => [...prev, pendingTier]);
        tiersToSave.push(pendingTier);
      }

      // ✅ Step 2: Add other `isNew` tiers from state
      const newTiers = tiers.filter((tier) => tier.isNew);
      tiersToSave.push(...newTiers);

      if (tiersToSave.length === 0) {
        onError("No new price tiers to save.", "No new price tiers to save.");
        return;
      }

      const results = await Promise.allSettled(
        tiersToSave.map((tier) =>
          settingsService.addPriceTier({
            outletId: selectedOutletId,
            name: tier.name,
            description: tier.description,
            pricingRules: tier.pricingRules,
            isActive: tier.isActive,
          })
        )
      );

      const failed = results.filter((res) => res.status === "rejected");
      const succeeded = results.filter((res) => res.status === "fulfilled");

      if (failed.length > 0) {
        onError(`${failed.length} tier(s) failed to save.`, `${failed.length} tier(s) failed to save.`);
      }

      if (succeeded.length > 0) {
        onSuccess("Save Successful!", "Save Successful!");
        setTiers((prev) => prev.map((t) => ({ ...t, isNew: false })));
        formRef?.resetForm();
        await fetchBusinessData();
      }
    } catch (error) {
      console.error("Failed to save tiers", error);
      onError("An unexpected error occurred while saving price tiers.", "An unexpected error occurred while saving price tiers.");
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function to get display values for markup/discount
  const getDisplayValue = (tier: PriceTier) => {
    const markup = tier.pricingRules.markupPercentage || 0;
    const discount = tier.pricingRules.discountPercentage || 0;
    return { markup, discount };
  };

  // // Check if there are any tiers to save (including form data)
  // const hasUnsavedTiers = () => {
  //   const hasNewTiers = tiers.some((tier) => tier.isNew);
  //   const hasFormData = priceTierFormRef.current?.hasFormData();
  //   return hasNewTiers || hasFormData;
  // };

  return (
    <Modal
      size="md"
      subtitle="Add, create and remove price tiers"
      image={SettingFiles.PriceTier}
      isOpen={isOpen}
      onClose={onClose}
      title="Price Settings"
    >
      <div className="space-y-6">
        {tiers.length > 0 &&
          tiers.map((tier) => {
            const { markup, discount } = getDisplayValue(tier);
            const isCurrentlyDeleting = isDeleting[tier.id];
            const isCurrentlyEditing = isEditing[tier.id];

            return (
              <div
                key={tier.id}
                className="rounded-lg p-4 border border-gray-200"
              >
                {tier.isEditing ? (
                  <EditableTierForm
                    tier={tier}
                    onSave={async (updatedTier) => {
                      await updateTier(tier.id, {
                        ...updatedTier,
                        isEditing: false,
                      });
                    }}
                    onCancel={() => toggleEdit(tier.id)}
                    isLoading={isCurrentlyEditing}
                    onError={onError}
                  />
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{tier.name}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleEdit(tier.id)}
                          type="button"
                          disabled={isCurrentlyDeleting || isCurrentlyEditing}
                          className={`bg-[#15BA5C] flex items-center rounded-[20px] px-2.5 py-1.5 transition-colors ${
                            isCurrentlyDeleting || isCurrentlyEditing
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:bg-[#13a552]"
                          }`}
                        >
                          <Image
                            src={SettingFiles.EditIcon}
                            alt="Edit"
                            className="h-[14px] w-[14px] mr-1"
                          />
                          <span className="text-white">Edit</span>
                        </button>
                        <button
                          onClick={() => deleteTier(tier.id)}
                          type="button"
                          disabled={isCurrentlyDeleting || isCurrentlyEditing}
                          className={`border border-[#E33629] flex items-center rounded-[20px] px-2.5 py-1.5 transition-colors ${
                            isCurrentlyDeleting || isCurrentlyEditing
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:bg-red-50"
                          }`}
                        >
                          <Image
                            src={SettingFiles.TrashIcon}
                            alt="Delete"
                            className="h-[14px] w-[14px] mr-1"
                          />
                          <span className="text-[#E33629]">
                            {isCurrentlyDeleting ? "Deleting..." : "Delete"}
                          </span>
                        </button>
                      </div>
                    </div>

                    {tier.description && (
                      <div className="text-sm text-gray-600 mb-2">
                        {tier.description}
                      </div>
                    )}

                    <div className="text-sm text-gray-600 space-y-2">
                      {markup > 0 && (
                        <div className="border border-[#E6E6E6] px-3.5 py-2.5 rounded-[12px]">
                          Markup: {markup}%
                        </div>
                      )}
                      {discount > 0 && (
                        <div className="border border-[#E6E6E6] px-3.5 py-2.5 rounded-[12px]">
                          Discount: {discount}%
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}

        <div>
          <h4 className="font-medium mb-4">Add New Price Tier</h4>
          <PriceTierForm ref={priceTierFormRef} onAdd={addTier} onError={onError} />
        </div>

        {/* Show save button if there are unsaved tiers */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className={`w-full text-white py-3 rounded-[10px] font-medium text-base transition-colors ${
              isSaving
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#15BA5C] hover:bg-[#13a552]"
            }`}
            type="button"
          >
            {isSaving ? "Saving..." : "Save Price Tiers"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Editable form component for existing tiers
interface EditableTierFormProps {
  tier: PriceTier;
  onSave: (tier: Partial<PriceTier>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  onError: (heading: string, description: string) => void;
}

const EditableTierForm: React.FC<EditableTierFormProps> = ({
  tier,
  onSave,
  onCancel,
  isLoading = false,
  onError,
}) => {
  const [editedTier, setEditedTier] = useState({
    name: tier.name,
    description: tier.description || "",
    markupPercent: tier.pricingRules.markupPercentage || 0,
    discountPercent: tier.pricingRules.discountPercentage || 0,
  });

  const [markupEnabled, setMarkupEnabled] = useState(
    (tier.pricingRules.markupPercentage || 0) > 0
  );
  const [discountEnabled, setDiscountEnabled] = useState(
    (tier.pricingRules.discountPercentage || 0) > 0
  );

  const handleMarkupToggle = (enabled: boolean) => {
    setMarkupEnabled(enabled);
    if (enabled) {
      setDiscountEnabled(false);
      setEditedTier((prev) => ({ ...prev, discountPercent: 0 }));
    } else {
      setEditedTier((prev) => ({ ...prev, markupPercent: 0 }));
    }
  };

  const handleDiscountToggle = (enabled: boolean) => {
    setDiscountEnabled(enabled);
    if (enabled) {
      setMarkupEnabled(false);
      setEditedTier((prev) => ({ ...prev, markupPercent: 0 }));
    } else {
      setEditedTier((prev) => ({ ...prev, discountPercent: 0 }));
    }
  };

  const handleSave = async () => {
    if (!editedTier.name || editedTier.name.trim() === "") {
      onError("Please enter a price tier name.", "Please enter a price tier name.");
      return; 
    }

    await onSave({
      name: editedTier.name.trim(),
      description: editedTier.description.trim(),
      pricingRules: {
        markupPercentage: markupEnabled ? editedTier.markupPercent : undefined,
        discountPercentage: discountEnabled
          ? editedTier.discountPercent
          : undefined,
      },
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          Price Tier Name
        </label>
        <input
          type="text"
          className="w-full px-4 py-3 bg-white border border-[#D1D1D1] outline-none rounded-lg"
          value={editedTier.name}
          onChange={(e) =>
            setEditedTier({ ...editedTier, name: e.target.value })
          }
          placeholder="Enter the name of the Price Tier"
          disabled={isLoading}
        />
      </div>

      <div>
        <label className=" text-sm flex items-center gap-1.5 font-medium mb-1">
          <span className="">Description</span>
          <span className="text-[#15BA5C]">(optional)</span>
        </label>
        <textarea
          className="w-full px-4 py-3 bg-white border border-gray-300 outline-none rounded-lg resize-none text-sm"
          value={editedTier.description}
          onChange={(e) =>
            setEditedTier({ ...editedTier, description: e.target.value })
          }
          placeholder="Enter description"
          rows={3}
          disabled={isLoading}
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="markup-checkbox"
            checked={markupEnabled}
            onChange={(e) => handleMarkupToggle(e.target.checked)}
            className="appearance-none w-3 h-3 border-2 border-[#15BA5C] rounded-full checked:bg-[#15BA5C] checked:border-[#15BA5C] focus:outline-none focus:ring-2 focus:ring-[#15BA5C] cursor-pointer"
            disabled={isLoading}
          />
          <label htmlFor="markup-checkbox" className="text-sm font-medium">
            Markup %
          </label>
        </div>

        {markupEnabled && (
          <Input
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg outline-none"
            type="text"
            min={0}
            max={100}
            value={editedTier.markupPercent || ""}
            onChange={(e) =>
              setEditedTier({
                ...editedTier,
                markupPercent: parseFloat(e.target.value) || 0,
              })
            }
            placeholder="Enter markup percentage"
            disabled={isLoading}
          />
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="discount-checkbox"
            checked={discountEnabled}
            onChange={(e) => handleDiscountToggle(e.target.checked)}
            className="appearance-none w-3 h-3 border-2 border-[#15BA5C] rounded-full checked:bg-[#15BA5C] checked:border-[#15BA5C] focus:outline-none focus:ring-2 focus:ring-[#15BA5C] cursor-pointer"
            disabled={isLoading}
          />
          <label htmlFor="discount-checkbox" className="text-sm font-medium">
            Discount %
          </label>
        </div>

        {discountEnabled && (
          <Input
            type="text"
            min={0}
            max={100}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg outline-none"
            value={editedTier.discountPercent || ""}
            onChange={(e) =>
              setEditedTier({
                ...editedTier,
                discountPercent: parseFloat(e.target.value) || 0,
              })
            }
            placeholder="Enter discount percentage"
            disabled={isLoading}
          />
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={handleSave}
          disabled={isLoading}
          className={`flex-1 text-white py-2.5 rounded-[10px] font-medium text-base transition-colors ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#15BA5C] hover:bg-[#13a552]"
          }`}
          type="button"
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
        <button
          onClick={onCancel}
          disabled={isLoading}
          className={`flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-[10px] font-medium text-base transition-colors ${
            isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
          }`}
          type="button"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

// Form component for adding new tiers
export const PriceTierForm = React.forwardRef<
  PriceTierFormRef,
  PriceTierFormProps
>(({ onAdd, onError  }, ref) => {
  const [tier, setTier] = useState({
    name: "",
    description: "",
    markupPercent: 0,
    discountPercent: 0,
  });

  const [markupEnabled, setMarkupEnabled] = useState(false);
  const [discountEnabled, setDiscountEnabled] = useState(false);

  const handleMarkupToggle = (enabled: boolean) => {
    setMarkupEnabled(enabled);
    if (enabled) {
      setDiscountEnabled(false);
      setTier((prev) => ({ ...prev, discountPercent: 0 }));
    }
  };

  const handleDiscountToggle = (enabled: boolean) => {
    setDiscountEnabled(enabled);
    if (enabled) {
      setMarkupEnabled(false);
      setTier((prev) => ({ ...prev, markupPercent: 0 }));
    }
  };

  const resetForm = () => {
    setTier({
      name: "",
      description: "",
      markupPercent: 0,
      discountPercent: 0,
    });
    setMarkupEnabled(false);
    setDiscountEnabled(false);
  };

  const hasFormData = () => {
    return tier.name.trim() !== "" || tier.description.trim() !== "";
  };

  const createTierObject = (): PriceTier => {
    return {
      id: tempIdCounter--, // Use decrementing counter for unique temp IDs
      name: tier.name.trim(),
      description: tier.description.trim(),
      pricingRules: {
        markupPercentage: markupEnabled ? tier.markupPercent : undefined,
        discountPercentage: discountEnabled ? tier.discountPercent : undefined,
      },
      isActive: true,
      isNew: true,
    };
  };

  const addTierInternal = () => {
    if (!tier.name || tier.name.trim() === "") {
      return false;
    }

    const newTier = {
      name: tier.name.trim(),
      description: tier.description.trim(),
      pricingRules: {
        markupPercentage: markupEnabled ? tier.markupPercent : undefined,
        discountPercentage: discountEnabled ? tier.discountPercent : undefined,
      },
    };

    onAdd(newTier);
    resetForm();
    return true;
  };

  // Expose methods to parent component
  React.useImperativeHandle(ref, () => ({
    getPendingTier: () => {
      const hasRule = markupEnabled || discountEnabled;
      if (tier.name.trim() !== "" && hasRule) {
        return createTierObject();
      }
      return null;
    },

    addPendingTier: () => {
      const hasRule = markupEnabled || discountEnabled;
      if (tier.name.trim() !== "" && hasRule) {
        const newTier = createTierObject();
        onAdd({
          name: newTier.name,
          description: newTier.description,
          pricingRules: newTier.pricingRules,
        });
        resetForm();
        return newTier;
      }
      onError("Price tier must have either a markup or discount rule.", "Price tier must have either a markup or discount rule.");
      return null;
    },

    resetForm: resetForm,
    hasFormData: hasFormData,
  }));

  const handleAdd = () => {
    if (!tier.name || tier.name.trim() === "") {
        onError("Please enter a price tier name.", "Please enter a price tier name.");
      return;
    }
    const hasRule = markupEnabled || discountEnabled;
    if (!hasRule) {
        onError("Please select a pricing rule (markup or discount).", "Please select a pricing rule (markup or discount).");
      return;
    }
    addTierInternal();
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          Price Tier Name
        </label>
        <input
          type="text"
          className="w-full px-4 py-3 bg-white border outline-none border-[#D1D1D1] rounded-lg"
          value={tier.name}
          onChange={(e) => setTier({ ...tier, name: e.target.value })}
          placeholder="Enter the name of the Price Tier"
        />
      </div>

      <div>
        <label className=" text-sm flex items-center gap-1.5 font-medium mb-1">
          <span className="">Description</span>
          <span className="text-[#15BA5C]">(optional)</span>
        </label>
        <textarea
          className="w-full px-4 py-3 bg-white border border-[#D1D1D1] outline-none rounded-lg resize-none text-sm"
          value={tier.description}
          onChange={(e) => setTier({ ...tier, description: e.target.value })}
          placeholder="Enter description"
          rows={3}
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="new-markup-checkbox"
            checked={markupEnabled}
            onChange={(e) => handleMarkupToggle(e.target.checked)}
            className="appearance-none w-3 h-3 border-2 border-[#15BA5C] rounded-full checked:bg-[#15BA5C] checked:border-[#15BA5C] focus:outline-none focus:ring-2 focus:ring-[#15BA5C] cursor-pointer"
          />
          <label htmlFor="new-markup-checkbox" className="text-sm font-medium">
            Markup %
          </label>
        </div>

        {markupEnabled && (
          <Input
            className="w-full px-4 py-3 bg-white border border-[#D1D1D1]  rounded-lg outline-none"
            type="text"
            min={0}
            max={100}
            value={tier.markupPercent || ""}
            onChange={(e) =>
              setTier({
                ...tier,
                markupPercent: parseFloat(e.target.value) || 0,
              })
            }
            placeholder="Enter markup percentage"
          />
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="new-discount-checkbox"
            checked={discountEnabled}
            onChange={(e) => handleDiscountToggle(e.target.checked)}
            className="appearance-none w-3 h-3 border-2 border-[#15BA5C] rounded-full checked:bg-[#15BA5C] checked:border-[#15BA5C] focus:outline-none focus:ring-2 focus:ring-[#15BA5C] cursor-pointer"
          />
          <label
            htmlFor="new-discount-checkbox"
            className="text-sm font-medium"
          >
            Discount %
          </label>
        </div>

        {discountEnabled && (
          <Input
            type="text"
            min={0}
            max={100}
            className="w-full px-4 py-3 bg-white border border-[#D1D1D1] rounded-lg outline-none"
            value={tier.discountPercent || ""}
            onChange={(e) =>
              setTier({
                ...tier,
                discountPercent: parseFloat(e.target.value) || 0,
              })
            }
            placeholder="Enter discount percentage"
          />
        )}
      </div>

      <button
        onClick={handleAdd}
        className="border border-[#15BA5C] w-full text-[#15BA5C] py-2.5 rounded-[10px] font-medium text-base mt-4 hover:bg-green-50 transition-colors"
        type="button"
      >
        + Add a new Price Tier
      </button>
    </div>
  );
});

PriceTierForm.displayName = "PriceTierForm";
