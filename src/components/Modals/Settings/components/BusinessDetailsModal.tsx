"use client";
import React, { useEffect, useState, useRef } from "react";
import {
  Country,
  State,
  City,
  ICountry,
  IState,
  ICity,
} from "country-state-city";
import countryCurrencyMap from "country-currency-map";
import { Check, ChevronDown, Plus, X, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { CiEdit } from "react-icons/ci";
import { parsePhoneNumberFromString } from "libphonenumber-js";

import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import SettingFiles from "@/assets/icons/settings";
import { BusinessDetailsType } from "@/types/businessTypes";
import { COOKIE_NAMES } from "@/utils/cookiesUtils";
import uploadService from "@/services/uploadService";
import settingsService from "@/services/settingsService";
import { useBusiness } from "@/hooks/useBusiness";
import { useSelectedOutlet } from "@/hooks/useSelectedOutlet";
import { useBusinessStore } from "@/stores/useBusinessStore";
import { Business } from "@/types/business";

interface BusinessDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  outletId: string | number | null;
}

const defaultBusinessTypes = ["Bakery", "Restaurant", "Bar"];
const countries = Country.getAllCountries();

export const BusinessDetailsModal: React.FC<BusinessDetailsModalProps> = ({
  isOpen,
  onClose,
  outletId,
}) => {
  const outlet = useSelectedOutlet();
  const business = useBusiness() as Business;
  const [details, setDetails] = useState<BusinessDetailsType>({
    name: "",
    email: "",
    phone: "",
    country: "",
    state: "",
    city: "",
    address: "",
    businessType: "",
    postalCode: "",
  });
  const { fetchBusinessData } = useBusinessStore();

  const [newBusinessType, setNewBusinessType] = useState("");
  const [businessTypes, setBusinessTypes] = useState(defaultBusinessTypes);
  const [businessType, setBusinessType] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isBusinessTypeOpen, setIsBusinessTypeOpen] = useState(false);
  const [phoneError, setPhoneError] = useState<string>("");
  // Country dropdown states
  const [selectedCountry, setSelectedCountry] = useState<ICountry | null>(null);
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [countrySearchTerm, setCountrySearchTerm] = useState("");

  // State dropdown states
  const [selectedState, setSelectedState] = useState<IState | null>(null);
  const [isStateOpen, setIsStateOpen] = useState(false);
  const [stateSearchTerm, setStateSearchTerm] = useState("");
  const [availableStates, setAvailableStates] = useState<IState[]>([]);

  // City dropdown states
  const [selectedCity, setSelectedCity] = useState<ICity | null>(null);
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [citySearchTerm, setCitySearchTerm] = useState("");
  const [availableCities, setAvailableCities] = useState<ICity[]>([]);

  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [uploadError, setUploadError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter countries based on search term
  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(countrySearchTerm.toLowerCase())
  );

  // Filter states based on search term
  const filteredStates = availableStates.filter((state) =>
    state.name.toLowerCase().includes(stateSearchTerm.toLowerCase())
  );

  // Filter cities based on search term
  const filteredCities = availableCities.filter((city) =>
    city.name.toLowerCase().includes(citySearchTerm.toLowerCase())
  );

  // Function to get country flag emoji

  // Update available states when country changes
  useEffect(() => {
    if (selectedCountry) {
      const states = State.getStatesOfCountry(selectedCountry.isoCode);
      setAvailableStates(states);
      // Reset state and city when country changes
      setSelectedState(null);
      setSelectedCity(null);
      setAvailableCities([]);
      handleChange("state", "");
      handleChange("city", "");
    } else {
      setAvailableStates([]);
      setSelectedState(null);
      setSelectedCity(null);
      setAvailableCities([]);
    }
  }, [selectedCountry]);

  // Update available cities when state changes
  useEffect(() => {
    if (selectedState && selectedCountry) {
      const cities = City.getCitiesOfState(
        selectedCountry.isoCode,
        selectedState.isoCode
      );
      setAvailableCities(cities);
      // Reset city when state changes
      setSelectedCity(null);
      handleChange("city", "");
    } else {
      setAvailableCities([]);
      setSelectedCity(null);
    }
  }, [selectedState, selectedCountry]);

  useEffect(() => {
    if (details?.logoUrl) {
      setUploadedImageUrl(details.logoUrl);
    }
  }, [details]);

  useEffect(() => {
    setDetails({
      name: outlet?.outlet.name || "",
      address: outlet?.outlet.address || "",
      businessType: business?.businessType || "",
      city: outlet?.outlet.city || "",
      email: outlet?.outlet.email || "",
      country: outlet?.outlet.country || "",
      phone: outlet?.outlet.phoneNumber || "",
      postalCode: outlet?.outlet.postalCode || "",
      state: outlet?.outlet.state || "",
    });

    // Set initial country selection based on business data
    if (outlet?.outlet?.country) {
      const country = countries.find((c) => c.name === outlet?.outlet?.country);
      if (country) {
        setSelectedCountry(country);

        // Get states for the selected country
        const states = State.getStatesOfCountry(country.isoCode);
        setAvailableStates(states);

        // Set initial state selection
        if (outlet.outlet?.state) {
          const state = states.find((s) => s.name === outlet.outlet.state);
          if (state) {
            setSelectedState(state);

            // Get cities for the selected state
            const cities = City.getCitiesOfState(
              country.isoCode,
              state.isoCode
            );
            setAvailableCities(cities);

            // Set initial city selection
            if (outlet.outlet.city) {
              const city = cities.find((c) => c.name === outlet.outlet.city);
              if (city) {
                setSelectedCity(city);
              }
            }
          }
        }
      }
    }

    if (business?.businessType) {
      setBusinessType(business.businessType);
    }
     
  }, [business, outlet]);

  useEffect(() => {
    // Only set uploadedImageUrl if there's no existing logo or if it's different
    if (outlet?.outlet.logoUrl && !uploadedImageUrl) {
      setUploadedImageUrl(outlet.outlet.logoUrl);
    }
  }, [outlet?.outlet.logoUrl, uploadedImageUrl]);

  const handleBusinessTypeSelect = (type: string) => {
    setBusinessType(type);
    setIsBusinessTypeOpen(false);
  };

  const handleCountrySelect = (country: ICountry) => {
    setSelectedCountry(country);
    setIsCountryOpen(false);
    setCountrySearchTerm("");
    handleChange("country", country.name);
  };

  const handleStateSelect = (state: IState) => {
    setSelectedState(state);
    setIsStateOpen(false);
    setStateSearchTerm("");
    handleChange("state", state.name);
  };

  const handleCitySelect = (city: ICity) => {
    setSelectedCity(city);
    setIsCityOpen(false);
    setCitySearchTerm("");
    handleChange("city", city.name);
  };

  // Helper function to get disabled styles
  const getDisabledStyles = (value: string) => {
    return !value.trim()
      ? "border-[#A6A6A6] text-gray-400"
      : "border-gray-300 hover:border-gray-400";
  };
  const getCurrencyByCountryName = (countryName: string): string => {
    if (!countryName || typeof countryName !== "string")
      return "Currency not found";

    const trimmedName = countryName.trim();
    const currency = countryCurrencyMap.getCurrencyAbbreviation(trimmedName);

    return currency || "Currency not found";
  };

  // Dummy form submission function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(phoneError)

    const { country } = details;

    const finalDetails = {
      ...details,
      businessType,
      revenueRange: "10-500",
      currency: getCurrencyByCountryName(country),
      logoUrl: uploadedImageUrl,
    };
    console.log(finalDetails);
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = await settingsService.updateBusinessDetails(
      finalDetails,
      outletId as number
    );
    if (response.status) {
      toast.success("Business details updated successfully!");
      setDetails({
        name: "",
        email: "",
        phone: "",
        country: "",
        state: "",
        city: "",
        address: "",
        postalCode: "",
        businessType: "",
      });
      setBusinessType("");
      setUploadedImageUrl("");
      setSelectedCountry(null);
      setSelectedState(null);
      setSelectedCity(null);
      onClose();
    }
    await fetchBusinessData();
  };

  const handleChange = (field: keyof BusinessDetailsType, value: string) => {
    setDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddBusinessType = () => {
    if (
      newBusinessType.trim() &&
      !businessTypes.includes(newBusinessType.trim())
    ) {
      const updatedTypes = [...businessTypes, newBusinessType.trim()];
      setBusinessTypes(updatedTypes);
      setBusinessType(newBusinessType.trim());
      setNewBusinessType("");
      setIsAddingNew(false);
      setIsBusinessTypeOpen(false);
    }
  };

  const uploadImage = async (file: File) => {
    setIsUploading(true);
    setUploadError("");

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await uploadService.uploadImage(
        file,
        COOKIE_NAMES.BOUNTIP_LOGIN_USER_TOKENS
      );
      console.log(response);

      if (response.status) {
        setUploadedImageUrl(response.data.url);
        console.log("Image uploaded successfully:", response.data.url);
      } else {
        throw new Error("No URL returned from upload service");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadError("Failed to upload image. Please try again.");
      setUploadedImageUrl("");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    setUploadError("");
    setUploadedImageUrl("");

    const allowedTypes = ["image/jpeg", "image/png", "image/svg+xml"];

    if (!allowedTypes.includes(file.type)) {
      setUploadError("Please select a valid image file (JPG, PNG, SVG)");
      return;
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File size must be less than 5MB");
      return;
    }

    await uploadImage(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadClick = () => {
    if (!isUploading) {
      setUploadError("");
      fileInputRef.current?.click();
    }
  };

  const dismissError = () => {
    setUploadError("");
  };

  // Function to handle image deletion - to be implemented later
  const handleDeleteImage = () => {
    // TODO: Implement actual image deletion logic here
    console.log("Deleting image:", uploadedImageUrl);

    setUploadedImageUrl("");
    setUploadError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Modal
      size={"md"}
      subtitle="Update and Manage Business Information"
      image={SettingFiles.BusinessIcon}
      isOpen={isOpen}
      onClose={onClose}
      title="Business Details"
    >
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input
              label="Name"
              value={details.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Enter business name"
              className={`w-full px-4 py-3 text-left bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#15BA5C] transition-colors ${getDisabledStyles(
                details.name
              )}`}
            />
          </div>

         
          <Input
            label="Email"
            type="email"
            value={details.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="Enter Email Address"
            className={`w-full px-4 py-3 text-left bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#15BA5C] transition-colors ${getDisabledStyles(
              details.email as string
            )}`}
          />

          <Input
            label="Phone Number"
            value={details.phone}
            onChange={(e) => {
              handleChange("phone", e.target.value);
              setPhoneError("");
              if (selectedCountry) {
                const phoneNumber = parsePhoneNumberFromString(
                  e.target.value,
                  selectedCountry.isoCode as import("libphonenumber-js").CountryCode
                );
                if (!phoneNumber || !phoneNumber.isValid()) {
                  setPhoneError("Invalid phone number for selected country");
                }
              }
            }}
            placeholder="Enter phone number"
            disabled={!selectedCountry}
            className={`w-full px-4 py-3 text-left bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#15BA5C] transition-colors ${getDisabledStyles(
              details.phone
            )} ${!selectedCountry ? "cursor-not-allowed" : ""}`}
          />

          {/* Country Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setIsCountryOpen(!isCountryOpen);
                }}
                className={`w-full px-4 py-3 text-left bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#15BA5C] transition-colors ${getDisabledStyles(
                  details.country
                )}`}
              >
                <span
                  className={
                    selectedCountry ? "text-gray-900" : "text-gray-500"
                  }
                >
                  {selectedCountry ? (
                    <span className="flex items-center">
                      <Image
                        src={`https://flagcdn.com/24x18/${selectedCountry.isoCode.toLowerCase()}.png`}
                        alt={selectedCountry.name + " flag"}
                        className="w-6 h-4 mr-2 rounded-sm border border-gray-200 object-cover"
                        style={{ display: "inline-block" }}
                        width={20}
                        height={20}
                      />
                      {selectedCountry.name}
                    </span>
                  ) : (
                    "Select your country"
                  )}
                </span>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </button>

              {isCountryOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                  <div className="px-3 py-2 border-b border-gray-200">
                    <input
                      type="text"
                      value={countrySearchTerm}
                      onChange={(e) => setCountrySearchTerm(e.target.value)}
                      placeholder="Search country..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#15BA5C] text-sm"
                      autoFocus
                    />
                  </div>

                  <div className="py-1 max-h-60 overflow-y-auto">
                    {filteredCountries.length > 0 ? (
                      filteredCountries.map((country) => (
                        <button
                          key={country.isoCode}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handleCountrySelect(country);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between group"
                        >
                          <span className="flex items-center text-gray-900">
                            <span className="flex items-center">
                              <Image
                                src={`https://flagcdn.com/24x18/${country.isoCode.toLowerCase()}.png`}
                                alt={country.name + " flag"}
                                className="w-6 h-4 mr-2 rounded-sm border border-gray-200 object-cover"
                                style={{ display: "inline-block" }}
                                width={20}
                                height={20}
                              />
                              {country.name}
                            </span>
                          </span>
                          {selectedCountry?.isoCode === country.isoCode && (
                            <Check className="h-4 w-4 text-[#15BA5C]" />
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        No countries found.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* State Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  if (selectedCountry) {
                    setIsStateOpen(!isStateOpen);
                  }
                }}
                disabled={!selectedCountry}
                className={`w-full px-4 py-3 text-left bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#15BA5C] transition-colors ${
                  !selectedCountry
                    ? "border-[#A6A6A6] text-gray-400 cursor-not-allowed"
                    : getDisabledStyles(details.state)
                }`}
              >
                <span
                  className={selectedState ? "text-gray-900" : "text-gray-500"}
                >
                  {selectedState ? selectedState.name : "Select your state"}
                </span>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </button>

              {isStateOpen && selectedCountry && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                  <div className="px-3 py-2 border-b border-gray-200">
                    <input
                      type="text"
                      value={stateSearchTerm}
                      onChange={(e) => setStateSearchTerm(e.target.value)}
                      placeholder="Search state..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#15BA5C] text-sm"
                      autoFocus
                    />
                  </div>

                  <div className="py-1 max-h-60 overflow-y-auto">
                    {filteredStates.length > 0 ? (
                      filteredStates.map((state) => (
                        <button
                          key={state.isoCode}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handleStateSelect(state);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between group"
                        >
                          <span className="text-gray-900">{state.name}</span>
                          {selectedState?.isoCode === state.isoCode && (
                            <Check className="h-4 w-4 text-[#15BA5C]" />
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        No states found.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* City Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  if (selectedState) {
                    setIsCityOpen(!isCityOpen);
                  }
                }}
                disabled={!selectedState}
                className={`w-full px-4 py-3 text-left bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#15BA5C] transition-colors ${
                  !selectedState
                    ? "border-[#A6A6A6] text-gray-400 cursor-not-allowed"
                    : getDisabledStyles(details.city)
                }`}
              >
                <span
                  className={selectedCity ? "text-gray-900" : "text-gray-500"}
                >
                  {selectedCity ? selectedCity.name : "Select your city"}
                </span>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </button>

              {isCityOpen && selectedState && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                  <div className="px-3 py-2 border-b border-gray-200">
                    <input
                      type="text"
                      value={citySearchTerm}
                      onChange={(e) => setCitySearchTerm(e.target.value)}
                      placeholder="Search city..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#15BA5C] text-sm"
                      autoFocus
                    />
                  </div>

                  <div className="py-1 max-h-60 overflow-y-auto">
                    {filteredCities.length > 0 ? (
                      filteredCities.map((city) => (
                        <button
                          key={city.name}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handleCitySelect(city);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between group"
                        >
                          <span className="text-gray-900">{city.name}</span>
                          {selectedCity?.name === city.name && (
                            <Check className="h-4 w-4 text-[#15BA5C]" />
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        No cities found.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Input
            label="Street Address"
            value={details.address}
            onChange={(e) => handleChange("address", e.target.value)}
            placeholder="Enter street address"
            className={`w-full px-4 py-3 text-left bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#15BA5C] transition-colors ${getDisabledStyles(
              details.address
            )}`}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Type
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setIsBusinessTypeOpen(!isBusinessTypeOpen);
                }}
                className={`w-full px-4 py-3 text-left bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#15BA5C] transition-colors ${getDisabledStyles(
                  businessType
                )}`}
              >
                <span
                  className={businessType ? "text-gray-900" : "text-gray-500"}
                >
                  {businessType || "Select your Business type"}
                </span>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </button>

              {isBusinessTypeOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                  <div className="py-1">
                    {businessTypes.map((type, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          handleBusinessTypeSelect(type);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between group"
                      >
                        <span className="text-gray-900">{type}</span>
                        {businessType === type && (
                          <Check className="h-4 w-4 text-[#15BA5C]" />
                        )}
                      </button>
                    ))}

                    {!isAddingNew ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setIsAddingNew(true);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center text-[#15BA5C] font-medium"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Business
                      </button>
                    ) : (
                      <div className="px-4 py-2 border-t border-gray-100">
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={newBusinessType}
                            onChange={(e) => setNewBusinessType(e.target.value)}
                            placeholder="Enter business type"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#15BA5C]"
                            autoFocus
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddBusinessType();
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              handleAddBusinessType();
                            }}
                            className="p-2 bg-[#15BA5C] text-white rounded-md hover:bg-[#13A652] transition-colors"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setIsAddingNew(false);
                              setNewBusinessType("");
                            }}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Input
            label="Postal Code"
            value={details.postalCode}
            onChange={(e) => handleChange("postalCode", e.target.value)}
            placeholder="Enter postal code"
            className={`w-full px-4 py-3 text-left bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#15BA5C] transition-colors ${getDisabledStyles(
              details.postalCode
            )}`}
          />
        </div>

        {/* Logo Upload Section */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Logo
          </label>

          {/* Show existing logo if available */}
          {uploadedImageUrl || outlet?.outlet.logoUrl ? (
            <div className="w-full mb-4">
              <section className="relative h-[250px] w-full border border-gray-200 rounded-lg overflow-hidden">
                <Image
                  src={uploadedImageUrl || (outlet?.outlet.logoUrl as string)}
                  alt="Business logo"
                  fill
                  className="object-contain"
                  sizes="100vw"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    // Handle error state if needed
                  }}
                />

                <button
                  type="button"
                  onClick={handleDeleteImage}
                  className="absolute px-2.5 py-2.5 flex items-center justify-center rounded-full top-2.5 right-2.5 z-50 bg-[#15BA5C] text-white font-bold transition-colors hover:bg-[#13A652]"
                  title="Change logo"
                >
                  <CiEdit className="h-5 w-5" />
                </button>
              </section>
            </div>
          ) : (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragOver
                  ? "border-[#15BA5C] bg-green-50"
                  : uploadError
                  ? "border-red-300 hover:border-red-400 hover:bg-red-50"
                  : "border-gray-300 hover:border-[#15BA5C] hover:bg-gray-50"
              } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleUploadClick}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.svg"
                onChange={handleFileInputChange}
                className="hidden"
                disabled={isUploading}
              />

              <div className="flex flex-col items-center">
                {isUploading ? (
                  <>
                    <Loader2 className="w-12 h-12 text-[#15BA5C] mb-4 animate-spin" />
                    <p className="text-[#15BA5C] font-medium mb-1">
                      Uploading...
                    </p>
                    <p className="text-sm text-gray-600">
                      Please wait while we upload your logo
                    </p>
                  </>
                ) : uploadError ? (
                  <>
                    <Upload className="w-12 h-12 text-red-400 mb-4" />
                    <div className="text-center">
                      <p className="text-red-600 font-medium mb-1">
                        Upload failed
                      </p>
                      <p className="text-sm text-gray-600">
                        Click to try again
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-yellow-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                      🏪
                    </div>
                    <div className="text-center">
                      <p className="text-[#15BA5C] font-medium mb-1">
                        {uploadedImageUrl || outlet?.outlet.logoUrl
                          ? "Click to change logo or Drag new logo here"
                          : "Click to upload or Drag your logo here"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Max file: 5mb, PNG, JPG, SVG
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Upload area - always show for uploading/changing logo */}

          {/* Error Message */}
          {uploadError && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md relative">
              <div className="flex items-start justify-between">
                <p className="text-sm text-red-600 flex-1">{uploadError}</p>
                <button
                  onClick={dismissError}
                  className="ml-2 text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
                  aria-label="Dismiss error"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col mt-6">
          <button
            className="w-full bg-[#15BA5C] py-2.5 text-[#FFFFFF] font-medium rounded-[10px] hover:bg-[#13A652] transition-colors"
            type="submit"
          >
            Save Details
          </button>
        </div>
      </form>
    </Modal>
  );
};
