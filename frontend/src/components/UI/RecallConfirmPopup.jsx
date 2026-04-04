export default function RecallConfirmPopup({
  open,
  onCancel,
  onSubmit,
  recallForAll,
  setRecallForAll,
  deleteForMe,
  setDeleteForMe,
}) {
  if (!open) return null;

  const handleRecallChange = () => {
    setRecallForAll(true);
    setDeleteForMe(false);
  };

  const handleDeleteChange = () => {
    setRecallForAll(false);
    setDeleteForMe(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-96 p-6 flex flex-col gap-5 max-h-[80vh] overflow-y-auto">
        <p className="font-semibold text-center text-lg mb-2">
          THU HỒI TIN NHẮN
        </p>

        {/* Thu hồi với mọi người */}
        <label className="flex flex-col text-sm">
          <div className="flex items-center gap-2 mb-1">
            <input
              type="checkbox"
              checked={recallForAll}
              onChange={handleRecallChange}
            />
            Thu hồi với tất cả mọi người
          </div>
          <span className="text-gray-500 ml-6 text-xs">
            Tin nhắn này sẽ được thu hồi với tất cả mọi người trong đoạn chat.
          </span>
        </label>

        {/* Xóa về phía tôi */}
        <label className="flex flex-col text-sm">
          <div className="flex items-center gap-2 mb-1">
            <input
              type="checkbox"
              checked={deleteForMe}
              onChange={handleDeleteChange}
            />
            Xóa về phía tôi
          </div>
          <span className="text-gray-500 ml-6 text-xs">
            Tin nhắn này sẽ bị gỡ khỏi thiết bị của bạn, nhưng vẫn hiển thị với
            các thành viên khác trong đoạn chat.
          </span>
        </label>

        {/* Nút HỦY và GỠ/XÓA */}
        <div className="flex justify-between gap-2 mt-3">
          <button
            className="flex-1 border border-gray-300 px-3 py-2 rounded-md hover:bg-gray-100 transition"
            onClick={onCancel}
          >
            HỦY
          </button>
          <button
            className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 transition"
            onClick={() => onSubmit({ recallForAll, deleteForMe })}
          >
            GỠ/XÓA
          </button>
        </div>
      </div>
    </div>
  );
}
