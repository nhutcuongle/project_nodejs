import ChatBoxHeader from "./ChatBoxHeader";
import ChatBoxMessages from "./ChatBoxMessages";
import ChatBoxInput from "./ChatBoxInput";
import ChatBoxStatus from "./ChatBoxStatus";
import { useChatBox } from "./hooks/useChatBox";

export default function ChatBox({
  conversation,
  currentUserId,
  onMessageSent,
}) {
  const {
    messages,
    text,
    setText,
    editingMessage,
    setEditingMessage,
    status,
    sending,
    selectedMsgId,
    setSelectedMsgId,
    openedMenuMsgId,
    setOpenedMenuMsgId,
    other,
    isRecipient,
    handleEditSubmit,
    handleMessageAction,
    sendMessage,
  } = useChatBox(conversation, onMessageSent);

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200">
      <ChatBoxHeader other={other} />
      
      <ChatBoxMessages
        messages={messages}
        other={other}
        currentUserId={currentUserId}
        selectedMsgId={selectedMsgId}
        setSelectedMsgId={setSelectedMsgId}
        openedMenuMsgId={openedMenuMsgId}
        setOpenedMenuMsgId={setOpenedMenuMsgId}
        onMessageAction={handleMessageAction}
      />
      
      <ChatBoxStatus status={status} isRecipient={isRecipient} />
      
      {(status === "active" || (status === "pending" && !isRecipient)) && (
        <ChatBoxInput
          text={text}
          setText={setText}
          sending={sending}
          editingMessage={editingMessage}
          cancelEdit={() => {
            setEditingMessage(null);
            setText("");
          }}
          onSend={() =>
            editingMessage ? handleEditSubmit() : sendMessage(text)
          }
        />
      )}
    </div>
  );
}
