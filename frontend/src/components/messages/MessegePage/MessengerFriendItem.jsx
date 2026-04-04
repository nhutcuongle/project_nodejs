import ConversationItem from "../ConversationItem";

export default function MessengerFriendItem({ friend, currentUser, onSelect }) {
  return (
    <ConversationItem
      conversation={{
        _id: "temp-" + friend._id,
        participants: [currentUser, friend],
        lastMessage: null,
        unreadCounts: [],
      }}
      onSelect={() => onSelect(friend)}
      selected={false}
      currentUserId={currentUser._id}
    />
  );
}
