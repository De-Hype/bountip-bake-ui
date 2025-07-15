"use client"
import { useEffect, useState } from "react";
import { ChevronDown, Plus, X, Check } from "lucide-react";
import BusinessRevenueComponent from "./BusinessRevenueComponent";
import { businessService } from "@/services/businessService";
import { toast } from "sonner";
import { BusinessAndOutlet, BusinessResponse } from "@/types/businessTypes";
import { Country, ICountry } from "country-state-city";
import C from "currency-codes";
import Image from "next/image";
import { OutletAccess } from "@/types/outlet";
import { COOKIE_NAMES, getCookie } from "@/utils/cookiesUtils";
import { useRouter } from "next/navigation";

// Retrieve countries and currencies
const countries = Country.getAllCountries();
const currencies = C.codes()
  .map((code) => C.code(code))
  .filter(Boolean);

const defaultBusinessTypes = ["Bakery", "Restaurant", "Bar"];

interface BusinessInfoProps {
  onNext: () => void;
}
const BusinessInfo = ({ onNext }: BusinessInfoProps) => {
  const cookieData = getCookie<{ selectedOutlet: OutletAccess }>(
    COOKIE_NAMES.BOUNTIP_LOCATION_ONBOARD
  );
  const selectedOutlet = cookieData?.selectedOutlet;
  const router = useRouter()
  const [businessType, setBusinessType] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<ICountry | null>(null);
  const [businessAddress, setBusinessAddress] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedCurrency, setSelectedCurrency] = useState<any>(null);
  const [businessTypes, setBusinessTypes] = useState(defaultBusinessTypes);
  const [isBusinessTypeOpen, setIsBusinessTypeOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [newBusinessType, setNewBusinessType] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [revenue, setRevenue] = useState(50000);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setLogoFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currencySearchTerm, setCurrencySearchTerm] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [{ businessId, outletId }, setBusinessOutlet] =
    useState<BusinessAndOutlet>({
      businessId: "",
      outletId: "",
    });

  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCurrencies = currencies.filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (currency: any) =>
      currency.currency
        .toLowerCase()
        .includes(currencySearchTerm.toLowerCase()) ||
      currency.code.toLowerCase().includes(currencySearchTerm.toLowerCase())
  );

  const handleAddBusinessType = () => {
    if (
      newBusinessType.trim() &&
      !businessTypes.includes(newBusinessType.trim())
    ) {
      const updated = [...businessTypes, newBusinessType.trim()];
      setBusinessTypes(updated);
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
        if ("error" in res || !res.status) return;
        const bizId = res.data?.business?.id as string | number;
        const outId = res.data?.outlets?.[0]?.outlet?.id as string | number;
        setBusinessOutlet({ businessId: bizId, outletId: outId });
      } catch (err) {
        console.error("Error fetching business:", err);
      }
    };
    fetchBusiness();
  }, [businessId, outletId]);

  const handleBusinessTypeSelect = (type: string) => {
    setBusinessType(type);
    setIsBusinessTypeOpen(false);
  };

  const handleCountrySelect = (country: ICountry) => {
    setSelectedCountry(country);
    setIsLocationOpen(false);
  };

  const handleCurrencySelect = (currency: string) => {
    setSelectedCurrency(currency);
    setIsCurrencyOpen(false);
  };

  const handleImageUpload = (url: string) => setUploadedImageUrl(url);

  const handleBusinessOnboardingSubmission = async (e: React.FormEvent) => {
    if (!selectedOutlet) return null;
    console.log(selectedOutlet);
    e.preventDefault();
    if (!businessType || !selectedCountry || !selectedCurrency) {
      return alert("Please select business type, location, and currency");
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await businessService.onboardBusiness({
        businessId: selectedOutlet.outlet.businessId,
        outletId: selectedOutlet.outlet.id,
        country: selectedCountry.name,
        logoUrl: uploadedImageUrl,
        address: businessAddress || selectedCountry.name,
        businessType,
        currency: selectedCurrency.code,
        revenueRange: revenue.toString(),
      },  selectedOutlet?  COOKIE_NAMES.BOUNTIP_LOGIN_USER_TOKENS: COOKIE_NAMES.BOUNTIP_REGISTERED_USERS);

      if (response.status) {
        toast.success("Business information submitted successfully!", {
          duration: 4000,
          position: "bottom-right",
        });
        if (!selectedOutlet) {
          onNext();
        } else {
          router.push("/dashboard ");
        }
      }
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
                <div className="absolute z-10 w-full mt-1 bg-[#1C1B20] text-white border border-gray-300 rounded-lg shadow-lg">
                  <div className="py-1">
                    {businessTypes.map((type, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          handleBusinessTypeSelect(type);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-500 flex items-center justify-between group"
                      >
                        <span>{type}</span>
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
                        className="w-full px-4 py-3 text-left hover:bg-gray-500 flex items-center text-[#15BA5C] font-medium"
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

          {/* Country Dropdown */}
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
                      <Image
                        src={`https://flagcdn.com/24x18/${selectedCountry.isoCode.toLowerCase()}.png`}
                        alt={`${selectedCountry.name} flag`}
                        width={24}
                        height={18}
                        className="w-6 h-4 mr-2 rounded-sm border border-gray-200 object-cover"
                      />
                      {selectedCountry.name}
                    </span>
                  ) : (
                    "Select your country"
                  )}
                </span>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </button>
              {isLocationOpen && (
                <div className="absolute z-10 w-full mt-1 bg-[#1C1B20] border border-gray-300 rounded-lg shadow-lg">
                  <div className="px-3 py-2 border-b border-gray-200">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search country..."
                      className="w-full text-white px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#15BA5C] text-sm"
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
                            setSearchTerm("");
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-500 flex items-center justify-between group"
                        >
                          <span className="flex items-center text-white">
                            <Image
                              src={`https://flagcdn.com/24x18/${country.isoCode.toLowerCase()}.png`}
                              alt={`${country.name} flag`}
                              width={24}
                              height={18}
                              className="w-6 h-4 mr-2 rounded-sm border border-gray-200 object-cover"
                            />
                            <span className="text-white">{country.name}</span>
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

          {/* Business Address */}
          <div className="space-y-2">
            <h3 className="font-medium text-[18px] text-gray-700">
              What is your Business address?
            </h3>
            <input
              type="text"
              name="businessAddress"
              onChange={(e) => setBusinessAddress(e.target.value)}
              placeholder="Enter your Business address"
              className="w-full text-[#1E1E1E] text-[15px] px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#15BA5C]"
            />
          </div>

          {/* Currency Dropdown */}
          <div className="space-y-2">
            <h3 className="font-medium text-[18px] text-gray-700">
              What is your preferred currency?
            </h3>
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setIsCurrencyOpen(!isCurrencyOpen);
                }}
                className="w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#15BA5C] transition-colors"
              >
                <span
                  className={
                    selectedCurrency ? "text-gray-900" : "text-gray-500"
                  }
                >
                  {selectedCurrency
                    ? `${selectedCurrency.currency} (${selectedCurrency.code})`
                    : "Select your currency"}
                </span>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </button>
              {isCurrencyOpen && (
                <div className="absolute z-10 w-full mt-1 bg-[#1C1B20] border border-gray-300 rounded-lg shadow-lg">
                  <div className="px-3 py-2 border-b border-gray-200">
                    <input
                      type="text"
                      value={currencySearchTerm}
                      onChange={(e) => setCurrencySearchTerm(e.target.value)}
                      placeholder="Search currency..."
                      className="w-full text-white px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#15BA5C] text-sm"
                      autoFocus
                    />
                  </div>
                  <div className="py-1 max-h-60 overflow-y-auto">
                    {filteredCurrencies.length > 0 ? (
                      filteredCurrencies.map(
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (currency: any) => (
                          <button
                            key={currency.code}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              handleCurrencySelect(currency);
                              setCurrencySearchTerm("");
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-gray-500 flex items-center justify-between group"
                          >
                            <span className="text-white">{`${currency.currency} (${currency.code})`}</span>
                            {selectedCurrency?.code === currency.code && (
                              <Check className="h-4 w-4 text-[#15BA5C]" />
                            )}
                          </button>
                        )
                      )
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        No currencies found.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Revenue + Logo Upload */}
          <div className="w-full">
            <BusinessRevenueComponent
              onRevenueChange={setRevenue}
              onFileUpload={setLogoFile}
              onImageUpload={handleImageUpload}
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleBusinessOnboardingSubmission}
            type="button"
            disabled={!businessType || !selectedCountry || !selectedCurrency}
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
