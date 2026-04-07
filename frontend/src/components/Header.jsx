import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Home, Video, MessageCircle, Settings, LogOut, Shield, BarChart3, PlusCircle, MoreVertical } from "lucide-react";
import { useState } from "react";

function Header() {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const location = useLocation();
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  const isVideoPage = location.pathname === "/videos";

  const navItems = [
    { to: "/home", icon: <Home size={22} />, label: "Trang chủ" },
    { to: "/ask", icon: <PlusCircle size={22} />, label: "Hỏi" },
    { to: "/videos", icon: <Video size={22} />, label: "Videos" },
    { to: "/messages", icon: <MessageCircle size={22} />, label: "Chat" },
  ];

  // Nếu là trang video, mặc định thu gọn thành dấu 3 chấm
  if (isVideoPage && !isCompact) {
    return (
      <header className="fixed top-4 left-4 z-[100]">
         <button 
          onClick={() => setIsCompact(true)}
          className="p-3 bg-white/20 backdrop-blur-lg hover:bg-white/40 text-white rounded-full transition-all border border-white/20 shadow-lg"
         >
           <MoreVertical size={24} />
         </button>
      </header>
    );
  }

  return (
    <header className={`${isVideoPage ? "fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-6 animate-in fade-in zoom-in-95" : "fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50"} transition-all duration-300`}>
      <div className={`${isVideoPage ? "bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative" : "max-w-7xl mx-auto px-4 h-full flex items-center justify-between"}`}>
        
        {/* Nút đóng cho compact mode trên video */}
        {isVideoPage && (
          <button 
            onClick={() => setIsCompact(false)}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <LogOut size={20} className="rotate-90" />
          </button>
        )}

        {/* Left: Brand */}
        <Link to="/home" className={`${isVideoPage ? "flex flex-col items-center mb-6" : "flex items-center gap-2"}`}>
           <span className={`${isVideoPage ? "text-2xl" : "text-xl"} font-extrabold text-blue-600 tracking-tight`}>
            BITISMS
           </span>
           
        </Link>

        {/* Center: Navigation */}
        <nav className={`${isVideoPage ? "flex flex-col gap-2 w-full" : "hidden md:flex items-center gap-1 bg-gray-100/50 p-1 rounded-xl"}`}>
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => isVideoPage && setIsCompact(false)}
              className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${
                location.pathname === item.to
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200 font-bold"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {item.icon}
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
          
          {isAdmin && (
             <div className={`${isVideoPage ? "mt-4 pt-4 border-t border-gray-100 w-full" : "relative"}`}>
              {!isVideoPage && (
                <button 
                  onClick={() => setShowAdminMenu(!showAdminMenu)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-500 hover:text-blue-600"
                >
                  <Settings size={22} />
                </button>
              )}
              
              {(showAdminMenu || isVideoPage) && (
                <div className={`${isVideoPage ? "grid grid-cols-2 gap-2" : "absolute top-full right-0 mt-2 w-48 bg-white border border-gray-100 shadow-xl rounded-xl p-2 animate-in fade-in slide-in-from-top-1"}`}>
                   <Link to="/admin/approve" className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg text-xs text-gray-700" onClick={() => setShowAdminMenu(false)}>Duyệt bài</Link>
                   <Link to="/admin/users" className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg text-xs text-gray-700" onClick={() => setShowAdminMenu(false)}>Thành viên</Link>
                   <Link to="/admin/stats" className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg text-xs text-gray-700" onClick={() => setShowAdminMenu(false)}>Thống kê</Link>
                </div>
              )}
             </div>
          )}
        </nav>

        {/* Right: Actions */}
        <div className={`${isVideoPage ? "mt-8 w-full" : "flex items-center gap-3"}`}>
          {isAuthenticated ? (
            <div className={`${isVideoPage ? "flex flex-col gap-4" : "flex items-center gap-3"}`}>
              <div className="flex items-center justify-between w-full">
                <Link to={`/${user?.identifier}`} className="flex items-center gap-3 group" onClick={() => isVideoPage && setIsCompact(false)}>
                    <img
                      src={user?.avatar || "https://www.gravatar.com/avatar?d=mp"}
                      alt="avatar"
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-50 transition-all"
                    />
                    <div className="text-left">
                       <p className="text-sm font-bold text-gray-900 leading-none">@{user?.identifier}</p>
                       <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">{user?.role}</p>
                    </div>
                 </Link>
              </div>
              
              <button
                onClick={logout}
                className={`${isVideoPage ? "w-full py-3 bg-red-50 text-red-600 rounded-xl" : "p-2 text-gray-400 hover:text-red-500"} flex items-center justify-center gap-2 text-sm font-bold transition-all`}
              >
                <LogOut size={20} />
                {isVideoPage && "Đăng xuất"}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 w-full">
              <Link to="/login" className="text-center py-2 text-sm font-medium text-gray-600">Đăng nhập</Link>
              <Link to="/register" className="text-center py-3 bg-blue-600 text-white rounded-xl text-sm font-bold">Đăng ký</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
