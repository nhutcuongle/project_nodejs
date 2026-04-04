
import { useState } from "react";
import conversationService from "../../services/conversationService";
import ConfirmModal from "../UI/ConfirmModal";
import { MoreVertical, Trash2 } from "lucide-react";

export default function ConversationItem({
  conversation,
  onSelect,
  selected,
  currentUserId,
  onDelete, 
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const other =
    conversation.participants?.find(
      (p) => p?._id?.toString() !== currentUserId?.toString()
    ) || { username: "Người dùng", avatar: "https://www.gravatar.com/avatar?d=mp" };

  const lastMsg =
    conversation.lastMessage?.text ||
    (conversation.status === "pending" ? "Tin nhắn chờ" : "Bắt đầu trò chuyện");

  const unread =
    conversation.unreadCounts?.find(
      (u) => u?.user?.toString() === currentUserId?.toString()
    )?.count || 0;

  const handleDelete = async () => {
    if (!conversation._id) return;
    try {
      await conversationService.deleteConversationLocal(conversation._id);
      onDelete?.(conversation._id);
      setConfirmOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div
        onClick={onSelect}
        className={`group flex items-center gap-3 p-3 mx-2 rounded-2xl cursor-pointer transition-all duration-200 relative ${
          selected 
          ? "bg-blue-50/80 shadow-sm" 
          : "hover:bg-gray-50"
        }`}
      >
        <div className="relative flex-shrink-0">
          <img
            src={other.avatar || "https://www.gravatar.com/avatar?d=mp"}
            alt="avatar"
            className={`w-12 h-12 rounded-full object-cover border-2 ${selected ? "border-white ring-2 ring-blue-100" : "border-transparent"}`}
          />
          {unread > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-bounce-short">
              {unread > 9 ? "9+" : unread}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline mb-0.5">
            <h4 className={`text-sm tracking-tight truncate ${unread > 0 ? "font-black text-gray-900" : "font-bold text-gray-800"}`}>
              {other.username || "Người dùng"}
            </h4>
            {conversation.lastMessage?.createdAt && (
               <span className="text-[10px] text-gray-400 font-medium">
                  {new Date(conversation.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
               </span>
            )}
          </div>
          <p className={`text-xs truncate transition-colors ${unread > 0 ? "text-blue-600 font-bold" : "text-gray-500"}`}>
            {lastMsg}
          </p>
        </div>

        <div className="relative opacity-0 group-hover:opacity-100 transition-opacity ml-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-all"
          >
            <MoreVertical size={16} />
          </button>
          
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 p-1 animate-in fade-in slide-in-from-top-1">
              <button
                className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmOpen(true);
                  setMenuOpen(false);
                }}
              >
                <Trash2 size={14} />
                Xóa cuộc trò chuyện
              </button>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Xóa cuộc trò chuyện?"
        message="Hành động này sẽ xóa lịch sử tin nhắn của bạn. Bạn vẫn có thể nhận tin nhắn mới sau này."
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        confirmText="Xóa"
        cancelText="Hủy"
      />
    </>
  );
}
