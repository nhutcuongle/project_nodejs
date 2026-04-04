import { useState, useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { SocketContext } from "../context/SocketContext";
import conversationService from "../services/conversationService";
import MessengerSidebar from "../components/messages/MessegePage/MessengerSidebar";
import MessengerChatBox from "../components/messages/MessegePage/MessengerChatBox";

export default function MessengerPage() {
  const { user } = useAuth();
  const { socket } = useContext(SocketContext);
  const location = useLocation();

  const [conversations, setConversations] = useState([]);
  const [friends, setFriends] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [boxType, setBoxType] = useState("main");

  useEffect(() => {
    const fetchData = async () => {
      const res = await conversationService.getConversations(boxType);
      const backendConvs = res.conversations || [];

      setConversations((prev) => {
        const merged = [...backendConvs];
        prev.forEach((c) => {
          if (
            c._id.startsWith("temp-") &&
            !backendConvs.find((bc) => bc._id === c._id)
          ) {
            merged.unshift(c);
          }
        });
        return merged;
      });

      setFriends(res.friends || []);
    };
    fetchData();
  }, [boxType]);

  useEffect(() => {
    const selectedConv = location.state?.selectedConversation;
    if (selectedConv) {
      setSelectedConversation(selectedConv);
      window.history.replaceState({}, "");
    }
  }, [location.state]);

  useEffect(() => {
    if (!socket) return;
   const handleNewMessage = (data) => {
  // Nếu là message_request (pending) và mình là recipient → KHÔNG push
  if (
    data.event === "message_request" && // cần backend emit kèm event type hoặc check tên event
    data.recipient === user._id
  ) return;

  setConversations((prev) => {
    const updatedList = [...prev];
    const idx = updatedList.findIndex((c) => c._id === data.conversationId);
    if (idx !== -1) {
      updatedList[idx] = { ...updatedList[idx], lastMessage: data.message };
      const conv = updatedList.splice(idx, 1)[0];
      updatedList.unshift(conv);
    } else {
      updatedList.unshift({
        _id: data.conversationId,
        participants: [data.message.sender, data.message.recipient],
        lastMessage: data.message,
        unreadCounts: [],
      });
    }
    return updatedList;
  });
};

    socket.on("new_message", handleNewMessage);
    socket.on("message_request", handleNewMessage);
    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("message_request", handleNewMessage);
    };
  }, [socket]);

  const handleFriendClick = async (friend) => {
    const res = await conversationService.startConversation(friend._id, "");
    let conv = res?.conversation;
    if (!conv) return;

    conv.participants = conv.participants.map((p) => ({
      _id: p._id,
      username: p.username || friend.username,
      avatar: p.avatar || friend.avatar,
    }));

    setConversations((prev) => {
      if (prev.find((c) => c._id === conv._id)) return prev;
      return [conv, ...prev];
    });
    setSelectedConversation(conv);
    setFriends((prev) => prev.filter((f) => f._id !== friend._id));
  };

  const handleUpdateConversation = (
    conversationId,
    message,
    updatedParticipants
  ) => {
    setConversations((prev) => {
      const idx = prev.findIndex(
        (c) => c._id === conversationId || c._id.startsWith("temp-")
      );
      if (idx !== -1) {
        const updated = {
          ...prev[idx],
          _id: conversationId,
          lastMessage: message,
          participants: updatedParticipants || prev[idx].participants,
        };
        const list = [...prev];
        list.splice(idx, 1);
        return [updated, ...list];
      }
      return prev;
    });

    setSelectedConversation((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        _id: conversationId,
        lastMessage: message,
        participants: updatedParticipants || prev.participants,
      };
    });
  };

  const handleConversationDelete = (id) => {
    setConversations((prev) => prev.filter((c) => c._id !== id));
    if (selectedConversation?._id === id) setSelectedConversation(null);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white overflow-hidden rounded-3xl border border-gray-100 shadow-2xl shadow-blue-50/50">
      <MessengerSidebar
        boxType={boxType}
        setBoxType={setBoxType}
        friends={friends}
        conversations={conversations}
        currentUser={user}
        selectedConversation={selectedConversation}
        onFriendClick={handleFriendClick}
        onConversationSelect={setSelectedConversation}
        onConversationDelete={handleConversationDelete}
      />
      <div className="flex-1 min-w-0 bg-white relative">
        <MessengerChatBox
          conversation={selectedConversation}
          currentUserId={user._id}
          onMessageSent={handleUpdateConversation}
        />
      </div>
    </div>
  );
}
