"use client";
import {
  BriefcaseBusiness,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import AssetsFiles from "@/assets";
import { useAuthStore } from "@/stores/useAuthStore";
import PinInput from "../Inputs/PinInput";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { COOKIE_NAMES, setCookie } from "@/utils/cookiesUtils";
import authService from "@/services/authServices";
import { UserType } from "@/types/userTypes";
import GoogleSignIn from "../GoogleSignIn";

type Props = {
  mode: "signin" | "signup";
};

const signupSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{6,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
});

const signinSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{6,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
});

// PIN login schema - no validation needed since PIN component handles it
const pinLoginSchema = z.object({});

type SignupFormValues = z.infer<typeof signupSchema>;
type SigninFormValues = z.infer<typeof signinSchema>;
type PinLoginFormValues = z.infer<typeof pinLoginSchema>;
type FormValues = SignupFormValues | SigninFormValues | PinLoginFormValues;

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

type AuthBase = {
  message?: string;
};

export type AuthResponse =
  | ({
      status: true;
      error?: false;
      data: {
        user: UserType;
        tokens: AuthTokens;
      };
    } & AuthBase)
  | ({
      status: false;
      error: boolean;
    } & AuthBase);

// Account lockout constants
const MAX_LOGIN_ATTEMPTS = 3;
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Helper functions for account lockout
const getFailedAttempts = (email?: string): number => {
  if (!email) return 0;
  const attempts = localStorage.getItem(`failed_attempts_${email}`);
  return attempts ? parseInt(attempts, 10) : 0;
};

const setFailedAttempts = (email: string, attempts: number): void => {
  localStorage.setItem(`failed_attempts_${email}`, attempts.toString());
};

const getLockoutTime = (email?: string): number => {
  if (!email) return 0;
  const lockoutTime = localStorage.getItem(`lockout_time_${email}`);
  return lockoutTime ? parseInt(lockoutTime, 10) : 0;
};

const setLockoutTime = (email: string, time: number): void => {
  localStorage.setItem(`lockout_time_${email}`, time.toString());
};

const clearLoginAttempts = (email: string): void => {
  localStorage.removeItem(`failed_attempts_${email}`);
  localStorage.removeItem(`lockout_time_${email}`);
};

const isAccountLocked = (email?: string): boolean => {
  if (!email) return false;
  const lockoutTime = getLockoutTime(email);
  if (!lockoutTime) return false;

  const now = Date.now();
  if (now > lockoutTime) {
    // Lockout period has expired, clear the lockout
    clearLoginAttempts(email);
    return false;
  }

  return true;
};

const getRemainingLockoutTime = (email?: string): number => {
  if (!email) return 0;
  const lockoutTime = getLockoutTime(email);
  if (!lockoutTime) return 0;

  const remaining = lockoutTime - Date.now();
  return Math.max(0, Math.ceil(remaining / 1000)); // Return seconds
};

const AuthForm = ({ mode }: Props) => {
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { pinLogin, setPinLogin, pin } = useAuthStore();
  const router = useRouter();
  const [isChecked, setIsChecked] = useState(false);
  const [currentEmail, setCurrentEmail] = useState<string>("");
  const [lockoutTimer, setLockoutTimer] = useState<number>(0);

  // Dynamic schema based on login mode
  const getSchema = () => {
    if (mode === "signup") return signupSchema;
    if (pinLogin) return pinLoginSchema;
    return signinSchema;
  };

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(getSchema()),
  });

  const strength = getStrength(password);
  const { label } = getStrengthLabel(strength);

  // Watch email field to track current email for lockout
  const emailValue = watch("email" as keyof FormValues);

  useEffect(() => {
    if (emailValue && typeof emailValue === "string") {
      setCurrentEmail(emailValue);
    }
  }, [emailValue]);

  // Timer for lockout countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (lockoutTimer > 0) {
      interval = setInterval(() => {
        setLockoutTimer((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [lockoutTimer]);

  // Check lockout status on component mount and email change
  useEffect(() => {
    if (currentEmail && isAccountLocked(currentEmail)) {
      const remainingTime = getRemainingLockoutTime(currentEmail);
      setLockoutTimer(remainingTime);
    }
  }, [currentEmail]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = e.target.checked;
    setIsChecked(newChecked);
  };

  const handleLoginFailure = (email: string) => {
    const currentAttempts = getFailedAttempts(email);
    const newAttempts = currentAttempts + 1;

    if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
      // Lock the account
      const lockoutTime = Date.now() + LOCKOUT_DURATION;
      setLockoutTime(email, lockoutTime);
      setFailedAttempts(email, newAttempts);

      const remainingTime = getRemainingLockoutTime(email);
      setLockoutTimer(remainingTime);

      toast.error(
        `Account temporarily locked due to multiple failed attempts. Please try again in ${Math.ceil(
          remainingTime / 60
        )} minutes.`,
        {
          duration: 6000,
          position: "bottom-right",
        }
      );
    } else {
      setFailedAttempts(email, newAttempts);
      const remainingAttempts = MAX_LOGIN_ATTEMPTS - newAttempts;
      toast.error(
        `Invalid credentials. ${remainingAttempts} attempt(s) remaining before account lockout.`,
        {
          duration: 4000,
          position: "bottom-right",
        }
      );
    }
  };

  const handleLoginSuccess = (email: string) => {
    // Clear failed attempts on successful login
    clearLoginAttempts(email);
    setLockoutTimer(0);
  };

  const handleSignup = async (data: SignupFormValues) => {
    const response = (await authService.signup(data)) as AuthResponse;

    if (response.error) {
      toast.error(response.message || "Wrong credentials", {
        duration: 4000,
        position: "bottom-right",
      });
      return response;
    }

    if (response.status) {
      toast.success("User registered successfully", {
        duration: 4000,
        position: "bottom-right",
      });
      setCookie(
        COOKIE_NAMES.REG_USER_EMAIL,
        { email: data.email, name: data.fullName },
        { expiresInMinutes: 30 }
      );
      router.push(`/verify`);
    }
  };

  const handleSignin = async (data: SigninFormValues) => {
    // Check if account is locked
    if (isAccountLocked(data.email)) {
      const remainingTime = getRemainingLockoutTime(data.email);
      toast.error(
        `Account is temporarily locked. Please try again in ${Math.ceil(
          remainingTime / 60
        )} minutes.`,
        {
          duration: 4000,
          position: "bottom-right",
        }
      );
      return;
    }

    const response = (await authService.signin({
      email: data.email,
      password: data.password,
    })) as AuthResponse;

    if (response.error) {
      handleLoginFailure(data.email);
      return response;
    }

    if (response.status) {
      handleLoginSuccess(data.email);

      const userData: Partial<UserType> = {
        id: response.data.user.id,
        fullName: response.data.user.fullName,
        email: response.data.user.email,
        status: response.data.user.status,
        lastLoginAt: response.data.user.lastLoginAt,
        createdAt: response.data.user.createdAt,
        isPin: response.data.user.isPin,
      };


      if (userData.isPin) {
        setCookie(COOKIE_NAMES.BOUNTIP_LOGIN_USER, userData);
        setCookie(COOKIE_NAMES.BOUNTIP_LOGIN_USER_TOKENS, {
          accessToken: response.data.tokens.accessToken,
          refreshToken: response.data.tokens.refreshToken,
        });
        toast.success("Sign in successful", {
          duration: 4000,
          position: "bottom-right",
        });
        router.push("/dashboard");
      } else {
        setCookie(
          COOKIE_NAMES.BOUNTIP_REGISTERED_USERS,
          {
            accessToken: response.data.tokens.accessToken,
            refreshToken: response.data.tokens.refreshToken,
          },
          { expiresInMinutes: 10080 }
        );
        router.push("/onboarding");
      }
    }
  };

  const handlePinLogin = async (pinValue: string) => {

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await authService.signInViaPin({ pin: pinValue });

      if (response.error) {
        // For PIN login, we'll use a generic identifier since we don't have email
        const pinIdentifier = "pin_login";
        handleLoginFailure(pinIdentifier);
        return response;
      }

      if (response.status) {
        // Clear any existing PIN login attempts
        clearLoginAttempts("pin_login");

        toast.success("PIN login successful", {
          duration: 4000,
          position: "bottom-right",
        });

        if (response.data?.tokens) {
          setCookie(COOKIE_NAMES.BOUNTIP_LOGIN_USER_TOKENS, {
            accessToken: response.data.tokens.accessToken,
            refreshToken: response.data.tokens.refreshToken,
          });
        }

        // Navigate to appropriate page
        router.push("/dashboard");
      }

      return response;
    } catch (error) {
      console.error("PIN login error:", error);
      handleLoginFailure("pin_login");
    }
  };


  // Separate handler for PIN login button click
  const handlePinLoginClick = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault(); // Prevent form submission


    // Check if PIN login is locked
    if (isAccountLocked("pin_login")) {
      const remainingTime = getRemainingLockoutTime("pin_login");
      toast.error(
        `PIN login is temporarily locked. Please try again in ${Math.ceil(
          remainingTime / 60
        )} minutes.`,
        {
          duration: 4000,
          position: "bottom-right",
        }
      );
      return;
    }

    // Validate PIN before submission
    if (!pin || pin.length < 4) {
      toast.error("Please enter a valid 4-digit PIN", {
        duration: 4000,
        position: "bottom-right",
      });
      return;
    }

    setIsLoading(true);

    try {
      await handlePinLogin(pin);
    } catch (err) {
      console.error("PIN login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (mode === "signin" && pinLogin) {
      return; 
    }

    setIsLoading(true);

    try {
      if (mode === "signup") {
        await handleSignup(data as SignupFormValues);
        return;
      }

      await handleSignin(data as SigninFormValues);
      reset();
    } catch (err) {
      console.error("Authentication error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const hasSignupErrors = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    errors: any
  ): errors is Partial<Record<keyof SignupFormValues, { message: string }>> =>
    mode === "signup";

  // Check if submit button should be disabled
  const isSubmitDisabled = () => {
    if (isLoading) return true;

    if (mode === "signin" && pinLogin) {
      return isAccountLocked("pin_login") || !pin || pin.length < 4;
    }

    if (mode === "signin" && currentEmail) {
      return isAccountLocked(currentEmail);
    }

    return false;
  };

  const getSubmitButtonText = () => {
    if (isLoading) return "Loading...";

    if (mode === "signin" && pinLogin) {
      if (isAccountLocked("pin_login")) {
        return `Locked (${Math.ceil(lockoutTimer / 60)}:${String(
          lockoutTimer % 60
        ).padStart(2, "0")})`;
      }
      return "Sign In with PIN";
    }

    if (mode === "signin" && currentEmail && isAccountLocked(currentEmail)) {
      return `Locked (${Math.ceil(lockoutTimer / 60)}:${String(
        lockoutTimer % 60
      ).padStart(2, "0")})`;
    }

    return mode === "signin" ? "Sign In" : "Sign Up";
  };

  return (
    <AnimatePresence mode="wait">
      <motion.form
        onSubmit={handleSubmit(onSubmit)}
        key={`${mode}-${pinLogin}`} // Include pinLogin in key to force re-render
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="w-full flex flex-col gap-[24px]"
      >
        {/* Business Name - Show for signup only */}
        {mode === "signup" && (
          <div
            className={`flex items-center border rounded-xl p-4 w-full ${
              (errors as Partial<Record<keyof SignupFormValues, string>>)
                .businessName
                ? "border-red-400"
                : "border-[#E6E6E6]"
            }`}
          >
            <BriefcaseBusiness className="text-[#1E1E1E]" />
            <span className="h-[30px] w-0.5 bg-[#E6E6E6] mx-1.5"></span>
            <div className="flex flex-col w-full">
              <label className="text-sm text-[#898989] mb-1">
                Business Name
              </label>
              <input
                type="text"
                placeholder="Enter Business Name"
                className="text-[#1E1E1E] text-base font-medium focus:outline-none"
                {...register("businessName")}
              />
            </div>
          </div>
        )}

        {/* Full Name - Only for signup */}
        {mode === "signup" && (
          <div
            className={`flex items-center border ${
              hasSignupErrors(errors) && errors.fullName
                ? "border-red-400"
                : "border-[#E6E6E6]"
            } rounded-xl p-4 w-full`}
          >
            <User className="text-[#1E1E1E]" />
            <span className="h-[30px] w-0.5 bg-[#E6E6E6] mx-1.5"></span>
            <div className="flex flex-col w-full">
              <label className="text-sm text-[#898989] mb-1">
                Representative Fullname
              </label>
              <input
                type="text"
                placeholder="Enter Full Name"
                className="text-[#1E1E1E] text-base font-medium focus:outline-none"
                {...register("fullName" as keyof FormValues)}
              />
            </div>
          </div>
        )}

        {/* Email - Show if not in PIN login */}
        {(mode === "signup" || (mode === "signin" && !pinLogin)) && (
          <div
            className={`flex items-center border ${
              (mode === "signup"
                ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (errors as Partial<Record<keyof SignupFormValues, any>>)
                : // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (errors as Partial<Record<keyof SigninFormValues, any>>)
              ).email
                ? "border-red-400"
                : "border-[#E6E6E6]"
            } rounded-xl p-4 w-full`}
          >
            <Mail className="text-[#1E1E1E]" />
            <span className="h-[30px] w-0.5 bg-[#E6E6E6] mx-1.5"></span>
            <div className="flex flex-col w-full">
              <label className="text-sm text-[#898989] mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter Email"
                className="text-[#1E1E1E] text-base font-medium focus:outline-none"
                {...register("email" as keyof FormValues)}
              />
            </div>
          </div>
        )}

        {/* Password - Hide in PIN login */}
        {!pinLogin && (
          <div
            className={`flex items-center border ${
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (errors as Partial<Record<keyof SigninFormValues, any>>).password
                ? "border-red-400"
                : "border-[#E6E6E6]"
            } rounded-xl p-4 w-full relative`}
          >
            <Image src={AssetsFiles.PasswordIcon} alt="Password Icon" />
            <span className="h-[30px] w-0.5 bg-[#E6E6E6] mx-1.5"></span>
            <div className="flex flex-col w-full relative">
              <label className="text-sm text-[#898989] mb-1">
                {mode === "signin" ? "Password" : "Create Password"}
              </label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder={
                  showPassword ? "Enter Password" : "***************"
                }
                className="text-[#1E1E1E] text-base font-medium focus:outline-none pr-8"
                {...register("password")}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-2 top-4 text-[#1E1E1E] cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        )}

        {/* Password strength indicators */}
        {mode === "signup" && password && (
          <PasswordStrengthMeter password={password} />
        )}
        {!pinLogin && password && (
          <p className="text-sm text-gray-600 mt-1">{label}</p>
        )}

        {/* PIN login input */}
        {mode === "signin" && pinLogin && <PinInput />}

        {/* Lockout warning message */}
        {lockoutTimer > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm text-center">
              Account temporarily locked due to multiple failed attempts. Please
              try again in {Math.ceil(lockoutTimer / 60)} minutes and{" "}
              {lockoutTimer % 60} seconds.
            </p>
          </div>
        )}

        {/* Submit Button */}
        {mode === "signin" && pinLogin ? (
          // Special button for PIN login that doesn't submit the form
          <button
            type="button"
            className={`text-white font-bold text-xl py-3.5 rounded-[10px] transition-colors ${
              isSubmitDisabled()
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#15BA5C] hover:bg-[#13a551]"
            }`}
            onClick={handlePinLoginClick}
            disabled={isSubmitDisabled()}
          >
            {getSubmitButtonText()}
          </button>
        ) : (
          // Regular submit button for other modes
          <button
            className={`text-white font-bold text-xl py-3.5 rounded-[10px] transition-colors ${
              isSubmitDisabled()
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#15BA5C] hover:bg-[#13a551]"
            }`}
            type="submit"
            disabled={isSubmitDisabled()}
          >
            {getSubmitButtonText()}
          </button>
        )}

        {/* Agreement - Only for signup */}
        {mode === "signup" && (
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              required
              className="mt-1 h-4 w-4 accent-[#15BA5C]"
            />
            <label className="text-sm text-gray-600">
              By checking this box, you agree to our{" "}
              <Link href="/privacy-policy" className="text-[#15BA5C] underline">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link
                href="/terms-and-conditions"
                className="text-[#15BA5C] underline"
              >
                Terms & Conditions
              </Link>
              .
            </label>
          </div>
        )}

        {/* Remember Me and Forgot Password - Only for regular signin */}
        {mode === "signin" && !pinLogin && (
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <input
                  type="checkbox"
                  id="remember-me"
                  checked={isChecked}
                  onChange={handleChange}
                  className="sr-only"
                />
                <label
                  htmlFor="remember-me"
                  className="flex items-center cursor-pointer"
                >
                  <div
                    className={`w-4 h-4 border-2 rounded-sm flex items-center justify-center transition-all duration-200 ${
                      isChecked
                        ? "bg-green-500 border-green-500"
                        : "bg-white border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {isChecked && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="ml-2 text-sm text-gray-700 select-none">
                    Remember Me
                  </span>
                </label>
              </div>
            </div>

            <Link
              href="/reset-password"
              className="text-sm text-[#15BA5C] hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
        )}

        {/* Divider and alternative login options */}
        {!pinLogin && (
          <div className="flex items-center w-full my-4">
            <hr className="flex-grow border-t border-gray-300" />
            <span className="mx-4 text-sm text-gray-500">Or Continue With</span>
            <hr className="flex-grow border-t border-gray-300" />
          </div>
        )}

        {/* Toggle PIN login button - Only for signin */}
        {mode === "signin" && (
          <button
            type="button"
            onClick={() => setPinLogin(!pinLogin)}
            className="flex items-center justify-center gap-2 border py-3.5 rounded-[10px] border-[#E6E6E6] hover:bg-gray-50 transition-colors"
          >
            <LockKeyhole />
            <span className="text-[#1E1E1E] text-[17px] font-normal">
              {pinLogin ? "Login with Email" : "Login with PIN"}
            </span>
          </button>
        )}

        {/* Google OAuth button - Hide during PIN login */}
        {!pinLogin && (
          // <button
          //   type="button"
          //   className="flex items-center justify-center gap-2 border py-3.5 rounded-[10px] border-[#E6E6E6] hover:bg-gray-50 transition-colors"
          //   onClick={handleGoogleOauth}
          // >
          //   <Image src={AssetsFiles.GoogleIcon} alt="Google Icon" />
          //   <span className="text-[#1E1E1E] text-[17px] font-normal">
          //     {mode === "signup"
          //       ? "Sign Up With Google"
          //       : "Login With Google"}
          //   </span>
          // </button>
          <GoogleSignIn mode={mode} />
        )}

        {/* Sign up/Sign in toggle */}
        {mode === "signup" ? (
          <div className="">
            <p className="text-sm text-gray-500 text-center">
              Already have an account?{" "}
              <Link
                href="/auth?signin"
                className="text-[#15BA5C] font-semibold hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        ) : (
          <div className="">
            <p className="text-sm text-gray-500 text-center">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth?signup"
                className="text-[#15BA5C] font-semibold hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        )}
      </motion.form>
    </AnimatePresence>
  );
};

export default AuthForm;

// Password strength helpers
export const getStrength = (password: string): number => {
  let strength = 0;
  if (password.length >= 1) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  return strength;
};

interface StrengthLabel {
  label: string;
  color: string;
}

export const getStrengthLabel = (strength: number): StrengthLabel => {
  switch (strength) {
    case 0:
    case 1:
    case 2:
      return { label: "Weak Password!", color: "bg-red-500" };
    case 3:
      return { label: "Average Password", color: "bg-yellow-400" };
    case 4:
    case 5:
      return { label: "Strong Password", color: "bg-green-500" };
    default:
      return { label: "", color: "" };
  }
};

interface PasswordStrengthMeterProps {
  password: string;
}

export const PasswordStrengthMeter = ({
  password,
}: PasswordStrengthMeterProps) => {
  const strength = getStrength(password);
  const { color } = getStrengthLabel(strength);

  return (
    <div className="w-full flex space-x-1 h-2">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={`flex-1 rounded transition-all duration-300 ${
            i < strength ? color : "bg-[#E6E6E6]"
          }`}
        />
      ))}
    </div>
  );
};
