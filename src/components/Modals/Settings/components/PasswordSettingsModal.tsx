import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Eye, EyeOff } from "lucide-react";
import SettingFiles from "@/assets/icons/settings";
import settingsService from "@/services/settingsService";
import { COOKIE_NAMES, removeCookie } from "@/utils/cookiesUtils";
import { useRouter } from "next/navigation";

interface PasswordSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (heading: string, description: string) => void;
  onError: (heading: string, description: string) => void;
}
type PasswordSettingsRespone = {
  status: boolean;
  message: string;
  data?: null;
};

export const PasswordSettingsModal: React.FC<PasswordSettingsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onError
}) => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const router = useRouter();

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [requirements, setRequirements] = useState({
    minLength: false,
    hasNumber: false,
    hasSpecial: false,
  });

  const handlePasswordChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === "newPassword") {
      setRequirements({
        minLength: value.length >= 8,
        hasNumber: /\d/.test(value),
        hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(value),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = formData;
    if (newPassword !== confirmPassword) return;
    try {
      const result = (await settingsService.updatePasswordSettings({
        oldPassword: currentPassword,
        newPassword: newPassword,
      })) as PasswordSettingsRespone;
      if (result.status) {
        onSuccess(
          "Save Successful!",
          "Your Password has been saved successfully"
        );
        
        removeCookie(COOKIE_NAMES.BOUNTIP_LOGIN_USER);
        removeCookie(COOKIE_NAMES.BOUNTIP_LOGIN_USER_TOKENS);
        router.push("/auth?signin");
        return;
      }
          onError("Incorrect credentials", "Incorrect credentials - failed to update password");
    } catch (error: unknown) {
      onError("Failed to update password", "Failed to update password");
      console.error("Error updating password:", error);
      return;
    } finally {
      onClose();
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setRequirements({
        minLength: false,
        hasNumber: false,
        hasSpecial: false,
      });
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <Modal
      image={SettingFiles.PasswordSettingsIcon}
      isOpen={isOpen}
      onClose={onClose}
      title="Password Settings"
      subtitle="Create and change your password here"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <Input
            className="w-full px-4 text-[#1C1B20] py-3 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#15BA5C] transition-colors"
            label="Current Password"
            type={showPasswords.current ? "text" : "password"}
            value={formData.currentPassword}
            onChange={(e) =>
              handlePasswordChange("currentPassword", e.target.value)
            }
            placeholder="Enter current password"
          />
          <button
            type="button"
            className="absolute right-3 top-10 text-gray-400"
            onClick={() => togglePasswordVisibility("current")}
          >
            {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <div className="relative">
          <Input
            className="w-full text-[#1C1B20] px-4 py-3 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#15BA5C] transition-colors"
            label="New Password"
            type={showPasswords.new ? "text" : "password"}
            value={formData.newPassword}
            onChange={(e) =>
              handlePasswordChange("newPassword", e.target.value)
            }
            placeholder="Enter new password"
          />
          <button
            type="button"
            className="absolute right-3 top-10 text-gray-400"
            onClick={() => togglePasswordVisibility("new")}
          >
            {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Password Requirements:
          </h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  requirements.minLength ? "bg-green-500" : "bg-gray-300"
                }`}
              />
              <span className={`text-sm  text-[#1C1B20]`}>
                Password Must have 8-16 Characters long
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  requirements.hasNumber ? "bg-green-500" : "bg-gray-300"
                }`}
              />
              <span className={`text-sm text-[#1C1B20]`}>
                Password Must have at least one number{" "}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  requirements.hasSpecial ? "bg-green-500" : "bg-gray-300"
                }`}
              />
              <span className={`text-sm text-[#1C1B20]`}>
                Password Must have at least one special character eg: @,#,!,?
              </span>
            </div>
          </div>
        </div>

        <div className="relative">
          <Input
            className="w-full text-[#1C1B20] px-4 py-3 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#15BA5C] transition-colors"
            label="Confirm Password"
            type={showPasswords.confirm ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={(e) =>
              handlePasswordChange("confirmPassword", e.target.value)
            }
            placeholder="Confirm new password"
          />
          <button
            type="button"
            className="absolute right-3 top-10 text-gray-400"
            onClick={() => togglePasswordVisibility("confirm")}
          >
            {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <button className="w-full bg-[#15BA5C] text-white py-[9.8px] rounded-[9.8px] cursor-pointer  hover:bg-green-950 " type="button">
          Update Password
        </button>
      </form>
    </Modal>
  );
};
