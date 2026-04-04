import { SendHorizonal, Check, X } from "lucide-react";

export default function ChatBoxInput({
  text,
  setText,
  onSend,
  sending,
  editingMessage,
  cancelEdit,
}) {
  const isEditing = Boolean(editingMessage);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    onSend();
  };

  return (
    <div className="p-4 bg-white border-t border-gray-50 max-w-full relative">
      {isEditing && (
        <div className="absolute bottom-full left-0 right-0 p-3 bg-blue-50 border-t border-blue-100 flex items-center justify-between animate-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2 text-blue-600">
             <div className="w-1 h-4 bg-blue-400 rounded-full"></div>
             <p className="text-xs font-bold uppercase tracking-wider">Đang chỉnh sửa...</p>
          </div>
          <button
            type="button"
            onClick={cancelEdit}
            className="p-1 text-blue-400 hover:text-blue-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 bg-gray-50 border border-transparent focus-within:border-blue-100 focus-within:bg-white focus-within:shadow-sm p-1.5 rounded-2xl transition-all"
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={isEditing ? "Chỉnh sửa tin nhắn của bạn..." : "Viết gì đó..."}
          disabled={sending}
          className="flex-1 bg-transparent px-3 py-2 outline-none text-sm text-gray-800 placeholder:text-gray-400"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            isEditing 
            ? "bg-green-500 text-white shadow-lg shadow-green-100 hover:bg-green-600" 
            : "bg-blue-600 text-white shadow-lg shadow-blue-100 hover:bg-blue-700 disabled:bg-gray-200 disabled:shadow-none"
          }`}
        >
          {sending ? (
             <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
             isEditing ? <Check size={20} /> : <SendHorizonal size={20} />
          )}
        </button>
      </form>
    </div>
  );
}
