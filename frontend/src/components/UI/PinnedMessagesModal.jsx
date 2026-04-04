import React from "react";
import { Pin, X } from "lucide-react";

export default function PinnedMessagesModal({ pinnedMessages, onClose, onJump }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-96 max-h-[70vh] overflow-y-auto p-4 shadow-lg">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Tin nhắn đã ghim</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* List */}
        <div className="flex flex-col gap-2">
          {pinnedMessages.map((msg) => (
            <div
              key={msg._id}
              className="p-2 rounded cursor-pointer hover:bg-yellow-100 flex items-center gap-2"
              onClick={() => onJump(msg._id)}
            >
              <Pin size={18} className="text-yellow-600" />

              <span className="truncate flex-1">
                {msg.text || "(Tin nhắn không có nội dung)"}
              </span>

              <span className="text-xs text-gray-400">
                {new Date(msg.createdAt).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
