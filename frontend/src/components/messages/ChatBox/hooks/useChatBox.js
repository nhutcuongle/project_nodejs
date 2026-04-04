// hooks/useChatBox.js
import { useState, useEffect, useRef, useContext } from "react";
import { SocketContext } from "../../../../context/SocketContext";
import { useAuth } from "../../../../context/AuthContext";
import messageService from "../../../../services/messageService";
import conversationService from "../../../../services/conversationService";
import { computeTimestamps } from "../../../../utils/timeUtils";

export function useChatBox(conversation, onMessageSent) {
  const { user } = useAuth();
  const { socket } = useContext(SocketContext);

  const [messages, setMessages] = useState([]);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [text, setText] = useState("");
  const [editingMessage, setEditingMessage] = useState(null);
  const [status, setStatus] = useState(conversation.status || "active");
  const [sending, setSending] = useState(false);
  const [selectedMsgId, setSelectedMsgId] = useState(null);
  const [openedMenuMsgId, setOpenedMenuMsgId] = useState(null);
  const [showPinnedModal, setShowPinnedModal] = useState(false);

  const messagesRef = useRef([]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  const other = conversation.participants.find(
    (p) => (typeof p === "string" ? p : p?._id) !== user._id
  );

  const isRecipient =
    conversation?.requestedTo === user._id ||
    conversation?.requestedTo?._id === user._id;

  // Load messages
  useEffect(() => {
    const loadMessages = async () => {
      if (!conversation?._id || conversation._id.startsWith("temp-")) {
        setMessages([]);
        setStatus("active");
        return;
      }
      const res = await messageService.getMessages(conversation._id);
      const msgs = computeTimestamps(res.messages || []);
      setMessages(msgs);
      setPinnedMessages(msgs.filter((m) => m.isPinned));
      setStatus(res.status || "active");
      await messageService.markAsRead(conversation._id);
    };
    loadMessages();
  }, [conversation]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data) => {
      if (data.conversationId === conversation._id) {
        setMessages((prev) => {
          const updated = computeTimestamps([...prev, data.message]);
          setPinnedMessages(updated.filter((m) => m.isPinned));
          return updated;
        });
      }
    };

    const handlePinned = ({ messageId, isPinned }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, isPinned } : m))
      );
      setPinnedMessages((prev) => {
        const msg = messagesRef.current.find((m) => m._id === messageId);
        if (!msg) return prev;
        return isPinned ? [msg, ...prev] : prev.filter((m) => m._id !== messageId);
      });
    };

    const handleEdited = ({ messageId, newText }) => {
      setMessages((prev) =>
        computeTimestamps(
          prev.map((m) =>
            m._id === messageId ? { ...m, text: newText, edited: true } : m
          )
        )
      );
    };

    const handleRecalled = ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, isRecalled: true } : m))
      );
    };

    socket.on("new_message", handleNewMessage);
    socket.on("message_pinned", handlePinned);
    socket.on("message_edited", handleEdited);
    socket.on("message_recalled", handleRecalled);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("message_pinned", handlePinned);
      socket.off("message_edited", handleEdited);
      socket.off("message_recalled", handleRecalled);
    };
  }, [socket, conversation]);

  // Scroll & highlight
  const scrollToMessage = (msgId) => {
    const el = document.getElementById(`msg-${msgId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("bg-yellow-200");
      setTimeout(() => el.classList.remove("bg-yellow-200"), 1500);
    }
  };

  // Send / Edit / Actions
  const handleEditSubmit = async () => {
    if (!editingMessage || !text.trim()) return;
    try {
      const res = await messageService.editMessage(editingMessage._id, text.trim());
      if (res?.message) {
        setMessages((prev) =>
          computeTimestamps(
            prev.map((m) =>
              m._id === editingMessage._id ? { ...res.message, edited: true } : m
            )
          )
        );
        setEditingMessage(null);
        setText("");
      }
    } catch (err) { console.error(err); }
  };

  const handleMessageAction = async ({ edit, togglePin, message, recallForAll, deleteForMe }) => {
    if (edit) { setEditingMessage(message); setText(message.text); return; }
    if (togglePin) {
      try {
        const res = await messageService.togglePin(message._id);
        setMessages((prev) =>
          prev.map((m) =>
            m._id === res.message._id ? { ...m, isPinned: res.message.isPinned } : m
          )
        );
        setPinnedMessages((prev) => {
          return res.message.isPinned
            ? [res.message, ...prev.filter((m) => m._id !== res.message._id)]
            : prev.filter((m) => m._id !== res.message._id);
        });
      } catch (err) { console.error(err); }
      return;
    }
    try {
      if (recallForAll) { await messageService.recallMessage(message._id); setMessages(prev => prev.map(m => m._id === message._id ? { ...m, isRecalled: true } : m)); }
      if (deleteForMe) { await messageService.deleteMessageLocal(message._id); setMessages(prev => prev.filter(m => m._id !== message._id)); }
    } catch (err) { console.error(err); }
  };

  const sendMessage = async (textInput) => {
    if (!textInput.trim() || sending) return;
    setSending(true);

    const recipient = conversation.participants.find(
      (p) => (typeof p === "string" ? p : p?._id) !== user._id
    );
    const recipientId = typeof recipient === "string" ? recipient : recipient._id;

    const clientId = Date.now();
    const tempMessage = { clientId, _id: `temp-${clientId}`, text: textInput, sender: user._id, createdAt: new Date(), pending: true };
    setMessages((prev) => [...prev, tempMessage]);
    setText("");

    try {
      let res;
      if (!conversation._id) {
        res = await conversationService.startConversation(recipientId, tempMessage.text);
        if (res?.conversation) {
          setMessages(prev => prev.map(m => m.clientId === clientId ? { ...res.message, clientId } : m));
          onMessageSent?.(res.conversation._id, res.message, res.conversation.participants);
          conversation._id = res.conversation._id;
          conversation.participants = res.conversation.participants;
          conversation.status = res.conversation.status;
        }
      } else {
        res = await messageService.sendMessage(conversation._id, recipientId, tempMessage.text);
        if (res?.message) {
          setMessages(prev => prev.map(m => m.clientId === clientId ? { ...res.message, clientId } : m));
          onMessageSent?.(conversation._id, res.message);
        }
      }
    } catch (err) {
      setMessages(prev => prev.filter(m => m.clientId !== clientId));
      console.error(err);
    } finally { setSending(false); }
  };

  return {
    messages, setMessages,
    pinnedMessages, setPinnedMessages,
    text, setText,
    editingMessage, setEditingMessage,
    status, setStatus,
    sending,
    selectedMsgId, setSelectedMsgId,
    openedMenuMsgId, setOpenedMenuMsgId,
    showPinnedModal, setShowPinnedModal,
    other, isRecipient,
    scrollToMessage,
    handleEditSubmit,
    handleMessageAction,
    sendMessage
  };
}
