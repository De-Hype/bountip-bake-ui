"use client";
import AssetsFiles from "@/assets";
import {
  getStrength,
  getStrengthLabel,
  PasswordStrengthMeter,
} from "@/components/Forms/AuthForm";
import {
  BadgeCheck,
  Eye,
  EyeOff,
  Fingerprint,
  Mail,
  MailOpen,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  COOKIE_NAMES,
  getCookie,
  removeCookie,
  setCookie,
} from "@/utils/cookiesUtils";
import authService from "@/services/authServices";
import SuccessToast from "@/components/Modals/Success/SuccessModal";
import ErrorToast from "@/components/Modals/Errors/ErrorModal";

type ToastType = "success" | "error";

interface ToastState {
  isOpen: boolean;
  type: ToastType;
  heading: string;
  description: string;
}

const ResetPasswordClient = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  // State for toast notifications
  const [toast, setToast] = useState<ToastState>({
    isOpen: false,
    type: "success",
    heading: "",
    description: "",
  });

  // Get step from URL query param, default to 'forgot'
  const step = searchParams.get("step") || "forgot";

  // Helper to navigate to a step by updating query param
  const goToStep = (newStep: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set("step", newStep);
    router.push(url.toString());
  };

  // Helper to show toast notifications
  const showToast = (type: ToastType, heading: string, description: string) => {
    setToast({
      isOpen: true,
      type,
      heading,
      description,
    });
  };

  const closeToast = () => {
    setToast((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <section className="max-h-screen h-screen">
      <div className="flex items-center justify-between px-5">
        <Image src={AssetsFiles.LogoTwo} alt="Logo" />
        <section className="flex items-center gap-1.5">
          <p className="text-base">Remember Password?</p>
          <Link className="text-[#15BA5C] text-base" href="/auth?signin">
            Sign in here
          </Link>
        </section>
      </div>
      <div className="my-6 flex items-center justify-center">
        {step === "forgot" && (
          <ForgotPassword
            onNext={() => goToStep("otp")}
            showToast={showToast}
          />
        )}
        {step === "otp" && (
          <OtpInput onNext={() => goToStep("create")} showToast={showToast} />
        )}
        {step === "create" && (
          <CreateNewPassword
            onNext={() => {
              showToast(
                "success",
                "Password Reset Successful!",
                "Your password has been reset successfully. You can now log in with your new password."
              );
              setTimeout(() => goToStep("success"), 1000);
            }}
            showToast={showToast}
          />
        )}
        {step === "success" && <PasswordResetSuccessful />}
      </div>

      {/* Toast Notifications */}
      {toast.type === "success" && (
        <SuccessToast
          heading={toast.heading}
          description={toast.description}
          isOpen={toast.isOpen}
          onClose={closeToast}
          duration={4000}
        />
      )}

      {toast.type === "error" && (
        <ErrorToast
          heading={toast.heading}
          description={toast.description}
          isOpen={toast.isOpen}
          onClose={closeToast}
          duration={4000}
        />
      )}
    </section>
  );
};

export default ResetPasswordClient;

function ForgotPassword({
  onNext,
  showToast,
}: {
  onNext: () => void;
  showToast: (type: ToastType, heading: string, description: string) => void;
}) {
  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleForgotPassword = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email) {
      showToast("error", "Email Required", "Please enter your email address");
      setIsLoading(false);
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await authService.forgotPassword({ email });
      console.log(response);

      if (response.error) {
        showToast(
          "error",
          "Failed to Send Code",
          response.message || "Failed to send reset code"
        );
        setIsLoading(false);
        return;
      }

      if (response.status) {
        showToast(
          "success",
          "Code Sent Successfully!",
          "Reset code has been sent to your email"
        );
        setCookie(
          COOKIE_NAMES.RESET_USER_EMAIL,
          { email: email },
          { expiresInMinutes: 30 }
        );
        setTimeout(() => {
          setIsLoading(false);
          onNext();
        }, 1500);
      }
    } catch (error) {
      console.error("Error sending forgot password:", error);
      showToast(
        "error",
        "Something Went Wrong",
        "An error occurred. Please try again."
      );
      setIsLoading(false);
    }
  };

  return (
    <form className="flex flex-col justify-between items-center w-3/4 h-[75vh]">
      <div className="flex flex-col items-center justify-center w-full flex-grow gap-4">
        <div className="bg-[#15BA5C] px-5 py-3 rounded-xl">
          <Fingerprint className="text-white" />
        </div>
        <h3 className="text-xl text-center text-[#1E1E1E] font-bold">
          Forgot Password
        </h3>
        <p className="text-center">Enter your email for instructions</p>
        <div className="flex items-center border border-[#E6E6E6] rounded-xl p-4 w-full">
          <Mail className="text-[#1E1E1E]" />
          <span className="h-[30px] w-0.5 bg-[#E6E6E6] mx-1.5"></span>
          <div className="flex flex-col w-full">
            <label className="text-sm text-[#898989] mb-1">Email Address</label>
            <input
              type="email"
              placeholder="Enter Email"
              className="text-[#1E1E1E] text-base font-medium focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>
      <button
        onClick={handleForgotPassword}
        className="bg-[#15BA5C] text-white font-bold text-xl py-3.5 rounded-[10px] hover:bg-[#13a551] w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Sending Code...
          </>
        ) : (
          "Send 4 Digit Code"
        )}
      </button>
    </form>
  );
}

function OtpInput({
  onNext,
  showToast,
}: {
  onNext: () => void;
  showToast: (type: ToastType, heading: string, description: string) => void;
}) {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const router = useRouter();

  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return; // only allow digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const user = getCookie<{ email: string }>(COOKIE_NAMES.RESET_USER_EMAIL);
  if (!user) {
    router.push("/reset-password?step=forgot");
  }

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (otp.some((digit) => digit === "")) {
      showToast("error", "Incomplete Code", "Please enter all 4 digits");
      setIsLoading(false);
      return;
    }

    const fullOtp = otp.join("");
    setCookie(
      COOKIE_NAMES.TOKEN_USER_EMAIL,
      { token: fullOtp },
      { expiresInMinutes: 30 }
    );
    setTimeout(() => {
      setIsLoading(false);
      onNext();
    }, 1500);
  };

  const handleResendOtpToEmail = async () => {
    setIsResending(true);
    try {
      if (!user?.email) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await authService.forgotPassword({
        email: user.email,
      });
      console.log(response);
      if (response.status) {
        setCookie(
          COOKIE_NAMES.RESET_USER_EMAIL,
          { email: user.email },
          { expiresInMinutes: 30 }
        );
        showToast(
          "success",
          "Code Resent!",
          "A new reset code has been sent to your email"
        );
      } else {
        showToast(
          "error",
          "Failed to Resend",
          "Could not resend the code. Please try again."
        );
      }
    } catch (error) {
      console.error("Error resending email", error);
      showToast(
        "error",
        "Something Went Wrong",
        "An error occurred while resending the code"
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col justify-between items-center w-1/2 h-[75vh]"
    >
      <div className="flex flex-col items-center justify-center w-full flex-grow gap-4">
        <div className="bg-[#15BA5C] px-5 py-3 rounded-xl">
          <MailOpen className="text-white" />
        </div>
        <h3 className="text-xl text-center text-[#1E1E1E] font-bold">
          Enter your Code
        </h3>
        <p className="text-sm text-[#1E1E1E] flex gap-1 text-center">
          We sent a code to <span className="font-bold">{user?.email}</span>
        </p>

        <div className="flex flex-col items-center justify-center gap-4 p-4">
          <div className="flex gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                ref={(el) => {
                  inputsRef.current[index] = el;
                }}
                className="w-[55px] h-14 text-center text-xl border rounded-lg focus:outline-none focus:border-[#15BA5C] border-gray-300 disabled:opacity-50"
                disabled={isLoading}
              />
            ))}
          </div>

          <p className="text-sm flex items-center text-gray-600">
            Didn&apos;t receive the email?
            <button
              type="button"
              className="text-black font-medium underline hover:text-green-600 ml-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              onClick={handleResendOtpToEmail}
              disabled={isResending}
            >
              {isResending ? (
                <>
                  <Loader2 className="animate-spin" size={12} />
                  Resending...
                </>
              ) : (
                "Click to resend"
              )}
            </button>
          </p>
        </div>
      </div>
      <button
        className="bg-[#15BA5C] text-white font-bold text-xl py-3.5 rounded-[10px] hover:bg-[#13a551] w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Verifying...
          </>
        ) : (
          "Continue"
        )}
      </button>
    </form>
  );
}

function CreateNewPassword({
  onNext,
  showToast,
}: {
  onNext: () => void;
  showToast: (type: ToastType, heading: string, description: string) => void;
}) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const strength = getStrength(newPassword);
  const { label } = getStrengthLabel(strength);

  const user = getCookie<{ email: string }>(COOKIE_NAMES.RESET_USER_EMAIL);
  const userToken = getCookie<{ token: string }>(COOKIE_NAMES.TOKEN_USER_EMAIL);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!userToken?.token || !user?.email) {
      showToast(
        "error",
        "Session Expired",
        "Please start the password reset process again"
      );
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast(
        "error",
        "Password Mismatch",
        "Passwords do not match. Please try again."
      );
      setIsLoading(false);
      return;
    }

    if (strength < 3) {
      showToast("error", "Weak Password", "Please choose a stronger password");
      setIsLoading(false);
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await authService.resetPassword({
        email: user.email,
        password: newPassword,
        token: userToken.token,
      });

      if (response.status) {
        removeCookie(COOKIE_NAMES.RESET_USER_EMAIL);
        removeCookie(COOKIE_NAMES.TOKEN_USER_EMAIL);
        onNext();
      } else {
        showToast(
          "error",
          "Reset Failed",
          response.message || "Failed to reset password. Please try again."
        );
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      showToast(
        "error",
        "Something Went Wrong",
        "An error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col justify-between items-center w-1/2 h-[75vh]"
    >
      <div className="flex flex-col items-center justify-center w-full flex-grow gap-4">
        <div className="bg-[#15BA5C] px-5 py-3 rounded-xl">
          <MailOpen className="text-white" />
        </div>
        <h3 className="text-xl text-center text-[#1E1E1E] font-bold">
          Set New Password
        </h3>
        <p className="text-[18px] text-[#1E1E1E] flex gap-1 text-center">
          Create a very strong Password you can remember
        </p>
        <div className="w-full flex flex-col gap-3.5">
          <div className="flex items-center border border-[#E6E6E6] rounded-xl p-4 w-full relative">
            <Image src={AssetsFiles.PasswordIcon} alt="Password Icon" />
            <span className="h-[30px] w-0.5 bg-[#E6E6E6] mx-1.5"></span>
            <div className="flex flex-col w-full relative">
              <label className="text-sm text-[#898989] mb-1">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder={
                  showPassword ? "Enter Password" : "***************"
                }
                className="text-[#1E1E1E] text-base font-medium focus:outline-none pr-8"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute right-2 top-4 text-[#1E1E1E] cursor-pointer disabled:opacity-50"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center border border-[#E6E6E6] rounded-xl p-4 w-full relative">
            <Image src={AssetsFiles.PasswordIcon} alt="Password Icon" />
            <span className="h-[30px] w-0.5 bg-[#E6E6E6] mx-1.5"></span>
            <div className="flex flex-col w-full relative">
              <label className="text-sm text-[#898989] mb-1">
                Confirm Password
              </label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder={
                  showConfirmPassword
                    ? "Enter Confirm Password"
                    : "***************"
                }
                className="text-[#1E1E1E] text-base font-medium focus:outline-none pr-8"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute right-2 top-4 text-[#1E1E1E] cursor-pointer disabled:opacity-50"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 p-4 w-full">
          {newPassword && <PasswordStrengthMeter password={newPassword} />}
          {newPassword && (
            <p className="text-sm text-gray-600 mt-1 text-left">{label}</p>
          )}
        </div>
      </div>
      <button
        className="bg-[#15BA5C] text-white font-bold text-xl py-3.5 rounded-[10px] hover:bg-[#13a551] w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Resetting Password...
          </>
        ) : (
          "Continue"
        )}
      </button>
    </form>
  );
}

function PasswordResetSuccessful() {
  return (
    <form className="flex flex-col justify-between items-center w-1/2 h-[75vh]">
      <div className="flex flex-col items-center justify-center w-full flex-grow gap-4">
        <div className="bg-[#15BA5C] px-5 py-3 rounded-xl">
          <BadgeCheck className="text-white" />
        </div>
        <h3 className="text-xl text-center text-[#1E1E1E] font-bold">
          All Done
        </h3>
        <p className="text-sm text-[#1E1E1E] flex gap-1 text-center">
          Your Password has been reset successfully
        </p>
      </div>

      <Link
        href="/auth?signin"
        className="bg-[#15BA5C] text-center text-white font-bold text-xl py-3.5 rounded-[10px] hover:bg-[#13a551] w-full"
      >
        Log in
      </Link>
    </form>
  );
}
