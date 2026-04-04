import ChatBox from "../ChatBox/ChatBox";

export default function MessengerChatBox({
  conversation,
  currentUserId,
  onMessageSent,
}) {
  if (!conversation) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        Chọn một cuộc trò chuyện để bắt đầu
      </div>
    );
  }

  return (
    <ChatBox
      conversation={conversation}
      currentUserId={currentUserId}
      onMessageSent={onMessageSent}
    />
  );
}
