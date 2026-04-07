

import { useState, useRef } from "react";
import RecallConfirmPopup from "../UI/RecallConfirmPopup";
import MessageMenu from "../UI/MessageMenu";

export default function MessageItem({
  message,
  other,
  showAvatar,
  currentUserId,
  onAction,
  selectedMsgId,
  setSelectedMsgId,
  openedMenuMsgId,
  setOpenedMenuMsgId,
}) {
  const senderId =
    typeof message.sender === "string" ? message.sender : message.sender?._id;
  const isMine = senderId === currentUserId;

  const [hover, setHover] = useState(false);
  const [menuPlacement, setMenuPlacement] = useState("down");
  const [confirmRecall, setConfirmRecall] = useState(false);
  const [recallForAll, setRecallForAll] = useState(false);
  const [deleteForMe, setDeleteForMe] = useState(false);

  const msgId = message.clientId || message._id;
  const showFullTime = selectedMsgId === msgId;
  const isMenuOpen = openedMenuMsgId === msgId;
  const msgRef = useRef();

  const displayText = message.isRecalled
    ? isMine
      ? "Bạn đã thu hồi một tin nhắn"
      : "Tin nhắn đã được thu hồi"
    : message.text;

  const toggleMenu = (e) => {
    e.stopPropagation();
    const rect = msgRef.current.getBoundingClientRect();
    const screenHeight = window.innerHeight;
    setMenuPlacement(rect.bottom > screenHeight - 150 ? "up" : "down");
    setOpenedMenuMsgId(isMenuOpen ? null : msgId);
  };

  const handleRecallSubmit = ({
    deleteForMe = false,
    recallForAll = false,
  } = {}) => {
    onAction?.({ message, deleteForMe, recallForAll });
    setConfirmRecall(false);
    setDeleteForMe(false);
    setRecallForAll(false);
    setOpenedMenuMsgId(null);
  };

  return (
    <div
      id={`msg-${msgId}`}
      className="flex items-end gap-2 max-w-full relative"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() =>
        setSelectedMsgId(selectedMsgId === msgId ? null : msgId)
      }
    >
      <div className="w-10 flex-shrink-0 flex justify-center">
        {!isMine && showAvatar && (
          <img
            src={other?.avatar || "/default-avatar.png"}
            className="w-8 h-8 rounded-full object-cover"
          />
        )}
      </div>

      <div
        ref={msgRef}
        className={`relative px-4 py-3 text-sm leading-snug cursor-pointer
          rounded-2xl max-w-[70%] break-words
          ${
            isMine
              ? "bg-blue-500 text-white rounded-br-none ml-auto"
              : "bg-gray-200 text-gray-900 rounded-bl-none"
          }
          ${message.isRecalled ? "italic text-gray-500 bg-gray-200" : ""}
        `}
      >
        {displayText}

        {message.edited && !message.isRecalled && (
          <div className="text-[10px] text-gray-200 mt-1 text-right opacity-70">
            Đã chỉnh sửa
          </div>
        )}

        {hover && !message.isRecalled && (
          <div
            className={`absolute top-1/2 -translate-y-1/2 cursor-pointer text-2xl font-bold z-30
              ${isMine ? "-left-12" : "-right-12"} text-gray-700`}
            onClick={toggleMenu}
          >
            ⋮
          </div>
        )}

        {isMenuOpen && (
          <MessageMenu
            isMine={isMine}
            isRecalled={message.isRecalled}
            onUnsend={() => setConfirmRecall(true)}
            onEdit={() => {
              setOpenedMenuMsgId(null);
              onAction?.({ edit: true, message });
            }}
            onRemoveForMe={() => handleRecallSubmit({ deleteForMe: true })}
            onReport={() => console.log("Report")}
            placement={menuPlacement}
            alignRight={isMine}
          />
        )}

        {confirmRecall && (
          <RecallConfirmPopup
            open={confirmRecall}
            recallForAll={recallForAll}
            setRecallForAll={setRecallForAll}
            deleteForMe={deleteForMe}
            setDeleteForMe={setDeleteForMe}
            onCancel={() => setConfirmRecall(false)}
            onSubmit={handleRecallSubmit}
          />
        )}

        {showFullTime && (
          <div className="text-xs text-gray-500 mt-1">
            {message.timestampLabel}
          </div>
        )}
      </div>
    </div>
  );
}
