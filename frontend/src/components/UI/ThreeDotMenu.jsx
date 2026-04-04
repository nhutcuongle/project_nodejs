import { useState } from "react";
import { MoreHorizontal, Trash2, Edit2 } from "lucide-react";
import toast from "react-hot-toast";

export default function ThreeDotMenu({ 
  onDelete, 
  onEdit, // ✅ thêm prop sửa
  onReport, 
  showReport = true 
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {/* Nút 3 chấm */}
      <button
        className="p-1 hover:bg-gray-700 rounded-full transition"
        onClick={() => setOpen(prev => !prev)}
      >
        <MoreHorizontal size={16} />
      </button>

      {/* Menu dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 bg-gray-800 border border-gray-700 rounded shadow-lg z-50 w-44">
          {/* Sửa */}
          {onEdit && (
            <button
              className="flex items-center gap-3 px-4 py-3 text-base hover:bg-gray-700 w-full text-left rounded transition"
              onClick={() => {
                setOpen(false);
                onEdit();
              }}
            >
              <Edit2 size={20} />
              Sửa
            </button>
          )}

          {/* Xóa */}
          {onDelete && (
            <button
              className="flex items-center gap-3 px-4 py-3 text-base hover:bg-red-600 w-full text-left rounded transition"
              onClick={() => {
                setOpen(false);
                onDelete();
              }}
            >
              <Trash2 size={20} />
              Xóa
            </button>
          )}

          {/* Báo cáo */}
          {showReport && (
            <button
              className="flex items-center gap-3 px-4 py-3 text-base hover:bg-gray-700 w-full text-left rounded transition"
              onClick={() => {
                setOpen(false);
                if (onReport) onReport();
                else toast("Chức năng báo cáo sẽ thêm sau");
              }}
            >
              <MoreHorizontal size={20} />
              Báo cáo
            </button>
          )}
        </div>
      )}
    </div>
  );
}
