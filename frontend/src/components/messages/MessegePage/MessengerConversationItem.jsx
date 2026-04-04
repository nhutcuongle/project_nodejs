import ConversationItem from "../ConversationItem";

export default function MessengerConversationItem({
  conversation,
  selected,
  currentUserId,
  onSelect,
  onDelete,
}) {
  return (
    <ConversationItem
      conversation={conversation}
      selected={selected}
      currentUserId={currentUserId}
      onSelect={onSelect}
      onDelete={onDelete}
    />
  );
}
