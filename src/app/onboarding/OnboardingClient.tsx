"use client";
import { useRouter, useSearchParams } from "next/navigation";
import AssetsFiles from "@/assets";
import SplitedProgressBar from "@/components/Loaders/SplitedProgressBar";
import Image, { StaticImageData } from "next/image";
import SetUpPin from "./SetUpPin";
import BusinessInfo from "./BusinessInfo";
import React, { useCallback } from "react";
import { COOKIE_NAMES, getCookie, removeCookie } from "@/utils/cookiesUtils";
import { OutletAccess } from "@/types/outlet";
import { ArrowLeft } from "lucide-react";
// import { COOKIE_NAMES, getCookie } from "@/utils/cookiesUtils";

const OnboardingClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentStep = searchParams.get("step") || "business";
  const outletData = getCookie<OutletAccess>(
    COOKIE_NAMES.BOUNTIP_LOCATION_ONBOARD
  );
  const handleReturnBack = () => {
    removeCookie(COOKIE_NAMES.BOUNTIP_LOCATION_ONBOARD);

    // Force a hard navigation
    window.location.href = "/settings"; // or your intended destination
  };


  const handleNextStep = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("step", "pin");
    router.push(`?${params.toString()}`);
  }, [router, searchParams]);

  const isPinStep = currentStep === "pin";
  const isBusinessStep = currentStep === "business";

  // const userTokens = getCookie<{ accessToken: string; refreshToken: string }>(
  //   // "bountipRegisteredUsers"
  //   COOKIE_NAMES.BOUNTIP_REGISTERED_USERS
  // );
  // useEffect(() => {
  //   const checkIfUserRegistered = () => {
  //     if (!userTokens) {
  //        router.push("/auth?signup");
  //       return null;
  //     }
  //   };
  //   checkIfUserRegistered();
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [userTokens]);
  return (
    <main className="flex min-h-screen">
      <section className="bg-[#FAFAFC] flex-1/3">
        <BountmpLanding />
      </section>
      <section className="flex-2/3 my-7 flex justify-center">
        <div className="w-[80%]">
          <SplitedProgressBar
            length={outletData ? 1 : 2}
            filled={isPinStep ? 2 : 1}
            color="#15BA5C"
          />
          {outletData && (
            <button
              onClick={ handleReturnBack}
              className="inline-flex my-2 items-center gap-2 px-4 py-2 text-sm font-medium bg-gray-200 text-gray-800 hover:bg-gray-300 rounded-md transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          )}
          {isPinStep && <SetUpPin />}
          {isBusinessStep && <BusinessInfo onNext={handleNextStep} />}
        </div>
      </section>
    </main>
  );
};

export default OnboardingClient;

// --- BountmpLanding and ProfileImage below ---

interface ProfileImageProps {
  src: StaticImageData;
  alt: string;
  className?: string;
}

const ProfileImage: React.FC<ProfileImageProps> = ({
  src,
  alt,
  className = "",
}) => (
  <div
    className={`absolute w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-lg ${className}`}
  >
    <Image
      src={src}
      alt={alt}
      width={64}
      height={64}
      className="w-full h-full object-cover"
    />
  </div>
);

const BountmpLanding: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-gray-50 overflow-hidden">
      <div className="absolute top-8 left-8 z-30">
        <Image src={AssetsFiles.LogoTwo} alt="Bountip Logo" />
      </div>

      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="absolute w-96 h-96 border-2 border-green-200 rounded-full opacity-30"></div>
        <div className="absolute w-80 h-80 border-2 border-green-300 rounded-full opacity-40"></div>
        <div className="absolute w-64 h-64 border-2 border-green-400 rounded-full opacity-50"></div>
        <div className="absolute w-48 h-48 border-2 border-green-500 rounded-full opacity-60"></div>
      </div>

      <div className="absolute inset-0 z-20">
        <ProfileImage
          src={AssetsFiles.AuthBgImage}
          alt="Profile 1"
          className="top-16 left-1/2 transform -translate-x-1/2"
        />
        <ProfileImage
          src={AssetsFiles.AuthBgImage}
          alt="Profile 2"
          className="top-1/2 left-16 transform -translate-y-1/2"
        />
        <ProfileImage
          src={AssetsFiles.AuthBgImage}
          alt="Profile 3"
          className="top-1/2 right-16 transform -translate-y-1/2"
        />
        <ProfileImage
          src={AssetsFiles.AuthBgImage}
          alt="Profile 4"
          className="bottom-16 left-1/2 transform -translate-x-1/2"
        />
      </div>

      <div className="absolute bottom-0 left-0 w-32 h-32 opacity-20 z-0">
        <div className="grid grid-cols-8 gap-1 p-4">
          {Array.from({ length: 64 }).map((_, i) => (
            <div
              key={i}
              className="w-1 h-1 bg-green-400 rounded-full"
              style={{ opacity: Math.random() * 0.5 + 0.3 }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen">
        {/* Optional content */}
      </div>
    </div>
  );
};
