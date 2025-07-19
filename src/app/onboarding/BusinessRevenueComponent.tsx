import { Upload, CheckCircle, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import uploadService from "@/services/uploadService"; // Adjust path as needed
import { COOKIE_NAMES } from "@/utils/cookiesUtils";
import Range from "rc-slider"; // Import the Range component
import "rc-slider/assets/index.css"; // Import default styles (we'll override with Tailwind)

interface BusinessRevenueComponentProps {
  onRevenueRangeChange?: (range: string) => void;
  onFileUpload?: (file: File) => void;
  onImageUpload?: (url: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectedCurrency?: any;
}

const MIN_REVENUE = 0;
const MAX_REVENUE = 1000000;
const STEP_REVENUE = 1000;

const BusinessRevenueComponent: React.FC<BusinessRevenueComponentProps> = ({
  onRevenueRangeChange,
  onFileUpload,
  onImageUpload,
  selectedCurrency,
}) => {
  const [revenueRange, setRevenueRange] = useState<[number, number]>([
    MIN_REVENUE,
    MAX_REVENUE,
  ]);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [uploadError, setUploadError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Function to get currency symbol
  const getCurrencySymbol = (currencyCode: string): string => {
    try {
      return (
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: currencyCode,
        })
          .formatToParts(0)
          .find((part) => part.type === "currency")?.value || currencyCode
      );
    } catch {
      return currencyCode;
    }
  };

  const formatCurrency = (value: number): string => {
    const currencyCode = selectedCurrency?.code || "USD";
    const symbol = getCurrencySymbol(currencyCode);

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(value)
      .replace(/[A-Z]{3}/, symbol);
  };

  const handleRevenueRangeChange = (values: number | number[]) => {
    // rc-slider returns number[] for Range, number for Slider.
    // We expect number[] here for the Range component.
    if (Array.isArray(values)) {
      setRevenueRange([values[0], values[1]]);
      const rangeString = `${values[0]}-${values[1]}`;
      onRevenueRangeChange?.(rangeString);
    }
  };

  const uploadImage = async (file: File) => {
    setIsUploading(true);
    setUploadError("");

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await uploadService.uploadImage(
        file,
        COOKIE_NAMES.BOUNTIP_REGISTERED_USERS
      );
      console.log(response);

      if (response.status) {
        setUploadedImageUrl(response.data.url);
        onImageUpload?.(response.data.url);
        console.log("Image uploaded successfully:", response.data.url);
      } else {
        throw new Error("No URL returned from upload service");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadError("Failed to upload image. Please try again.");
      setUploadedImageUrl("");
      setUploadedFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    setUploadError("");
    setUploadedImageUrl("");
    setUploadedFile(null);

    const allowedTypes = ["image/jpeg", "image/png", "image/svg+xml"];

    if (!allowedTypes.includes(file.type)) {
      setUploadError("Please select a valid file type (JPG, PNG, SVG)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File size must be less than 5MB");
      return;
    }

    setUploadedFile(file);
    onFileUpload?.(file);

    await uploadImage(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadClick = () => {
    if (!isUploading) {
      setUploadError("");
      fileInputRef.current?.click();
    }
  };

  const dismissError = () => {
    setUploadError("");
  };

  return (
    <div className="w-full bg-white">
      {/* Revenue Range Section */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Business Revenue Range
        </h3>

        <div className="flex justify-between items-center mb-4 text-emerald-600 font-semibold text-lg">
          <span>{formatCurrency(revenueRange[0])}</span>
          <span>{formatCurrency(revenueRange[1])}</span>
        </div>

        <div className="relative h-10 flex items-center px-2">
          <Range
            range={true} // Explicitly enable range mode for two handles
            min={MIN_REVENUE}
            max={MAX_REVENUE}
            step={STEP_REVENUE}
            value={revenueRange}
            onChange={handleRevenueRangeChange}
            trackStyle={[{ backgroundColor: "#10b981", height: "8px" }]} // Style the track (between handles)
            handleStyle={[
              {
                backgroundColor: "#10b981",
                borderColor: "#ffffff",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                width: "20px",
                height: "20px",
                marginTop: "-6px",
              },
              {
                backgroundColor: "#10b981",
                borderColor: "#ffffff",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                width: "20px",
                height: "20px",
                marginTop: "-6px",
              },
            ]} // Style both handles
            railStyle={{ backgroundColor: "#e5e7eb", height: "8px" }} // Style the rail (total track)
            className="w-full" // Apply basic width. rc-slider handles actual sizing.
          />
        </div>

        <div className="flex justify-between text-sm text-gray-500 mt-1">
          <span>{formatCurrency(MIN_REVENUE)}</span>
          <span>{formatCurrency(MAX_REVENUE)}+</span>
        </div>
      </div>

      {/* File Upload Section - Remains unchanged */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Upload your Business Logo
        </h3>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragOver
              ? "border-emerald-400 bg-emerald-50"
              : uploadError
              ? "border-red-300 hover:border-red-400 hover:bg-red-50"
              : "border-gray-300 hover:border-emerald-400 hover:bg-gray-50"
          } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleUploadClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.svg"
            onChange={handleFileInputChange}
            className="hidden"
            disabled={isUploading}
          />
          <div className="flex flex-col items-center">
            {isUploading ? (
              <>
                <Loader2 className="w-12 h-12 text-emerald-600 mb-4 animate-spin" />
                <p className="text-emerald-600 font-medium mb-1">
                  Uploading...
                </p>
                <p className="text-sm text-gray-600">
                  Please wait while we upload your file
                </p>
              </>
            ) : uploadedImageUrl ? (
              <>
                <CheckCircle className="w-12 h-12 text-emerald-600 mb-4" />
                <div className="text-center">
                  <p className="text-emerald-600 font-medium mb-1">
                    Image uploaded successfully!
                  </p>
                  <p className="text-sm text-gray-600">{uploadedFile?.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Click to upload a different image
                  </p>
                </div>
              </>
            ) : uploadError ? (
              <>
                <Upload className="w-12 h-12 text-red-400 mb-4" />
                <div className="text-center">
                  <p className="text-red-600 font-medium mb-1">Upload failed</p>
                  <p className="text-sm text-gray-600">Click to try again</p>
                </div>
              </>
            ) : (
              <>
                <Upload className="w-12 h-12 text-gray-400 mb-4" />
                <div className="text-center">
                  <p className="text-emerald-600 font-medium mb-1">
                    Click to upload or Drag your file here
                  </p>
                  <p className="text-sm text-gray-500">
                    Max file: 5mb, Png, jpg, svg
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Error Message */}
        {uploadError && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md relative">
            <div className="flex items-start justify-between">
              <p className="text-sm text-red-600 flex-1">{uploadError}</p>
              <button
                onClick={dismissError}
                className="ml-2 text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
                aria-label="Dismiss error"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessRevenueComponent;
