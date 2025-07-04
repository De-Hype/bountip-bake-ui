import { useEffect, useState } from "react";
import { ChevronDown, Plus, X, Check } from "lucide-react";
import BusinessRevenueComponent from "./BusinessRevenueComponent";
import { businessService } from "@/services/businessService";
import { toast } from "sonner";
import { COOKIE_NAMES, getCookie, removeCookie } from "@/utils/cookiesUtils";
import { useRouter } from "next/navigation";
import { BusinessAndOutlet, BusinessResponse } from "@/types/businessTypes";
import { Country, State, City } from 'country-state-city';

// Get all countries from the package
const countries = Country.getAllCountries();

const defaultBusinessTypes = ["Bakery", "Restaurant", "Bar"];

const BusinessInfo = () => {
  const router = useRouter();
  const [businessType, setBusinessType] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [selectedState, setSelectedState] = useState<any>(null);
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [businessAddress, setBusinessAddress] = useState("")
  const [businessTypes, setBusinessTypes] = useState(defaultBusinessTypes);
  const [isBusinessTypeOpen, setIsBusinessTypeOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isStateOpen, setIsStateOpen] = useState(false);
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [newBusinessType, setNewBusinessType] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [revenue, setRevenue] = useState(50000);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setLogoFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [{ businessId, outletId }, setBusinessOutlet] =
    useState<BusinessAndOutlet>({
      businessId: "",
      outletId: "",
    });

  // Get states for selected country
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  // Update states when country changes
  useEffect(() => {
    if (selectedCountry) {
      const countryStates = State.getStatesOfCountry(selectedCountry.isoCode);
      setStates(countryStates);
      setSelectedState(null);
      setSelectedCity(null);
      setCities([]);
    }
  }, [selectedCountry]);

  // Update cities when state changes
  useEffect(() => {
    if (selectedState && selectedCountry) {
      const stateCities = City.getCitiesOfState(selectedCountry.isoCode, selectedState.isoCode);
      setCities(stateCities);
      setSelectedCity(null);
    }
  }, [selectedState, selectedCountry]);

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

  useEffect(() => {
    if (typeof businessId === "number" && typeof outletId === "number") return;

    const fetchBusiness = async () => {
      try {
        const res =
          (await businessService.getUserBusiness()) as BusinessResponse;
        console.log("This is res ----", res);
        if ("error" in res || !res.status) {
          console.warn("Failed to fetch business:", res);
          return;
        }

        const businessId = res.data?.business?.id as string | number;
        const outletId = res.data?.outlets?.[0]?.outlet?.id as string | number;
        console.log("This is business----", businessId, outletId);
        setBusinessOutlet({ businessId , outletId });
      } catch (err) {
        console.error("Unexpected error while fetching business:", err);
      }
    };

    fetchBusiness();
  }, [businessId, outletId]);

  const handleBusinessTypeSelect = (type: string) => {
    setBusinessType(type);
    setIsBusinessTypeOpen(false);
  };

  const handleCountrySelect = (country: any) => {
    setSelectedCountry(country);
    setIsLocationOpen(false);
  };

  const handleStateSelect = (state: any) => {
    setSelectedState(state);
    setIsStateOpen(false);
  };

  const handleCitySelect = (city: any) => {
    setSelectedCity(city);
    setIsCityOpen(false);
  };

  // Handle image upload URL from child component
  const handleImageUpload = (url: string) => {
    setUploadedImageUrl(url);
  };

  // Function to get country flag emoji
  const getCountryFlag = (isoCode: string) => {
    return isoCode
      .toUpperCase()
      .replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397));
  };

  const handleBusinessOnboardingSubmission = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!businessType || !selectedCountry) {
      alert("Please select business type and location");
      return;
    }

    try {
      const Tokens = getCookie<{
        accessToken: string;
        refreshToken: string;
      }>(COOKIE_NAMES.BOUNTIP_LOGIN_USER_TOKENS);
      
      // Build location string
      const locationParts = [selectedCity?.name, selectedState?.name, selectedCountry?.name].filter(Boolean);
      const businessLocation = locationParts.join(", ");
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await businessService.onboardBusiness({
        businessId: businessId as number,
        outletId: outletId as number,
        country: selectedCountry.name,
        logoUrl: uploadedImageUrl,
        address: businessAddress || businessLocation,
        businessType: businessType,
        currency: "USD",
        revenueRange: revenue.toString(),
      });
      
      if (response.status) {
        toast.success("Business information submitted successfully!", {
          duration: 4000,
          position: "bottom-right",
        });
        removeCookie(COOKIE_NAMES.BOUNTIP_REGISTERED_USERS);
        console.log(Tokens)
        if(Tokens?.accessToken && Tokens?.refreshToken) {
          router.push("/dashboard")
        } else{
          router.push("/auth?signin");
        }
      }
      console.log("Business onboarding response:", response);
    } catch (error) {
      console.error(error);
      alert("An error occurred while submitting your business information.");
    }
  };

  return (
    <>
      <h3 className="text-[#1E1E1E] text-[26px] font-bold mt-6 mb-4 text-center">
        Tell us About your <span className="text-[#15BA5C]">Business</span>
      </h3>
      <form>
        <div className="space-y-6">
          {/* Business Type Dropdown */}
          <div className="space-y-2">
            <h3 className="font-medium text-[18px] text-gray-700">
              What type of Business are you?
            </h3>
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setIsBusinessTypeOpen(!isBusinessTypeOpen);
                }}
                className="w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#15BA5C] transition-colors"
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

          {/* Country Selection */}
          <div className="space-y-2 text-[#1E1E1E]">
            <h3 className="font-medium text-[18px] text-[#1E1E1E]">
              Where is your Business located?
            </h3>
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setIsLocationOpen(!isLocationOpen);
                }}
                className="w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#15BA5C] transition-colors"
              >
                <span
                  className={
                    selectedCountry ? "text-gray-900" : "text-gray-500"
                  }
                >
                  {selectedCountry ? (
                    <span className="flex items-center">
                      <span className="text-xl mr-2">
                        {getCountryFlag(selectedCountry.isoCode)}
                      </span>
                      {selectedCountry.name}
                    </span>
                  ) : (
                    "Select your country"
                  )}
                </span>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </button>

              {isLocationOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <div className="py-1">
                    {countries.map((country) => (
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
                          <span className="text-xl mr-2">
                            {getCountryFlag(country.isoCode)}
                          </span>
                          {country.name}
                        </span>
                        {selectedCountry?.isoCode === country.isoCode && (
                          <Check className="h-4 w-4 text-[#15BA5C]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* State Selection */}
          {selectedCountry && states.length > 0 && (
            <div className="space-y-2 text-[#1E1E1E]">
              <h3 className="font-medium text-[18px] text-[#1E1E1E]">
                Select State/Province
              </h3>
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsStateOpen(!isStateOpen);
                  }}
                  className="w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#15BA5C] transition-colors"
                >
                  <span
                    className={
                      selectedState ? "text-gray-900" : "text-gray-500"
                    }
                  >
                    {selectedState?.name || "Select your state/province"}
                  </span>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </button>

                {isStateOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <div className="py-1">
                      {states.map((state) => (
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
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* City Selection */}
          {selectedState && cities.length > 0 && (
            <div className="space-y-2 text-[#1E1E1E]">
              <h3 className="font-medium text-[18px] text-[#1E1E1E]">
                Select City
              </h3>
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsCityOpen(!isCityOpen);
                  }}
                  className="w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#15BA5C] transition-colors"
                >
                  <span
                    className={
                      selectedCity ? "text-gray-900" : "text-gray-500"
                    }
                  >
                    {selectedCity?.name || "Select your city"}
                  </span>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </button>

                {isCityOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <div className="py-1">
                      {cities.map((city) => (
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
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="font-medium text-[18px] text-gray-700">
              What is your Business address?
            </h3>
            <input
              type="text"
              name="businessAddress"
              id=""
              onChange={(e) => setBusinessAddress(e.target.value)}
              placeholder="Enter your Business address"
              autoFocus
              className="w-full text-[#1E1E1E] text-[15px] flex-1 px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#15BA5C]"
            />
          </div>
          <div className="w-full">
            <BusinessRevenueComponent
              onRevenueChange={setRevenue}
              onFileUpload={setLogoFile}
              onImageUpload={handleImageUpload}
            />
          </div>

          {/* Continue Button */}
          <button
            onClick={handleBusinessOnboardingSubmission}
            type="submit"
            disabled={!businessType || !selectedCountry}
            className="w-full mt-8 px-6 py-3 bg-[#15BA5C] text-white font-medium rounded-lg hover:bg-[#13A652] focus:outline-none focus:ring-2 focus:ring-[#15BA5C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Continue
          </button>
        </div>
      </form>
    </>
  );
};

export default BusinessInfo;