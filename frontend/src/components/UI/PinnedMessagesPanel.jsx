import React from "react";
import { ChevronDown, Pin } from "lucide-react";

export default function PinnedMessagesPanel({ pinnedMessages, onClick, onOpenPanel }) {
  if (!pinnedMessages.length) return null;

  return (
    <div className="bg-gray-100 p-2 flex items-center justify-between border-b">
      
      {/* Danh sách pinned cuộn ngang */}
      <div className="flex gap-2 overflow-x-auto">
        {pinnedMessages.map((msg) => (
          <div
            key={msg._id}
            className="px-3 py-1 bg-yellow-100 rounded-full cursor-pointer flex items-center gap-1"
            onClick={() => onClick(msg._id)}
          >
            <Pin size={16} className="text-yellow-700" />
            <span className="truncate max-w-xs">{msg.text}</span>
          </div>
        ))}
      </div>

      {/* Nút mở panel */}
      <button
        onClick={onOpenPanel}
        className="ml-2 p-1 rounded hover:bg-gray-200"
      >
        <ChevronDown size={20} />
      </button>
    </div>
  );
}
