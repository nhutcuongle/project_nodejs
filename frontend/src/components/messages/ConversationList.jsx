import ConversationItem from "./ConversationItem";

export default function ConversationList({
  friends,
  conversations,
  onFriendClick,
  onSelect,
  selectedId,
  currentUserId,
}) {
  return (
    <div className="overflow-y-auto h-[calc(100vh-60px)]">
      {/* Friends chưa chat */}
      {friends.map((f) => (
        <ConversationItem
          key={f._id}
          conversation={{
            _id: null,
            participants: [f],
            lastMessage: null,
            unreadCounts: [],
          }}
          onSelect={() => onFriendClick(f)}
          selected={false}
          currentUserId={currentUserId}
        />
      ))}

      {/* Conversation đã chat */}
      {conversations.map((c) => (
        <ConversationItem
          key={c._id}
          conversation={c}
          onSelect={() => setSelectedConversation(c)}
          selected={selectedConversation?._id === c._id}
          currentUserId={user._id}
          onDelete={(id, deleted) => {
            // xóa mềm → remove conversation khỏi state frontend
            setConversations((prev) => prev.filter((c) => c._id !== id));
            // nếu đang mở conversation đó → đóng ChatBox
            if (selectedConversation?._id === id) setSelectedConversation(null);
          }}
        />
      ))}

      {conversations.length === 0 && friends.length === 0 && (
        <div className="p-4 text-center text-gray-400">
          Không có hội thoại nào
        </div>
      )}
    </div>
  );
}
