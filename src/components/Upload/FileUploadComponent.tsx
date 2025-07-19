import React, { useState, useRef } from "react";
import { CloudUpload } from "lucide-react";
import { COOKIE_NAMES } from "@/utils/cookiesUtils";
import uploadService from "@/services/uploadService";

interface FileUploadComponentProps {
  setImageUrl: (url: string) => void;
}

const FileUploadComponent: React.FC<FileUploadComponentProps> = ({
  setImageUrl,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find((file) => file.type.startsWith("image/"));

    if (imageFile) {
      handleFileUpload(imageFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      console.log("Uploading file:", file);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await uploadService.uploadImage(
        file,
        COOKIE_NAMES.BOUNTIP_LOGIN_USER_TOKENS
      );
      console.log(response);
      if (response?.status && response?.data?.url) {
        setImageUrl(response.data.url);
        console.log("Image uploaded successfully:", response.data.url);
      } else {
        throw new Error("Invalid upload response: no URL returned");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setImageUrl(""); // Clear image URL on failure
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="w-full my-2.5">
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200 ease-in-out
          ${
            isDragOver
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          }
          ${isUploading ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        <div className="flex flex-col items-center space-y-2">
          <CloudUpload
            className={`w-8 h-8 ${
              isDragOver ? "text-blue-500" : "text-gray-400"
            }`}
          />

          {isUploading ? (
            <div className="text-sm text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mx-auto mb-2"></div>
              Uploading...
            </div>
          ) : (
            <>
              <div className="text-sm font-medium text-gray-700">
                Drag and drop or click here to upload
              </div>
              <div className="text-xs text-gray-500">
                PNG, JPG, GIF up to 10MB
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploadComponent;
