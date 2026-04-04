import MessengerHeader from "../MessengerHeader";
import MessengerFriendItem from "./MessengerFriendItem";
import MessengerConversationItem from "./MessengerConversationItem";
import { Search } from "lucide-react";

export default function MessengerSidebar({
  boxType,
  setBoxType,
  friends,
  conversations,
  currentUser,
  selectedConversation,
  onFriendClick,
  onConversationSelect,
  onConversationDelete,
}) {
  return (
    <div className="w-[380px] flex-shrink-0 flex flex-col bg-white border-r border-gray-100 shadow-sm z-10 transition-all duration-300">
      {/* Header with Search */}
      <div className="p-4 space-y-4">
        <MessengerHeader boxType={boxType} setBoxType={setBoxType} />
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm cuộc trò chuyện..." 
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all outline-none"
          />
        </div>
      </div>

      {/* List Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="px-2 pb-4">
          {friends.length > 0 && (
            <div className="mb-4">
              <p className="px-3 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Người dùng mới</p>
              {friends.map((f) => (
                <MessengerFriendItem
                  key={f._id}
                  friend={f}
                  currentUser={currentUser}
                  onSelect={onFriendClick}
                />
              ))}
            </div>
          )}

          <div className="space-y-0.5">
             <p className="px-3 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Trò chuyện</p>
             {conversations.map((c) => (
              <MessengerConversationItem
                key={c._id}
                conversation={c}
                selected={selectedConversation?._id === c._id}
                currentUserId={currentUser._id}
                onSelect={() => onConversationSelect(c)}
                onDelete={onConversationDelete}
              />
            ))}
          </div>

          {conversations.length === 0 && friends.length === 0 && (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                 <Search className="text-gray-300" size={32} />
              </div>
              <p className="text-sm text-gray-500 font-medium tracking-tight">Không có hội thoại nào</p>
              <p className="text-xs text-gray-400 mt-1">Bắt đầu trò chuyện với bạn bè ngay!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
