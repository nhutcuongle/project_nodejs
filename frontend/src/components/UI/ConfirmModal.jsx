// components/ui/ConfirmModal.jsx
export default function ConfirmModal({ 
  open, 
  title = "Xác nhận", 
  message = "Bạn có chắc không?", 
  onCancel, 
  onConfirm, 
  confirmText = "Đồng ý", 
  cancelText = "Hủy" 
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 text-gray-100 rounded-lg shadow-lg w-80 p-5 flex flex-col gap-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p>{message}</p>
        <div className="flex justify-end gap-3 mt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 transition"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded bg-red-600 hover:bg-red-500 transition"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
