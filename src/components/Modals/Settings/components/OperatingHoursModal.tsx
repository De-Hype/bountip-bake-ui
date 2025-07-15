// import React, { useEffect, useState, useRef } from "react";
// import { Modal } from "../ui/Modal";
// import { Check, ChevronDown, ChevronUp } from "lucide-react";
// import SettingFiles from "@/assets/icons/settings";
// import { Switch } from "../ui/Switch";
// import settingsService from "@/services/settingsService";
// import { OperatingHoursType } from "@/types/settingTypes";
// import { toast } from "sonner";
// import { ApiResponseType } from "@/types/httpTypes";
// import { useBusiness } from "@/hooks/useBusiness";
// import { usePureOutlets, useSelectedOutlet } from "@/hooks/useSelectedOutlet";
// import { useBusinessStore } from "@/stores/useBusinessStore";
// import { OutletAccess } from "@/types/outlet";

// interface OperatingHoursModalProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// interface Location {
//   id: string;
//   name: string;
//   address: string;
//   expanded: boolean;
// }

// interface DayHours {
//   day: string;
//   enabled: boolean;
//   openTime: string;
//   closeTime: string;
// }

// const TimeInput: React.FC<{
//   value: string;
//   onChange: (value: string) => void;
//   disabled?: boolean;
//   placeholder?: string;
// }> = ({ value, onChange, disabled = false, placeholder = "00:00" }) => {
//   const [inputValue, setInputValue] = useState(value);

//   useEffect(() => {
//     setInputValue(value);
//   }, [value]);

//   const formatTime = (input: string): string => {
//     const digits = input.replace(/\D/g, "");
//     if (digits.length === 0) return "";
//     if (digits.length <= 2) return digits;
//     if (digits.length <= 4) {
//       const hours = digits.slice(0, 2);
//       const minutes = digits.slice(2);
//       return `${hours}:${minutes}`;
//     }
//     const hours = digits.slice(0, 2);
//     const minutes = digits.slice(2, 4);
//     return `${hours}:${minutes}`;
//   };

//   const validateTime = (timeString: string): boolean => {
//     const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
//     return timeRegex.test(timeString);
//   };

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const formatted = formatTime(e.target.value);
//     setInputValue(formatted);
//   };

//   const handleBlur = () => {
//     if (inputValue === "") {
//       setInputValue("00:00");
//       onChange("00:00");
//       return;
//     }

//     if (inputValue.length === 1) {
//       const padded = `0${inputValue}:00`;
//       setInputValue(padded);
//       onChange(padded);
//     } else if (inputValue.length === 2) {
//       const padded = `${inputValue}:00`;
//       setInputValue(padded);
//       onChange(padded);
//     } else if (inputValue.length === 4 && inputValue.includes(":")) {
//       const [hours, minutes] = inputValue.split(":");
//       const padded = `${hours.padStart(2, "0")}:${minutes.padEnd(2, "0")}`;
//       setInputValue(padded);
//       onChange(padded);
//     } else if (validateTime(inputValue)) {
//       onChange(inputValue);
//     } else {
//       setInputValue(value);
//     }
//   };

//   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (
//       [8, 9, 27, 13, 37, 38, 39, 40, 46].includes(e.keyCode) ||
//       (e.keyCode === 65 && e.ctrlKey) ||
//       (e.keyCode === 67 && e.ctrlKey) ||
//       (e.keyCode === 86 && e.ctrlKey) ||
//       (e.keyCode === 88 && e.ctrlKey)
//     ) {
//       return;
//     }
//     if (
//       (e.shiftKey || e.keyCode < 48 || e.keyCode > 57) &&
//       (e.keyCode < 96 || e.keyCode > 105)
//     ) {
//       e.preventDefault();
//     }
//   };

//   return (
//     <input
//       type="text"
//       value={inputValue}
//       onChange={handleInputChange}
//       onBlur={handleBlur}
//       onKeyDown={handleKeyDown}
//       disabled={disabled}
//       placeholder={placeholder}
//       maxLength={5}
//       className="px-3 outline-none py-2 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400 text-center min-w-[80px]"
//     />
//   );
// };

// export const OperatingHoursModal: React.FC<OperatingHoursModalProps> = ({
//   isOpen,
//   onClose,
// }) => {
//   const [locations, setLocations] = useState<Location[]>([]);
//   const [selectAllMap, setSelectAllMap] = useState<Record<string, boolean>>({});
//   const [operatingHours, setOperatingHours] = useState<
//     Record<string, DayHours[]>
//   >({});
//   const {fetchBusinessData} = useBusinessStore()
//   const outlet =useSelectedOutlet() as OutletAccess
//   const outletsData = usePureOutlets();
//   const business = useBusiness();
//   const businessId = business?.id;
//   const processedOutletIds = useRef<Set<string>>(new Set());

//   useEffect(() => {
//     if (!isOpen || !outletsData || outletsData.length === 0) return;

//     const currentOutletIds = outletsData
//       .map((item) => String(item.id))
//       .sort()
//       .join(",");
//     const lastProcessedIds = Array.from(processedOutletIds.current)
//       .sort()
//       .join(",");

//     if (currentOutletIds === lastProcessedIds) return;

//     const newLocations = outletsData.map((item) => ({
//       id: String(item.id),
//       name: item.name || "Unnamed Outlet",
//       address: item.address || "No address provided",
//       expanded: false,
//     }));

//     setLocations(newLocations);

//     const initialOperatingHours: Record<string, DayHours[]> = {};

//     newLocations.forEach((loc) => {
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       const rawHours: any = outletsData.find(
//         (o) => String(o.id) === loc.id
//       )?.operatingHours;

//       const defaultDayHours = [
//         "sunday",
//         "monday",
//         "tuesday",
//         "wednesday",
//         "thursday",
//         "friday",
//         "saturday",
//       ].map((day) => ({
//         day: day.charAt(0).toUpperCase() + day.slice(1),
//         enabled: rawHours?.[day]?.isActive || false,
//         openTime: rawHours?.[day]?.open || "00:00",
//         closeTime: rawHours?.[day]?.close || "00:00",
//       }));

//       initialOperatingHours[loc.id] = defaultDayHours;
//     });

//     setOperatingHours(initialOperatingHours);
//     processedOutletIds.current = new Set(
//       outletsData.map((item) => String(item.id))
//     );
//   }, [isOpen, outletsData]);

//   useEffect(() => {
//     if (!isOpen) {
//       setLocations([]);
//       setOperatingHours({});
//       setSelectAllMap({});
//       processedOutletIds.current = new Set();
//     }
//   }, [isOpen]);

//   const toggleLocation = (locationId: string) => {
//     setLocations((prev) =>
//       prev.map((loc) =>
//         loc.id === locationId ? { ...loc, expanded: !loc.expanded } : loc
//       )
//     );
//   };

//   const handleDayToggle = (locationId: string, dayIndex: number) => {
//     setOperatingHours((prev) => ({
//       ...prev,
//       [locationId]: prev[locationId]?.map((day, index) =>
//         index === dayIndex ? { ...day, enabled: !day.enabled } : day
//       ),
//     }));
//   };

//   const handleTimeChange = (
//     locationId: string,
//     dayIndex: number,
//     field: "openTime" | "closeTime",
//     value: string
//   ) => {
//     setOperatingHours((prev) => ({
//       ...prev,
//       [locationId]: prev[locationId]?.map((day, index) =>
//         index === dayIndex ? { ...day, [field]: value } : day
//       ),
//     }));
//   };

//   const handleSubmit = async () => {
//     if (!businessId) return;

//     const updatePromises = Object.entries(operatingHours).map(
//       async ([outletId, dayHours]) => {
//         const dto: Partial<OperatingHoursType> = {};
//         dayHours.forEach(({ day, enabled, openTime, closeTime }) => {
//           const key = day.toLowerCase() as keyof OperatingHoursType;
//           dto[key] = {
//             open: openTime,
//             close: closeTime,
//             isActive: enabled,
//           };
//         });

//         const isComplete =
//           Object.keys(dto).length === 7 &&
//           Object.keys(dto).every(
//             (day) => !!dto[day as keyof OperatingHoursType]
//           );

//         if (!isComplete) {
//           return { outletId, success: false, error: "Incomplete data" };
//         }

//         try {
//           const result = (await settingsService.updateOperatingHours(
//             outletId,
//             dto as OperatingHoursType
//           )) as ApiResponseType;

//           return result.status
//             ? { outletId, success: true }
//             : { outletId, success: false, error: "API call failed" };


//         } catch (error) {
//           return { outletId, success: false, error };
//         }
//       }
//     );

//     const results = await Promise.all(updatePromises);
//     const successes = results.filter((r) => r.success).length;
//     if (successes > 0) {
//       await fetchBusinessData(); // Refresh global outlets data after success
//     }

//     onClose();
//     toast.success(`${successes} outlet(s) updated successfully`, {
//       duration: 3000,
//     });
//   };

//   if (!outletsData || outletsData.length === 0) {
//     return (
//       <Modal
//         size={"lg"}
//         image={SettingFiles.OperatingHours}
//         isOpen={isOpen}
//         onClose={onClose}
//         title="Operating Hours"
//         subtitle="Setup your Operating hours for all locations"
//       >
//         <div className="p-4 text-center">
//           <p className="text-gray-600">Loading outlets...</p>
//         </div>
//       </Modal>
//     );
//   }

//   return (
//     <Modal
//       size={"lg"}
//       image={SettingFiles.OperatingHours}
//       isOpen={isOpen}
//       onClose={onClose}
//       title="Operating Hours"
//       subtitle="Setup your Operating hours for all locations"
//     >
//       <div className="space-y-4 overflow-y-auto">
//         {locations.map((location) => {
//           const locationHours = operatingHours[location.id] || [];

//           return (
//             <div
//               key={location.id}
//               className="border border-gray-200 rounded-lg"
//             >
//               <div
//                 className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
//                 onClick={() => toggleLocation(location.id)}
//               >
//                 <div>
//                   <h3 className="font-semibold text-gray-900">
//                     {location.name}
//                   </h3>
//                   <p className="text-sm text-gray-600">{location.address}</p>
//                 </div>
//                 {location.expanded ? (
//                   <ChevronUp className="h-5 w-5 text-gray-400" />
//                 ) : (
//                   <ChevronDown className="h-5 w-5 text-gray-400" />
//                 )}
//               </div>

//               {location.expanded && (
//                 <div className="px-4 pb-4 border-t border-gray-100 flex flex-col gap-10">
//                   {locationHours.map((dayHours, dayIndex) => (
//                     <div
//                       key={`${location.id}-${dayHours.day}`}
//                       className="flex items-center justify-between gap-4 relative mt-2.5"
//                     >
//                       <div className="w-32">
//                         <Switch
//                           checked={dayHours.enabled}
//                           onChange={() =>
//                             handleDayToggle(location.id, dayIndex)
//                           }
//                           label={dayHours.day}
//                         />
//                       </div>

//                       <div className="flex items-center gap-2 flex-1 relative">
//                         <div className="flex flex-1/2 items-center justify-between gap-2 border border-[#E6E6E6] px-2 rounded-xl">
//                           <span className="text-sm text-gray-600">From</span>
//                           <TimeInput
//                             value={dayHours.openTime}
//                             onChange={(value) =>
//                               handleTimeChange(
//                                 location.id,
//                                 dayIndex,
//                                 "openTime",
//                                 value
//                               )
//                             }
//                             disabled={!dayHours.enabled}
//                             placeholder="09:00"
//                           />
//                         </div>

//                         <div className="flex flex-1/2 items-center justify-between gap-2 border border-[#E6E6E6] px-2 rounded-xl">
//                           <span className="text-sm text-gray-600">To</span>
//                           <TimeInput
//                             value={dayHours.closeTime}
//                             onChange={(value) =>
//                               handleTimeChange(
//                                 location.id,
//                                 dayIndex,
//                                 "closeTime",
//                                 value
//                               )
//                             }
//                             disabled={!dayHours.enabled}
//                             placeholder="17:00"
//                           />
//                         </div>

//                         {dayIndex === 0 && (
//                           <div className="flex items-center gap-2.5 absolute -bottom-6 left-0">
//                             <input
//                               type="checkbox"
//                               className="accent-green-600"
//                               checked={!!selectAllMap[location.id]}
//                               onChange={(e) => {
//                                 const isChecked = e.target.checked;

//                                 setSelectAllMap((prev) => ({
//                                   ...prev,
//                                   [location.id]: isChecked,
//                                 }));

//                                 setOperatingHours((prev) => {
//                                   const current = prev[location.id] || [];
//                                   const sunday = current[0];

//                                   return {
//                                     ...prev,
//                                     [location.id]: current.map((day, index) =>
//                                       index === 0
//                                         ? { ...day, enabled: isChecked }
//                                         : {
//                                             ...day,
//                                             enabled: isChecked,
//                                             openTime: sunday.openTime,
//                                             closeTime: sunday.closeTime,
//                                           }
//                                     ),
//                                   };
//                                 });
//                               }}
//                             />
//                             <p className="text-[#1C1B20] text-sm">
//                               Apply to all
//                             </p>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           );
//         })}
//         <div className="flex justify-end">
//           <button
//             onClick={handleSubmit}
//             className="flex items-center justify-center gap-2 bg-[#15BA5C] w-full text-[#ffffff] py-3 rounded-[10px] font-medium text-base mt-5"
//             type="button"
//           >
//             <Check className="text-[14px]" />
//             <span className=""> Save Operating Hours</span>
//           </button>
//         </div>
//       </div>
//     </Modal>
//   );
// };

import React, { useEffect, useState } from "react";
import { Modal } from "../ui/Modal";
import { Check } from "lucide-react";
import SettingFiles from "@/assets/icons/settings";
import { Switch } from "../ui/Switch";
import settingsService from "@/services/settingsService";
import { OperatingHoursType } from "@/types/settingTypes";
import { toast } from "sonner";
import { ApiResponseType } from "@/types/httpTypes";
import { useBusiness } from "@/hooks/useBusiness";
import { useSelectedOutlet } from "@/hooks/useSelectedOutlet";
import { useBusinessStore } from "@/stores/useBusinessStore";
import { TimeDropdownSplit } from "./TimeDropdownSplit";

interface OperatingHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
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
}) => {
  const [operatingHours, setOperatingHours] = useState<DayHours[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const { fetchBusinessData } = useBusinessStore();
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
    }
  }, [isOpen]);

  const handleDayToggle = (dayIndex: number) => {
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
    setOperatingHours((prev) =>
      prev.map((day, index) =>
        index === dayIndex ? { ...day, [field]: value } : day
      )
    );
  };

  const handleSelectAll = (isChecked: boolean) => {
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

  const handleSubmit = async () => {
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
      toast.error("Please complete all operating hours data");
      return;
    }

    try {
      const result = (await settingsService.updateOperatingHours(
        String(outletAccess.outlet.id),
        dto as OperatingHoursType
      )) as ApiResponseType;

      if (result.status) {
        await fetchBusinessData();
        onClose();
        toast.success("Operating hours updated successfully", {
          duration: 3000,
        });
      } else {
        toast.error("Failed to update operating hours");
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error:any) {
      console.log(error)
      toast.error("An error occurred while updating operating hours");
    }
  };

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
                      disabled={!dayHours.enabled}
                    />
                  </div>

                  <div className="flex flex-1/2 items-center justify-between gap-2 border border-[#E6E6E6] px-2 rounded-xl">
                    <span className="text-sm text-gray-600">To</span>
                    <TimeDropdownSplit
                      value={dayHours.closeTime}
                      onChange={(value) =>
                        handleTimeChange(dayIndex, "closeTime", value)
                      }
                      disabled={!dayHours.enabled}
                    />
                  </div>

                  {dayIndex === 0 && (
                    <div className="flex items-center gap-2.5 absolute -bottom-6 left-0">
                      <input
                        type="checkbox"
                        className="accent-green-600"
                        checked={selectAll}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                      <p className="text-[#1C1B20] text-sm">Apply to all</p>
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
            className="flex items-center justify-center gap-2 bg-[#15BA5C] w-full text-[#ffffff] py-3 rounded-[10px] font-medium text-base mt-5"
            type="button"
          >
            <Check className="text-[14px]" />
            <span>Save Operating Hours</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};