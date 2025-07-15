"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { LogOut, Settings } from "lucide-react";
import { DashboardSidebarNavigationData } from "@/data/SidebarNavigationData";
import AssetsFiles from "@/assets";
import { useModalStore } from "@/stores/useUIStore";
import TooltipWrapper from "../ToolTip/TooltipWrapper";
import { useSelectedOutlet } from "@/hooks/useSelectedOutlet";
import { getRole } from "@/utils/getRolesType";
import { COOKIE_NAMES, removeCookie } from "@/utils/cookiesUtils";
import { useRouter } from "next/navigation";

const DashboardSidebarLayout = () => {
  const { showFullDashboardSidebar } = useModalStore();
  const pathname = usePathname();
  const activeId = pathname.split("/")[1] || "dashboard";
  const [settingsOpen, setSettingsOpen] = useState(false);
  const router = useRouter();
  // const user = getCookie<UserType>("bountipLoginUser");
  // const user = getCookie<UserType>(COOKIE_NAMES.BOUNTIP_LOGIN_USER);
  const outlets = useSelectedOutlet();
  if (!outlets) return;

  const sidebarWidth = showFullDashboardSidebar ? "w-[300px]" : "w-20";
  const handleLogOut = () => {
    removeCookie(COOKIE_NAMES.BOUNTIP_LOGIN_USER_TOKENS);
    removeCookie(COOKIE_NAMES.BOUNTIP_LOCATION_ONBOARD);
    router.push("/auth?signin");
  };

  return (
    <section
      className={`bg-white h-full ${sidebarWidth} transition-all duration-300`}
    >
      <section>
        <nav className="flex flex-col gap-2 px-2 pb-4">
          {DashboardSidebarNavigationData.map((item) => {
            const isActive = item.id === activeId;
            const link = (
              <Link
                href={`/${item.id}`}
                key={item.id}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition font-normal
        ${
          isActive
            ? "bg-gray-200 font-medium text-[#898989]"
            : "text-[#898989] hover:bg-gray-100"
        }
      `}
              >
                <Image
                  src={item.icon}
                  alt={item.label}
                  width={24}
                  height={24}
                  className="object-contain"
                />
                {showFullDashboardSidebar && (
                  <span className="text-nowrap">{item.label}</span>
                )}
              </Link>
            );

            return showFullDashboardSidebar ? (
              link
            ) : (
              <TooltipWrapper content={item.label} key={item.id}>
                {link}
              </TooltipWrapper>
            );
          })}
        </nav>
      </section>

      <section className="my-6">
        <p className="text-sm font-semibold px-4 pt-4 text-[#A6A6A6]">
          General
        </p>

        <hr className="my-2 text-[#E6E6E6]" />

        {showFullDashboardSidebar ? (
          <Link
            href="/settings"
            onClick={() => setSettingsOpen(!settingsOpen)}
            className={`flex items-center gap-3 px-4 py-2 text-sm rounded-lg transition ${
              activeId === "settings"
                ? "bg-[#F2FFF9] text-[#15BA5C] border-l-4 border-[#15BA5C]"
                : "text-[#898989] hover:bg-gray-100"
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Link>
        ) : (
          <TooltipWrapper content="Settings">
            <Link
              href="/settings"
              onClick={() => setSettingsOpen(!settingsOpen)}
              className={`flex items-center gap-3 px-4 py-2 text-sm rounded-lg transition ${
                activeId === "settings"
                  ? "bg-[#F2FFF9] text-[#15BA5C] border-l-4 border-[#15BA5C]"
                  : "text-[#898989] hover:bg-gray-100"
              }`}
            >
              <Settings className="w-5 h-5" />
            </Link>
          </TooltipWrapper>
        )}

        <div className="mt-4 px-3 flex flex-col gap-4 text-sm text-[#4B4B4B]">
          <div
            className="flex items-center gap-3"
            title={outlets?.outlet.name || "User"}
          >
            <Image
              src={outlets?.outlet.logoUrl || AssetsFiles.UserPerson}
              className="h-[48px] w-[48px] rounded-full"
              alt="User"
              width={48}
              height={48}
            />
            {showFullDashboardSidebar && (
              <div>
                <p className="font-medium">{outlets?.outlet.name}</p>
                <p className="text-xs text-gray-500">
                  {getRole(outlets?.accessType)}
                </p>
              </div>
            )}
          </div>

          {showFullDashboardSidebar ? (
            <button
              onClick={handleLogOut}
              className="flex items-center gap-2 text-red-500 text-sm py-3.5 cursor-pointer hover:bg-red-50 hover:rounded-[10px] px-1.5"
            >
              <LogOut className="w-5 h-5" />
              <span>Log Out</span>
            </button>
          ) : (
            <TooltipWrapper content="Log Out">
              <button className="flex items-center gap-2 text-red-500 text-sm py-3.5 cursor-pointer">
                <LogOut className="w-5 h-5" />
              </button>
            </TooltipWrapper>
          )}

          {showFullDashboardSidebar && (
            <div className="mt-4 bg-[#15BA5C] p-3 rounded-xl flex flex-col items-center text-center w-full">
              <Image
                src="/upgrade-illustration.svg"
                alt="Upgrade"
                width={120}
                height={90}
                className="mb-2"
              />
              <p className="text-xs font-semibold text-green-800 mb-2">
                Unlock our unlimited features now!
              </p>
              <button className="bg-white text-green-600 font-medium text-xs px-4 py-1.5 rounded-full shadow hover:bg-green-50">
                Upgrade Now!
              </button>
            </div>
          )}
        </div>
      </section>
    </section>
  );
};

export default DashboardSidebarLayout;
