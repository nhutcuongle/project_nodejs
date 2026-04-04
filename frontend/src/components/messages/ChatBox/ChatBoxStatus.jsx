export default function ChatBoxStatus({ status, isRecipient, other, onAccept, onReject }) {
  if (status === "rejected") {
    return <div className="p-3 text-center text-gray-400 border-t">Bạn đã từ chối tin nhắn này.</div>;
  }
  if (status === "pending" && isRecipient) {
    return (
      <div className="p-4 border-t text-center">
        <p className="mb-3 text-gray-600">{other?.username} muốn nhắn tin với bạn</p>
        <div className="flex justify-center gap-3">
          <button onClick={onAccept} className="px-4 py-2 bg-blue-500 text-white rounded-lg">
            Chấp nhận
          </button>
          <button onClick={onReject} className="px-4 py-2 bg-gray-300 rounded-lg">
            Từ chối
          </button>
        </div>
      </div>
    );
  }
  return null;
}
