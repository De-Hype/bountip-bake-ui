import { useEffect, useState } from "react";

// Error Toast Component (you'll need to create this similar to SuccessToast)
export default function ErrorToast({
  heading = "Error!",
  description = "Something went wrong",
  isOpen,
  onClose,
  duration = 5000,
}: {
  heading?: string;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  duration?: number;
}) {
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
          bg-[#FFF9F9] border-l-[5px] border-red-500 rounded-md shadow-md px-4 py-3 min-w-[340px] max-w-md
          pointer-events-auto flex items-start justify-between transition-all transform duration-300 ease-out
          ${
            isAnimating
              ? "translate-x-0 opacity-100 scale-100"
              : "translate-x-full opacity-0 scale-95"
          }
        `}
      >
        <div className="flex items-start gap-3 flex-1">
          <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center mt-0.5 flex-shrink-0">
            <span className="text-white text-xs font-bold">!</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-red-600 mb-1">
              {heading}
            </h3>
            <p className="text-sm text-gray-600 leading-snug">{description}</p>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="text-gray-500 hover:text-gray-700 transition-colors ml-2"
        >
          <span className="text-lg">×</span>
        </button>
      </div>
    </div>
  );
}
