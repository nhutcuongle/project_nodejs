import { useEffect, useRef } from "react";
import { MessageCircle } from "lucide-react";
import ChatBoxMessageItem from "./ChatBoxMessageItem";

export default function ChatBoxMessages({
  messages,
  other,
  currentUserId,
  selectedMsgId,
  setSelectedMsgId,
  openedMenuMsgId,
  setOpenedMenuMsgId,
  onMessageAction
}) {
  const containerRef = useRef();

  // Scroll xuống cuối khi messages thay đổi
  useEffect(() => {
    if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto px-6 py-6 space-y-3 bg-[#fdfdfd] custom-scrollbar"
    >
      {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-40">
             <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <MessageCircle size={40} className="text-gray-400" />
             </div>
             <p className="text-sm font-medium text-gray-500">Chưa có tin nhắn nào</p>
          </div>
      )}
      {messages.map((msg, idx) => {
        const nextMsg = messages[idx + 1];
        const currentSenderId = typeof msg.sender === "string" ? msg.sender : msg.sender?._id;
        const nextSenderId = typeof nextMsg?.sender === "string" ? nextMsg.sender : nextMsg?.sender?._id;
        const showAvatar = !nextMsg || currentSenderId !== nextSenderId;

        return (
          <ChatBoxMessageItem
            key={msg._id}
            message={msg}
            other={other}
            showAvatar={showAvatar && !msg.isRecalled}
            currentUserId={currentUserId}
            onAction={onMessageAction}
            selectedMsgId={selectedMsgId}
            setSelectedMsgId={setSelectedMsgId}
            openedMenuMsgId={openedMenuMsgId}
            setOpenedMenuMsgId={setOpenedMenuMsgId}
          />
        );
      })}
    </div>
  );
}
