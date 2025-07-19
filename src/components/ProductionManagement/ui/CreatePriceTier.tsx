import React, { useState } from "react";

// Define the type for a price tier
interface PriceTier {
  name: string;
  description?: string;
  markupPercent?: number;
  discountPercent?: number;
}

// Define the props for the component
interface CreatePriceTierProps {
  onSave: (tier: PriceTier) => Promise<void> | void;
  onClose: () => void;
}

const CreatePriceTier: React.FC<CreatePriceTierProps> = ({
  onSave,
  onClose,
}) => {
  const [tier, setTier] = useState<PriceTier>({
    name: "",
    description: "",
    markupPercent: undefined,
    discountPercent: undefined,
  });
  const [markupEnabled, setMarkupEnabled] = useState(false);
  const [discountEnabled, setDiscountEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  // Removed unused handleMarkupToggle and handleDiscountToggle

  const handleAdd = async () => {
    if (!tier.name.trim()) return;
    setLoading(true);
    try {
      await onSave(tier);
      // Reset form after save
      setTier({
        name: "",
        description: "",
        markupPercent: undefined,
        discountPercent: undefined,
      });
      setMarkupEnabled(false);
      setDiscountEnabled(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur bg-black/20"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative bg-white rounded-xl shadow-lg w-full max-w-md mx-4 p-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
          aria-label="Close"
          type="button"
        >
          &times;
        </button>
        <h2 className="text-xl font-semibold mb-6 text-center">
          Create Price Tier
        </h2>
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
              disabled={loading}
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
              onChange={(e) =>
                setTier({ ...tier, description: e.target.value })
              }
              placeholder="Enter description"
              rows={3}
              disabled={loading}
            />
          </div>

          {/* Markup/Discount logic: only one can be enabled at a time, but both toggles are always visible */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="new-markup-checkbox"
                checked={markupEnabled}
                onChange={(e) => {
                  setMarkupEnabled(e.target.checked);
                  if (e.target.checked) {
                    setDiscountEnabled(false);
                  }
                }}
                className="appearance-none w-3 h-3 border-2 border-[#15BA5C] rounded-full checked:bg-[#15BA5C] checked:border-[#15BA5C] focus:outline-none focus:ring-2 focus:ring-[#15BA5C] cursor-pointer"
                disabled={loading}
              />
              <label
                htmlFor="new-markup-checkbox"
                className="text-sm font-medium"
              >
                Markup %
              </label>
            </div>
            {markupEnabled && (
              <input
                className="w-full px-4 py-3 bg-white border border-[#D1D1D1]  rounded-lg outline-none"
                type="number"
                min={0}
                max={100}
                value={tier.markupPercent ?? ""}
                onChange={(e) =>
                  setTier({
                    ...tier,
                    markupPercent:
                      e.target.value === ""
                        ? undefined
                        : Math.max(
                            0,
                            Math.min(100, parseFloat(e.target.value))
                          ),
                  })
                }
                placeholder="Enter markup percentage"
                disabled={loading}
              />
            )}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="new-discount-checkbox"
                checked={discountEnabled}
                onChange={(e) => {
                  setDiscountEnabled(e.target.checked);
                  if (e.target.checked) {
                    setMarkupEnabled(false);
                  }
                }}
                className="appearance-none w-3 h-3 border-2 border-[#15BA5C] rounded-full checked:bg-[#15BA5C] checked:border-[#15BA5C] focus:outline-none focus:ring-2 focus:ring-[#15BA5C] cursor-pointer"
                disabled={loading}
              />
              <label
                htmlFor="new-discount-checkbox"
                className="text-sm font-medium"
              >
                Discount %
              </label>
            </div>
            {discountEnabled && (
              <input
                type="number"
                min={0}
                max={100}
                className="w-full px-4 py-3 bg-white border border-[#D1D1D1] rounded-lg outline-none"
                value={tier.discountPercent ?? ""}
                onChange={(e) =>
                  setTier({
                    ...tier,
                    discountPercent:
                      e.target.value === ""
                        ? undefined
                        : Math.max(
                            0,
                            Math.min(100, parseFloat(e.target.value))
                          ),
                  })
                }
                placeholder="Enter discount percentage"
                disabled={loading}
              />
            )}
          </div>

          <button
            onClick={handleAdd}
            className="border border-[#15BA5C] w-full text-[#15BA5C] py-2.5 rounded-[10px] font-medium text-base mt-4 hover:bg-green-50 transition-colors"
            type="button"
            disabled={
              loading ||
              !tier.name.trim() ||
              (!markupEnabled && !discountEnabled)
            }
          >
            {loading ? "Saving..." : "Create Price Tier"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePriceTier;
