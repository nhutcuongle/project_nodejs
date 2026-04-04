// import { useState, useContext, useEffect, useRef } from "react";
// import { SocketContext } from "../../../context/SocketContext";
// import { useAuth } from "../../../context/AuthContext";
// import ChatBoxHeader from "./ChatBoxHeader";
// import ChatBoxMessages from "./ChatBoxMessages";
// import ChatBoxStatus from "./ChatBoxStatus";
// import ChatBoxInput from "./ChatBoxInput";
// import PinnedMessagesPanel from "../../../components/UI/PinnedMessagesPanel";
// import PinnedMessagesModal from "../../../components/UI/PinnedMessagesModal";

// import messageService from "../../../services/messageService";
// import conversationService from "../../../services/conversationService";
// import { computeTimestamps } from "../../../utils/timeUtils";

// export default function ChatBox({ conversation, currentUserId, onMessageSent }) {
//   const { user } = useAuth();
//   const { socket } = useContext(SocketContext);

//   const [messages, setMessages] = useState([]);
//   const [pinnedMessages, setPinnedMessages] = useState([]);
//   const [text, setText] = useState("");
//   const [editingMessage, setEditingMessage] = useState(null);
//   const [status, setStatus] = useState(conversation.status || "active");
//   const [sending, setSending] = useState(false);
//   const [selectedMsgId, setSelectedMsgId] = useState(null);
//   const [openedMenuMsgId, setOpenedMenuMsgId] = useState(null);
//   const [showPinnedModal, setShowPinnedModal] = useState(false);

//   const messagesRef = useRef([]);
//   useEffect(() => {
//     messagesRef.current = messages;
//   }, [messages]);

//   const other = conversation?.participants?.find(
//     (p) => (typeof p === "string" ? p : p?._id) !== user._id
//   );

//   const isRecipient =
//     conversation?.requestedTo === user._id ||
//     conversation?.requestedTo?._id === user._id;

//   // Load messages
//   useEffect(() => {
//     const loadMessages = async () => {
//       if (!conversation?._id || conversation._id.startsWith("temp-")) {
//         setMessages([]);
//         setStatus("active");
//         return;
//       }
//       const res = await messageService.getMessages(conversation._id);
//       const msgs = computeTimestamps(res.messages || []);
//       setMessages(msgs);
//       setPinnedMessages(msgs.filter((m) => m.isPinned));
//       setStatus(res.status || "active");
//       await messageService.markAsRead(conversation._id);
//     };
//     loadMessages();
//   }, [conversation]);

//   // Socket realtime
//   useEffect(() => {
//     if (!socket) return;

//     const handleNewMessage = (data) => {
//       if (data.conversationId === conversation._id) {
//         setMessages((prev) => {
//           const updated = computeTimestamps([...prev, data.message]);
//           setPinnedMessages(updated.filter((m) => m.isPinned));
//           return updated;
//         });
//       }
//     };

//     const handlePinned = ({ messageId, isPinned }) => {
//       setMessages((prev) =>
//         prev.map((m) => (m._id === messageId ? { ...m, isPinned } : m))
//       );

//       setPinnedMessages((prev) => {
//         const msg = messagesRef.current.find((m) => m._id === messageId);
//         if (!msg) return prev;
//         if (isPinned) return [msg, ...prev];
//         return prev.filter((m) => m._id !== messageId);
//       });
//     };

//     const handleEdited = ({ messageId, newText }) => {
//       setMessages((prev) =>
//         prev.map((m) =>
//           m._id === messageId ? { ...m, text: newText, isEdited: true } : m
//         )
//       );
//     };

//     const handleRecalled = ({ messageId }) => {
//       setMessages((prev) =>
//         prev.map((m) =>
//           m._id === messageId ? { ...m, isRecalled: true } : m
//         )
//       );
//     };

//     socket.on("new_message", handleNewMessage);
//     socket.on("message_pinned", handlePinned);
//     socket.on("message_edited", handleEdited);
//     socket.on("message_recalled", handleRecalled);

//     return () => {
//       socket.off("new_message", handleNewMessage);
//       socket.off("message_pinned", handlePinned);
//       socket.off("message_edited", handleEdited);
//       socket.off("message_recalled", handleRecalled);
//     };
//   }, [socket, conversation]);

//   // Message actions
//   const handleMessageAction = async (data) => {
//     if (data.edit) {
//       setEditingMessage(data.message);
//       setText(data.message.text);
//       return;
//     }

//     if (data.togglePin) {
//       try {
//         const res = await messageService.togglePin(data.message._id);

//         setMessages((prev) =>
//           prev.map((m) =>
//             m._id === res.message._id ? { ...m, isPinned: res.message.isPinned } : m
//           )
//         );

//         setPinnedMessages((prev) => {
//           if (res.message.isPinned) {
//             return [res.message, ...prev.filter((m) => m._id !== res.message._id)];
//           }
//           return prev.filter((m) => m._id !== res.message._id);
//         });
//       } catch (err) {
//         console.error(err);
//       }
//       return;
//     }

//     const { message, recallForAll, deleteForMe } = data;

//     try {
//       if (recallForAll) {
//         await messageService.recallMessage(message._id);
//         setMessages((prev) =>
//           prev.map((m) =>
//             m._id === message._id ? { ...m, isRecalled: true } : m
//           )
//         );
//       }

//       if (deleteForMe) {
//         await messageService.deleteMessageLocal(message._id);
//         setMessages((prev) => prev.filter((m) => m._id !== message._id));
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   // Scroll & highlight message
//   const scrollToMessage = (msgId) => {
//     const el = document.getElementById(`msg-${msgId}`);
//     if (el) {
//       el.scrollIntoView({ behavior: "smooth", block: "center" });
//       el.classList.add("bg-yellow-200");
//       setTimeout(() => el.classList.remove("bg-yellow-200"), 1500);
//     }
//   };

//   return (
//     <div className="flex flex-col h-full bg-white border-l border-gray-200">
//       <ChatBoxHeader other={other} />

//       <PinnedMessagesPanel
//         pinnedMessages={pinnedMessages}
//         onClick={scrollToMessage}
//         onOpenPanel={() => setShowPinnedModal(true)}
//       />

//       <ChatBoxMessages
//         messages={messages}
//         other={other}
//         currentUserId={user._id}
//         selectedMsgId={selectedMsgId}
//         setSelectedMsgId={setSelectedMsgId}
//         openedMenuMsgId={openedMenuMsgId}
//         setOpenedMenuMsgId={setOpenedMenuMsgId}
//         onMessageAction={handleMessageAction}
//       />

//       <ChatBoxStatus
//         status={status}
//         isRecipient={isRecipient}
//         other={other}
//         onAccept={async () => {
//           await conversationService.acceptRequest(conversation._id);
//           setStatus("active");
//         }}
//         onReject={async () => {
//           await conversationService.rejectRequest(conversation._id);
//           setStatus("rejected");
//         }}
//       />

//       {(status === "active" || (status === "pending" && !isRecipient)) && (
//         <ChatBoxInput
//           text={text}
//           setText={setText}
//           sending={sending}
//           editingMessage={editingMessage}
//           cancelEdit={() => {
//             setEditingMessage(null);
//             setText("");
//           }}
//           onSend={async (e) => {
//             e.preventDefault();
//             if (!text.trim() || sending) return;

//             if (editingMessage) return handleEditSubmit();

//             const recipient = conversation.participants.find(
//               (p) => (typeof p === "string" ? p : p?._id) !== user._id
//             );
//             const recipientId =
//               typeof recipient === "string" ? recipient : recipient._id;

//             const clientId = Date.now();
//             const tempMessage = {
//               clientId,
//               _id: `temp-${clientId}`,
//               text,
//               sender: user._id,
//               createdAt: new Date(),
//               pending: true,
//             };

//             setMessages((prev) => [...prev, tempMessage]);
//             setText("");
//             setSending(true);

//             try {
//               let res;
//               if (!conversation._id) {
//                 res = await conversationService.startConversation(
//                   recipientId,
//                   tempMessage.text
//                 );

//                 if (res?.conversation) {
//                   setMessages((prev) =>
//                     prev.map((m) =>
//                       m.clientId === clientId
//                         ? { ...res.message, clientId }
//                         : m
//                     )
//                   );

//                   onMessageSent?.(
//                     res.conversation._id,
//                     res.message,
//                     res.conversation.participants
//                   );

//                   conversation._id = res.conversation._id;
//                   conversation.participants = res.conversation.participants;
//                   conversation.status = res.conversation.status;
//                 }
//               } else {
//                 res = await messageService.sendMessage(
//                   conversation._id,
//                   recipientId,
//                   tempMessage.text
//                 );

//                 if (res?.message) {
//                   setMessages((prev) =>
//                     prev.map((m) =>
//                       m.clientId === clientId
//                         ? { ...res.message, clientId }
//                         : m
//                     )
//                   );
//                   onMessageSent?.(conversation._id, res.message);
//                 }
//               }
//             } catch (err) {
//               setMessages((prev) =>
//                 prev.filter((m) => m.clientId !== clientId)
//               );
//               console.error(err);
//             } finally {
//               setSending(false);
//             }
//           }}
//         />
//       )}

//       {/* Modal hiển thị danh sách tin nhắn đã ghim */}
//       {showPinnedModal && (
//         <PinnedMessagesModal
//           pinnedMessages={pinnedMessages}
//           onClose={() => setShowPinnedModal(false)}
//           onJump={(msgId) => {
//             scrollToMessage(msgId);
//             setShowPinnedModal(false);
//           }}
//         />
//       )}
//     </div>
//   );
// }

// import { useState, useContext, useEffect, useRef } from "react";
// import { SocketContext } from "../../../context/SocketContext";
// import { useAuth } from "../../../context/AuthContext";
// import ChatBoxHeader from "./ChatBoxHeader";
// import ChatBoxMessages from "./ChatBoxMessages";
// import ChatBoxStatus from "./ChatBoxStatus";
// import ChatBoxInput from "./ChatBoxInput";
// import PinnedMessagesPanel from "../../../components/UI/PinnedMessagesPanel";
// import PinnedMessagesModal from "../../../components/UI/PinnedMessagesModal";

// import messageService from "../../../services/messageService";
// import conversationService from "../../../services/conversationService";
// import { computeTimestamps } from "../../../utils/timeUtils";

// export default function ChatBox({
//   conversation,
//   currentUserId,
//   onMessageSent,
// }) {
//   const { user } = useAuth();
//   const { socket } = useContext(SocketContext);

//   const [messages, setMessages] = useState([]);
//   const [pinnedMessages, setPinnedMessages] = useState([]);
//   const [text, setText] = useState("");
//   const [editingMessage, setEditingMessage] = useState(null);
//   const [status, setStatus] = useState(conversation.status || "active");
//   const [sending, setSending] = useState(false);
//   const [selectedMsgId, setSelectedMsgId] = useState(null);
//   const [openedMenuMsgId, setOpenedMenuMsgId] = useState(null);
//   const [showPinnedModal, setShowPinnedModal] = useState(false);

//   const messagesRef = useRef([]);
//   useEffect(() => {
//     messagesRef.current = messages;
//   }, [messages]);

//   const other = conversation?.participants?.find(
//     (p) => (typeof p === "string" ? p : p?._id) !== user._id
//   );

//   const isRecipient =
//     conversation?.requestedTo === user._id ||
//     conversation?.requestedTo?._id === user._id;

//   // Load messages
//   useEffect(() => {
//     const loadMessages = async () => {
//       if (!conversation?._id || conversation._id.startsWith("temp-")) {
//         setMessages([]);
//         setStatus("active");
//         return;
//       }
//       const res = await messageService.getMessages(conversation._id);
//       const msgs = computeTimestamps(res.messages || []);
//       setMessages(msgs);
//       setPinnedMessages(msgs.filter((m) => m.isPinned));
//       setStatus(res.status || "active");
//       await messageService.markAsRead(conversation._id);
//     };
//     loadMessages();
//   }, [conversation]);

//   // Socket realtime
//   useEffect(() => {
//     if (!socket) return;

//     const handleNewMessage = (data) => {
//       if (data.conversationId === conversation._id) {
//         setMessages((prev) => {
//           const updated = computeTimestamps([...prev, data.message]);
//           setPinnedMessages(updated.filter((m) => m.isPinned));
//           return updated;
//         });
//       }
//     };

//     const handlePinned = ({ messageId, isPinned }) => {
//       setMessages((prev) =>
//         prev.map((m) => (m._id === messageId ? { ...m, isPinned } : m))
//       );

//       setPinnedMessages((prev) => {
//         const msg = messagesRef.current.find((m) => m._id === messageId);
//         if (!msg) return prev;
//         if (isPinned) return [msg, ...prev];
//         return prev.filter((m) => m._id !== messageId);
//       });
//     };
//     const handleEdited = ({ messageId, newText }) => {
//       setMessages((prev) =>
//         computeTimestamps(
//           prev.map((m) =>
//             m._id === messageId ? { ...m, text: newText, edited: true } : m
//           )
//         )
//       );
//     };

//     const handleRecalled = ({ messageId }) => {
//       setMessages((prev) =>
//         prev.map((m) => (m._id === messageId ? { ...m, isRecalled: true } : m))
//       );
//     };

//     socket.on("new_message", handleNewMessage);
//     socket.on("message_pinned", handlePinned);
//     socket.on("message_edited", handleEdited);
//     socket.on("message_recalled", handleRecalled);

//     return () => {
//       socket.off("new_message", handleNewMessage);
//       socket.off("message_pinned", handlePinned);
//       socket.off("message_edited", handleEdited);
//       socket.off("message_recalled", handleRecalled);
//     };
//   }, [socket, conversation]);

//   const handleEditSubmit = async () => {
//     if (!editingMessage || !text.trim()) return;

//     try {
//       const res = await messageService.editMessage(
//         editingMessage._id,
//         text.trim()
//       );
//       if (res?.message) {
//         setMessages((prev) =>
//           computeTimestamps(
//             prev.map((m) =>
//               m._id === editingMessage._id
//                 ? { ...res.message, edited: true }
//                 : m
//             )
//           )
//         );

//         setEditingMessage(null);
//         setText("");
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   // Message actions
//   const handleMessageAction = async (data) => {
//     if (data.edit) {
//       setEditingMessage(data.message);
//       setText(data.message.text);
//       return;
//     }

//     if (data.togglePin) {
//       try {
//         const res = await messageService.togglePin(data.message._id);

//         setMessages((prev) =>
//           prev.map((m) =>
//             m._id === res.message._id
//               ? { ...m, isPinned: res.message.isPinned }
//               : m
//           )
//         );

//         setPinnedMessages((prev) => {
//           if (res.message.isPinned) {
//             return [
//               res.message,
//               ...prev.filter((m) => m._id !== res.message._id),
//             ];
//           }
//           return prev.filter((m) => m._id !== res.message._id);
//         });
//       } catch (err) {
//         console.error(err);
//       }
//       return;
//     }

//     const { message, recallForAll, deleteForMe } = data;

//     try {
//       if (recallForAll) {
//         await messageService.recallMessage(message._id);
//         setMessages((prev) =>
//           prev.map((m) =>
//             m._id === message._id ? { ...m, isRecalled: true } : m
//           )
//         );
//       }

//       if (deleteForMe) {
//         await messageService.deleteMessageLocal(message._id);
//         setMessages((prev) => prev.filter((m) => m._id !== message._id));
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   // Scroll & highlight message
//   const scrollToMessage = (msgId) => {
//     const el = document.getElementById(`msg-${msgId}`);
//     if (el) {
//       el.scrollIntoView({ behavior: "smooth", block: "center" });
//       el.classList.add("bg-yellow-200");
//       setTimeout(() => el.classList.remove("bg-yellow-200"), 1500);
//     }
//   };

//   return (
//     <div className="flex flex-col h-full bg-white border-l border-gray-200">
//       <ChatBoxHeader other={other} />

//       <PinnedMessagesPanel
//         pinnedMessages={pinnedMessages}
//         onClick={scrollToMessage}
//         onOpenPanel={() => setShowPinnedModal(true)}
//       />

//       <ChatBoxMessages
//         messages={messages}
//         other={other}
//         currentUserId={user._id}
//         selectedMsgId={selectedMsgId}
//         setSelectedMsgId={setSelectedMsgId}
//         openedMenuMsgId={openedMenuMsgId}
//         setOpenedMenuMsgId={setOpenedMenuMsgId}
//         onMessageAction={handleMessageAction}
//       />

//       <ChatBoxStatus
//         status={status}
//         isRecipient={isRecipient}
//         other={other}
//         onAccept={async () => {
//           await conversationService.acceptRequest(conversation._id);
//           setStatus("active");
//         }}
//         onReject={async () => {
//           await conversationService.rejectRequest(conversation._id);
//           setStatus("rejected");
//         }}
//       />

//       {(status === "active" || (status === "pending" && !isRecipient)) && (
//         <ChatBoxInput
//           text={text}
//           setText={setText}
//           sending={sending}
//           editingMessage={editingMessage}
//           cancelEdit={() => {
//             setEditingMessage(null);
//             setText("");
//           }}
//           onSend={async (e) => {
//             e.preventDefault();
//             if (!text.trim() || sending) return;

//             if (editingMessage) return handleEditSubmit();

//             const recipient = conversation.participants.find(
//               (p) => (typeof p === "string" ? p : p?._id) !== user._id
//             );
//             const recipientId =
//               typeof recipient === "string" ? recipient : recipient._id;

//             const clientId = Date.now();
//             const tempMessage = {
//               clientId,
//               _id: `temp-${clientId}`,
//               text,
//               sender: user._id,
//               createdAt: new Date(),
//               pending: true,
//             };

//             setMessages((prev) => [...prev, tempMessage]);
//             setText("");
//             setSending(true);

//             try {
//               let res;
//               if (!conversation._id) {
//                 res = await conversationService.startConversation(
//                   recipientId,
//                   tempMessage.text
//                 );

//                 if (res?.conversation) {
//                   setMessages((prev) =>
//                     prev.map((m) =>
//                       m.clientId === clientId ? { ...res.message, clientId } : m
//                     )
//                   );

//                   onMessageSent?.(
//                     res.conversation._id,
//                     res.message,
//                     res.conversation.participants
//                   );

//                   conversation._id = res.conversation._id;
//                   conversation.participants = res.conversation.participants;
//                   conversation.status = res.conversation.status;
//                 }
//               } else {
//                 res = await messageService.sendMessage(
//                   conversation._id,
//                   recipientId,
//                   tempMessage.text
//                 );

//                 if (res?.message) {
//                   setMessages((prev) =>
//                     prev.map((m) =>
//                       m.clientId === clientId ? { ...res.message, clientId } : m
//                     )
//                   );
//                   onMessageSent?.(conversation._id, res.message);
//                 }
//               }
//             } catch (err) {
//               setMessages((prev) =>
//                 prev.filter((m) => m.clientId !== clientId)
//               );
//               console.error(err);
//             } finally {
//               setSending(false);
//             }
//           }}
//         />
//       )}

//       {/* Modal hiển thị danh sách tin nhắn đã ghim */}
//       {showPinnedModal && (
//         <PinnedMessagesModal
//           pinnedMessages={pinnedMessages}
//           onClose={() => setShowPinnedModal(false)}
//           onJump={(msgId) => {
//             scrollToMessage(msgId);
//             setShowPinnedModal(false);
//           }}
//         />
//       )}
//     </div>
//   );
// }

import ChatBoxHeader from "./ChatBoxHeader";
import ChatBoxMessages from "./ChatBoxMessages";
import ChatBoxInput from "./ChatBoxInput";
import ChatBoxStatus from "./ChatBoxStatus";
import PinnedMessagesPanel from "../../../components/UI/PinnedMessagesPanel";
import PinnedMessagesModal from "../../../components/UI/PinnedMessagesModal";
import { useChatBox } from "./hooks/useChatBox";

export default function ChatBox({
  conversation,
  currentUserId,
  onMessageSent,
}) {
  const {
    messages,
    pinnedMessages,
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
    showPinnedModal,
    setShowPinnedModal,
    other,
    isRecipient,
    scrollToMessage,
    handleEditSubmit,
    handleMessageAction,
    sendMessage,
  } = useChatBox(conversation, onMessageSent);

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200">
      <ChatBoxHeader other={other} />
      <PinnedMessagesPanel
        pinnedMessages={pinnedMessages}
        onClick={scrollToMessage}
        onOpenPanel={() => setShowPinnedModal(true)}
      />
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
      {showPinnedModal && (
        <PinnedMessagesModal
          pinnedMessages={pinnedMessages}
          onClose={() => setShowPinnedModal(false)}
          onJump={scrollToMessage}
        />
      )}
    </div>
  );
}
