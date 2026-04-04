import { useNavigate } from "react-router-dom";
import { Info, Phone, Video } from "lucide-react";

export default function ChatBoxHeader({ other }) {
  const navigate = useNavigate();

  const goToProfile = (e) => {
    e.stopPropagation();
    if (!other) return;
    const identifier = other.identifier || other._id || other;
    navigate(`/${identifier}`);
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 bg-white/50 backdrop-blur-md sticky top-0 z-20">
      <div 
        className="flex items-center gap-4 cursor-pointer group"
        onClick={goToProfile}
      >
        <div className="relative">
          <img
            src={other?.avatar || "https://www.gravatar.com/avatar?d=mp"}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100 group-hover:ring-blue-100 transition-all shadow-sm"
            alt="avatar"
          />
          <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
        </div>
        <div>
          <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
            {other?.username || "Người dùng"}
          </h3>
          <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Đang hoạt động</span>
        </div>
      </div>

      <div className="flex items-center gap-1">
         <button className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-all" title="Cuộc gọi">
            <Phone size={20} />
         </button>
         <button className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-all" title="Video">
            <Video size={20} />
         </button>
         <button className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-all" title="Thông tin">
            <Info size={20} />
         </button>
      </div>
    </div>
  );
}
