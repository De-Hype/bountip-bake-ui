import React, { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Modal } from "../ui/Modal";
import { Check, Loader2 } from "lucide-react";
import SettingFiles from "@/assets/icons/settings";
import { Switch } from "../ui/Switch";
import settingsService from "@/services/settingsService";
import { OperatingHoursType } from "@/types/settingTypes";
import { ApiResponseType } from "@/types/httpTypes";
import { useBusiness } from "@/hooks/useBusiness";
import { useSelectedOutlet } from "@/hooks/useSelectedOutlet";
import { TimeDropdownSplit } from "./TimeDropdownSplit";

interface OperatingHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (heading: string, description: string) => void;
  onError: (heading: string, description: string) => void;
}

interface DayHours {
  day: string;
  enabled: boolean;
  openTime: string;
  closeTime: string;
}

export const OperatingHoursModal: React.FC<OperatingHoursModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onError,
}) => {
  const [operatingHours, setOperatingHours] = useState<DayHours[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  // Remove isSaving state
  const outletAccess = useSelectedOutlet();
  const business = useBusiness();
  const businessId = business?.id;

  useEffect(() => {
    if (!isOpen || !outletAccess?.outlet) return;

    const outlet = outletAccess.outlet;
    const rawHours = outlet.operatingHours;

    const defaultDayHours = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ].map((day) => ({
      day: day.charAt(0).toUpperCase() + day.slice(1),
      enabled: rawHours?.[day as keyof typeof rawHours]?.isActive || false,
      openTime: rawHours?.[day as keyof typeof rawHours]?.open || "00:00",
      closeTime: rawHours?.[day as keyof typeof rawHours]?.close || "00:00",
    }));

    setOperatingHours(defaultDayHours);
  }, [isOpen, outletAccess?.outlet]);

  useEffect(() => {
    if (!isOpen) {
      setOperatingHours([]);
      setSelectAll(false);
      // Reset loading state when modal closes
    }
  }, [isOpen]);

  const handleDayToggle = (dayIndex: number) => {
    // Prevent changes while saving
    if (updateHoursMutation.isPending) return;

    setOperatingHours((prev) =>
      prev.map((day, index) =>
        index === dayIndex ? { ...day, enabled: !day.enabled } : day
      )
    );
  };

  const handleTimeChange = (
    dayIndex: number,
    field: "openTime" | "closeTime",
    value: string
  ) => {
    // Prevent changes while saving
    if (updateHoursMutation.isPending) return;

    setOperatingHours((prev) =>
      prev.map((day, index) =>
        index === dayIndex ? { ...day, [field]: value } : day
      )
    );
  };

  const handleSelectAll = (isChecked: boolean) => {
    // Prevent changes while saving
    if (updateHoursMutation.isPending) return;

    setSelectAll(isChecked);

    setOperatingHours((prev) => {
      const sunday = prev[0];
      return prev.map((day, index) =>
        index === 0
          ? { ...day, enabled: isChecked }
          : {
              ...day,
              enabled: isChecked,
              openTime: sunday.openTime,
              closeTime: sunday.closeTime,
            }
      );
    });
  };

  // Mutation for updating operating hours
  const updateHoursMutation = useMutation({
    mutationFn: (dto: Partial<OperatingHoursType>) =>
      settingsService.updateOperatingHours(
        String(outletAccess?.outlet.id),
        dto as OperatingHoursType
      ) as Promise<ApiResponseType>,
    onSuccess: (result: ApiResponseType) => {
      if (result.status) {
        onClose();
        onSuccess(
          "Save successful",
          "Your Operating hours has been saved successfully"
        );
      } else {
        onError("Failed", "Failed to update operating hours");
      }
    },
    onError: () => {
      onError("Failed", "An error occurred while updating operating hours");
    },
  });

  const handleSubmit = () => {
    if (!businessId || !outletAccess?.outlet) return;

    const dto: Partial<OperatingHoursType> = {};
    operatingHours.forEach(({ day, enabled, openTime, closeTime }) => {
      const key = day.toLowerCase() as keyof OperatingHoursType;
      dto[key] = {
        open: openTime,
        close: closeTime,
        isActive: enabled,
      };
    });

    const isComplete =
      Object.keys(dto).length === 7 &&
      Object.keys(dto).every((day) => !!dto[day as keyof OperatingHoursType]);

    if (!isComplete) {
      onError("Failed", "Please complete all operating hours data");
      return;
    }

    updateHoursMutation.mutate(dto);
  };

  // Helper component for loading spinner
  const LoadingSpinner = () => <Loader2 className="h-4 w-4 animate-spin" />;

  if (!outletAccess?.outlet) {
    return (
      <Modal
        size={"lg"}
        image={SettingFiles.OperatingHours}
        isOpen={isOpen}
        onClose={onClose}
        title="Operating Hours"
        subtitle="Setup your Operating hours for this location"
      >
        <div className="p-4 text-center">
          <p className="text-gray-600">Loading outlet...</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      size={"lg"}
      image={SettingFiles.OperatingHours}
      isOpen={isOpen}
      onClose={onClose}
      title="Operating Hours"
      subtitle="Setup your Operating hours for this location"
    >
      <div className="space-y-4 overflow-y-auto">
        <div className="border border-gray-200 rounded-lg">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">
              {outletAccess.outlet.name || "Unnamed Outlet"}
            </h3>
            <p className="text-sm text-gray-600">
              {outletAccess.outlet.address || "No address provided"}
            </p>
          </div>

          <div className="px-4 pb-4 flex flex-col gap-10">
            {operatingHours.map((dayHours, dayIndex) => (
              <div
                key={`${dayHours.day}`}
                className="flex items-center justify-between gap-4 relative mt-2.5"
              >
                <div className="w-32">
                  <Switch
                    checked={dayHours.enabled}
                    onChange={() => handleDayToggle(dayIndex)}
                    label={dayHours.day}
                  />
                </div>

                <div className="flex items-center gap-2 flex-1 relative">
                  <div className="flex flex-1/2 items-center justify-between gap-2 border border-[#E6E6E6] px-2 rounded-xl">
                    <span className="text-sm text-gray-600">From</span>
                    <TimeDropdownSplit
                      value={dayHours.openTime}
                      onChange={(value) =>
                        handleTimeChange(dayIndex, "openTime", value)
                      }
                      disabled={
                        !dayHours.enabled || updateHoursMutation.isPending
                      }
                    />
                  </div>

                  <div className="flex flex-1/2 items-center justify-between gap-2 border border-[#E6E6E6] px-2 rounded-xl">
                    <span className="text-sm text-gray-600">To</span>
                    <TimeDropdownSplit
                      value={dayHours.closeTime}
                      onChange={(value) =>
                        handleTimeChange(dayIndex, "closeTime", value)
                      }
                      disabled={
                        !dayHours.enabled || updateHoursMutation.isPending
                      }
                    />
                  </div>

                  {dayIndex === 0 && (
                    <div className="flex items-center gap-2.5 absolute -bottom-6 left-0">
                      <input
                        type="checkbox"
                        className="accent-green-600"
                        checked={selectAll}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        disabled={updateHoursMutation.isPending}
                      />
                      <p
                        className={`text-[#1C1B20] text-sm ${
                          updateHoursMutation.isPending ? "opacity-50" : ""
                        }`}
                      >
                        Apply to all
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={updateHoursMutation.isPending}
            className="flex items-center justify-center gap-2 bg-[#15BA5C] w-full text-[#ffffff] py-3 rounded-[10px] font-medium text-base mt-5 disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
          >
            {updateHoursMutation.isPending ? (
              <LoadingSpinner />
            ) : (
              <Check className="text-[14px]" />
            )}
            <span>
              {updateHoursMutation.isPending
                ? "Saving..."
                : "Save Operating Hours"}
            </span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
