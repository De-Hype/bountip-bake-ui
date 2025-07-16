"use client";

import AssetsFiles from "@/assets";
import { useBusinessStore } from "@/stores/useBusinessStore";
import { useModalStore } from "@/stores/useUIStore";
import { UserType } from "@/types/userTypes";
import { COOKIE_NAMES, getCookie, removeCookie } from "@/utils/cookiesUtils";
import {
  Bell,
  ChevronDown,
  ChevronsLeftRight,
  LogOut,
  Search,
  Settings,
  Loader2,
} from "lucide-react";
import Image, { StaticImageData } from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { Outlet } from "@/types/outlet";

const Header = () => {
  const { setShowFullDashboardSidebar, showFullDashboardSidebar } =
    useModalStore();
  const {
    fetchBusinessData,
    outlets,
    selectedOutletId,
    setSelectedOutletId,
    loading,
  } = useBusinessStore();

  const router = useRouter();

  useEffect(() => {
    fetchBusinessData();
  }, [fetchBusinessData]);

  const handleLogOut = () => {
    removeCookie(COOKIE_NAMES.BOUNTIP_LOGIN_USER_TOKENS);
    removeCookie(COOKIE_NAMES.BOUNTIP_LOCATION_ONBOARD)
    router.push("/auth?signin");
  };

  const user = getCookie<UserType>(COOKIE_NAMES.BOUNTIP_LOGIN_USER);

  // Find selected OutletAccess by matching selectedOutletId to outlet.outlet.id
  const selectedOutletAccess = outlets.find(
    (outletAccess) => outletAccess.outlet.id === selectedOutletId
  );

  // Extract outlet from OutletAccess for UserDropdown
  const outletList: Outlet[] = outlets.map((o) => o.outlet);

  return (
    <header className="flex items-center justify-between p-4 bg-white ">
      <section className="flex items-center gap-4">
        <Image src={AssetsFiles.LogoTwo} alt="Logo" className="w-[100px]" />
        <button
          className="bg-[#FBFBFB] border-[#C1C1C1] border p-2 rounded"
          type="button"
          onClick={() => setShowFullDashboardSidebar(!showFullDashboardSidebar)}
          aria-label="Toggle Sidebar"
        >
          <ChevronsLeftRight className="text-[#1C1B20] font-light" />
        </button>
      </section>

      <section className="relative border border-[#E7E7E7] rounded-2xl py-3 pl-11 pr-6 w-1/3">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={16}
        />
        <input
          type="text"
          placeholder="Search for anything..."
          className="outline-none border-none w-full bg-transparent"
        />
      </section>

      <section className="flex items-center gap-3.5">
        <div className="shadow-md rounded-full p-2.5 bg-white flex items-center gap-3 relative">
          <span className="absolute -top-2.5 right-1.5 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
            16
          </span>
          <Bell size={16} className="text-gray-600" />
        </div>

        <div className="w-[300px]">
          <UserDropdown
            user={{
              fullName: user?.fullName as string,
              avatar: AssetsFiles.UserPersonTwo,
            }}
            outlets={outletList}
            activeOutlet={selectedOutletAccess?.outlet}
            loading={loading}
            onProfileSelect={(selected) => {
              setSelectedOutletId(selected.id);
            }}
            onSettingsClick={() => router.push("/settings")}
            onLogoutClick={handleLogOut}
          />
        </div>
      </section>
    </header>
  );
};

export default Header;

// === UserDropdown component ===

interface User {
  fullName: string;
  avatar: StaticImageData;
}

interface UserDropdownProps {
  user?: User;
  outlets: Outlet[];
  activeOutlet?: Outlet;
  loading?: boolean;
  onProfileSelect?: (profile: Outlet) => void;
  onSettingsClick?: () => void;
  onLogoutClick?: () => void;
}

interface UserDropdownProps {
  user?: User;
  outlets: Outlet[];
  activeOutlet?: Outlet;
  loading?: boolean;
  onProfileSelect?: (outlet: Outlet) => void;
  onSettingsClick?: () => void;
  onLogoutClick?: () => void;
}

const UserDropdown: React.FC<UserDropdownProps> = ({
  user,
  outlets,
  activeOutlet,
  loading = false,
  onProfileSelect,
  onSettingsClick,
  onLogoutClick,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    if (!loading) setIsOpen((prev) => !prev);
  };

  const handleProfileClick = (outlet: Outlet) => {
    onProfileSelect?.(outlet);
    setIsOpen(false);
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const imageUrl =
    activeOutlet?.logoUrl || user?.avatar || "/default-avatar.png";
  console.log(imageUrl, "This imageUrl is being used in UserDropdown");

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div
        onClick={toggleDropdown}
        className={`flex items-center justify-between gap-2.5 w-full cursor-pointer rounded-3xl bg-[#FAFAFC] py-1 pr-2 pl-1 transition-colors duration-200 ${
          loading ? "opacity-70 cursor-not-allowed" : "hover:bg-gray-100"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Image
              src={imageUrl}
              alt="User"
              width={40}
              height={40}
              className="h-[40px] w-[40px] rounded-full object-cover"
            />
            {loading && (
              <div className="absolute inset-0 bg-white bg-opacity-70 rounded-full flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
              </div>
            )}
          </div>
          <h3 className="font-medium text-gray-900 truncate whitespace-nowrap overflow-hidden max-w-[180px]">
            {loading ? "Loading..." : activeOutlet?.name || "Select Outlet"}
          </h3>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-gray-600 transition-transform duration-300 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </div>

      <div
        className={`absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden transition-all duration-300 transform origin-top ${
          isOpen
            ? "opacity-100 scale-y-100 translate-y-0"
            : "opacity-0 scale-y-95 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className="py-2 max-h-[250px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-4 text-gray-500 text-sm">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              <span className="ml-2">Loading outlets...</span>
            </div>
          ) : outlets.length === 0 ? (
            <div className="px-4 py-3 text-center text-gray-500 text-sm">
              No outlets available
            </div>
          ) : (
            outlets.map((outlet) => (
              <div
                key={outlet.id}
                onClick={() => handleProfileClick(outlet)}
                className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
              >
                <span className="text-gray-700 font-medium">{outlet.name}</span>
                <div
                  className={`w-3 h-3 rounded-full border-2 ${
                    outlet.id === activeOutlet?.id
                      ? "bg-green-500 border-green-500"
                      : "border-gray-300"
                  }`}
                >
                  {outlet.id === activeOutlet?.id && (
                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-gray-100">
          <button
            onClick={onSettingsClick}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left transition-colors duration-150"
          >
            <Settings className="h-4 w-4 text-gray-600" />
            <span className="text-gray-700 font-medium">Settings</span>
            <ChevronDown className="h-3 w-3 text-gray-400 ml-auto rotate-[-90deg]" />
          </button>

          <button
            onClick={onLogoutClick}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-left group transition-colors duration-150"
          >
            <LogOut className="h-4 w-4 text-red-500 group-hover:text-red-600" />
            <span className="text-red-500 font-medium group-hover:text-red-600">
              Log Out
            </span>
            <ChevronDown className="h-3 w-3 text-red-400 ml-auto rotate-[-90deg] group-hover:text-red-500" />
          </button>
        </div>
      </div>
    </div>
  );
};
