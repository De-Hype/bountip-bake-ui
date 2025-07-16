import { BadgeCheck, X } from "lucide-react";
import { useEffect, useState } from "react";

type SuccessToastProps = {
  heading?: string;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  duration?: number;
};

const SuccessToast = ({
  heading = "Save Successful!",
  description = "Your Price Tier has been Saved successfully",
  isOpen,
  onClose,
  duration = 5000,
}: SuccessToastProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 10);

      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, duration]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-7 right-4 z-50 pointer-events-none">
      <div
        className={`
          bg-[#F9FFFD] border-l-[5px] border-[#15BA5C] rounded-md shadow-md px-4 py-3 min-w-[340px] max-w-md
          pointer-events-auto flex items-start justify-between transition-all transform duration-300 ease-out
          ${
            isAnimating
              ? "translate-x-0 opacity-100 scale-100"
              : "translate-x-full opacity-0 scale-95"
          }
        `}
      >
        <div className="flex items-start gap-3 flex-1">
          <BadgeCheck className="text-[#15BA5C] mt-0.5 w-5 h-5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-[#15BA5C] mb-1">
              {heading}
            </h3>
            <p className="text-sm text-gray-600 leading-snug">{description}</p>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="text-gray-500 hover:text-gray-700 transition-colors ml-2"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default SuccessToast;
