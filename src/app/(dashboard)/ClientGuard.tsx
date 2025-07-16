"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardSidebarLayout from "@/components/Sidebar/Sidebar";
import Header from "@/components/Headers/Header";
import { useSelectedOutlet } from "@/hooks/useSelectedOutlet";
import { COOKIE_NAMES, setCookie } from "@/utils/cookiesUtils";

export default function ClientGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const selectedOutlet = useSelectedOutlet();

  useEffect(() => {
    console.log("This should run");

    if (!selectedOutlet) return;

    const requiredFieldsPresent = selectedOutlet.outlet.currency;

    if (!requiredFieldsPresent) {
      setCookie(
        COOKIE_NAMES.BOUNTIP_LOCATION_ONBOARD,
        { selectedOutlet },
        { expiresInMinutes: 1000 }
      );
      router.push("/onboarding");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOutlet]);

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="flex">
          <DashboardSidebarLayout />
          <section className=" w-full">{children}</section>
        </main>
      </div>
    </>
  );
}
