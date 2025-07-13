"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useModalStore } from "@/stores/useUIStore";
import { COOKIE_NAMES, removeCookie } from "@/utils/cookiesUtils";

export default function SuccessModal() {
  const router = useRouter();
  const [animate, setAnimate] = useState(false);
  const { setShowSignUpSuccessModal, showsignUpSuccessModal } = useModalStore();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showsignUpSuccessModal) {
      setAnimate(true);
      interval = setInterval(() => {
        setAnimate(true);
        const timeout = setTimeout(() => setAnimate(false), 1500);
        return () => clearTimeout(timeout);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [showsignUpSuccessModal]);

  if (!showsignUpSuccessModal) return null;

  const handleEmailVerified = () => {
    console.log("Testing this");
    setShowSignUpSuccessModal(false);
    router.push(`/onboarding`);
    
    console.log()
    removeCookie(COOKIE_NAMES.REG_USER_EMAIL,)
    //removeCookie("regUserEmail");
  };

  return (
    <div className="fixed inset-0  bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-80 p-6 text-center">
        <div className="relative flex justify-center items-center mb-4 h-[130px]">
          {animate && (
            <span className="absolute w-32 h-32 rounded-full border-4 border-green-500 animate-ping" />
          )}
          <span className="w-28 h-28 rounded-full bg-green-500 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-14 w-14 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </span>
        </div>
        <h2 className="text-xl font-bold text-gray-800">
          Sign up <span className="text-[#15BA5C]">successful!</span>
        </h2>
        <p className="text-sm text-gray-600 mt-2 mb-4 text-nowrap">
          Your account has been created successfully!
        </p>
        <button
          onClick={handleEmailVerified}
          className="bg-[#15BA5C] hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg transition duration-300 w-full"
        >
          Proceed
        </button>
      </div>
    </div>
  );
}
