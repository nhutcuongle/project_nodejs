import { Inbox, MessageSquareText } from "lucide-react";

export default function MessengerHeader({ boxType, setBoxType }) {
  const isMain = boxType === "main";

  return (
    <div className="flex items-center justify-between pb-1">
      <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
        {isMain ? "Đoạn chat" : "Tin nhắn chờ"}
      </h2>
      
      <button
        onClick={() => setBoxType(isMain ? "requests" : "main")}
        className={`p-2 rounded-full transition-all ${
          isMain 
            ? "hover:bg-gray-100 text-gray-400 hover:text-blue-600" 
            : "bg-blue-50 text-blue-600 font-bold"
        }`}
        title={isMain ? "Xem tin nhắn chờ" : "Quay lại hộp thư"}
      >
        {isMain ? <MessageSquareText size={20} /> : <Inbox size={20} />}
      </button>
    </div>
  );
}
