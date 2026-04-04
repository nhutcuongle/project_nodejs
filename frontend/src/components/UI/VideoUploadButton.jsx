import React from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function VideoUploadButton({ children, className }) {
  const navigate = useNavigate();

  return (
    <label
      className={`cursor-pointer flex items-center justify-center transition ${className || "p-1.5 rounded-full hover:bg-gray-100"}`}
      title="Tải video lên"
    >
      {children || <Plus className="w-4 h-4" />}
      <input
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          const files = e.target.files;
          if (files?.length > 0) {
            navigate("/upload-detail", { state: { files: Array.from(files) } });
          }
        }}
      />
    </label>
  );
}
