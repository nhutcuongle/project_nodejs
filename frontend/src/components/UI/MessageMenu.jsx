export default function MessageMenu({
  isMine,
  isRecalled,
  onUnsend,
  onEdit,
  onRemoveForMe,
  onReport,
  placement = "down",
  alignRight = false,
}) {
  return (
    <div
      className={`absolute w-44 bg-white shadow-xl border rounded-xl py-1 z-[9999]`}
      style={{
        top: placement === "down" ? "100%" : "auto",
        bottom: placement === "up" ? "100%" : "auto",
        right: alignRight ? 0 : "auto",
        left: alignRight ? "auto" : 0,
        marginTop: placement === "down" ? "0.5rem" : 0,
        marginBottom: placement === "up" ? "0.5rem" : 0,
      }}
    >
      {/* Menu items */}
      {!isRecalled && isMine && (
        <>
          <div
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
            onClick={onUnsend}
          >
            Thu hồi
          </div>
          <div
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
            onClick={onEdit}
          >
            Chỉnh sửa
          </div>
        </>
      )}
      {isRecalled && isMine && (
        <div
          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
          onClick={onRemoveForMe}
        >
          Gỡ
        </div>
      )}
      {!isMine && (
        <div
          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
          onClick={onRemoveForMe}
        >
          Gỡ tin nhắn khỏi phía bạn
        </div>
      )}
      <div
        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
        onClick={onReport}
      >
        Báo cáo
      </div>
    </div>
  );
}
