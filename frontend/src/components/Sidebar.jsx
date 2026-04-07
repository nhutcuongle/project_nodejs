import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Home,
  PlusCircle,
  User,
  ShieldCheck,
  Ban,
  ClipboardList,
  Users,
  Tag,
  ChevronLeft,
  ChevronRight,
  Video,
  MessageCircle,
  ScrollText,
} from "lucide-react";

function Sidebar() {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  if (!isAuthenticated) return null;

  const toggleCollapse = () => setCollapsed(!collapsed);

  return (
    <aside
      className={`sticky top-16 self-start bg-white shadow-md transition-all duration-300 
      ${
        collapsed ? "w-20" : "w-64"
      } max-h-[calc(100vh-4rem)] overflow-y-auto rounded-r-xl p-4`}
    >
      {/* Nút thu gọn */}
      <div className="flex justify-end">
        <button
          onClick={toggleCollapse}
          className="mb-4 p-1 rounded hover:bg-gray-100"
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </button>
      </div>

      {/* Nhóm 1: Người dùng */}
      <SidebarGroup collapsed={collapsed}>
        <SidebarItem
          to="/home"
          icon={<Home size={20} />}
          label="Trang chủ"
          collapsed={collapsed}
          currentPath={location.pathname}
        />
        <SidebarItem
          to="/ask"
          icon={<PlusCircle size={20} />}
          label="Đặt câu hỏi"
          collapsed={collapsed}
          currentPath={location.pathname}
        />
        <SidebarItem
          to="/videos"
          icon={<Video size={20} />}
          label="Thướt Video"
          collapsed={collapsed}
          currentPath={location.pathname}
        />
        <SidebarItem
          to="/messages"
          icon={<MessageCircle size={20} />}
          label="Tin nhắn"
          collapsed={collapsed}
          currentPath={location.pathname}
        />
        <SidebarItem
          to={`/${user?.identifier}`}
          icon={<User size={20} />}
          label="Thông tin cá nhân"
          collapsed={collapsed}
          currentPath={location.pathname}
        />
      </SidebarGroup>

      {/* Nhóm 2: Quản trị */}
      {isAdmin && (
        <SidebarGroup title="Quản trị viên" collapsed={collapsed}>
          <SidebarItem
            to="/admin/approve"
            icon={<ShieldCheck size={20} />}
            label="Duyệt nội dung"
            collapsed={collapsed}
            currentPath={location.pathname}
          />
          <SidebarItem
            to="/admin/words"
            icon={<Ban size={20} />}
            label="Quản lý từ cấm"
            collapsed={collapsed}
            currentPath={location.pathname}
          />
          <SidebarItem
            to="/admin/questions"
            icon={<ClipboardList size={20} />}
            label="Quản lý câu hỏi"
            collapsed={collapsed}
            currentPath={location.pathname}
          />
          <SidebarItem
            to="/admin/users"
            icon={<Users size={20} />}
            label="Quản lý người dùng"
            collapsed={collapsed}
            currentPath={location.pathname}
          />
          <SidebarItem
            to="/admin/moderation-logs"
            icon={<ScrollText size={20} />}
            label="Lịch sử kiểm duyệt"
            collapsed={collapsed}
            currentPath={location.pathname}
          />
        </SidebarGroup>
      )}
    </aside>
  );
}

// 👉 Nhóm tiêu đề sidebar (có hoặc không hiện khi thu gọn)
function SidebarGroup({ title, children, collapsed }) {
  return (
    <div className="mb-4">
      {!collapsed && (
        <p className="text-gray-400 text-xs font-semibold uppercase px-2 mb-2">
          {title}
        </p>
      )}
      <div className="space-y-1">{children}</div>
    </div>
  );
}

// 👉 Mục sidebar đơn
function SidebarItem({ to, icon, label, collapsed, currentPath }) {
  const isActive = currentPath === to;

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition duration-200 ${
        isActive
          ? "bg-blue-100 text-blue-600 font-semibold"
          : "text-gray-700 hover:bg-blue-100 hover:text-blue-600"
      }`}
    >
      <div className={`${isActive ? "text-blue-600" : ""}`}>{icon}</div>
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}

export default Sidebar;
