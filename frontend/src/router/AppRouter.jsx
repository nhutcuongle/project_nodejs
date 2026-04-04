import { Routes, Route } from "react-router-dom";

// Trang người dùng
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import AskQuestion from "../pages/AskQuestion";
import QuestionDetail from "../pages/QuestionDetail";
import ShortVideoFeed from "../components/videos/ShortVideoFeed";
import ProfilePage from "../pages/ProfilePage";
import SearchResult from "../pages/SearchResult";
import LandingPage from "../pages/LandingPage";
import UploadDetailPage from "../pages/UploadDetailPage";

// Trang quản trị
import ApprovePanel from "../pages/admin/ApprovePanel";
import FilteredWords from "../pages/admin/FilteredWords";
import Statistics from "../pages/admin/Statistics";
import AdminQuestionList from "../pages/admin/AdminQuestionList";
import AdminUserList from "../pages/admin/AdminUserList";
import AdminHashtagManager from "../pages/admin/AdminHashtagManager";
import ModerationLogs from "../pages/admin/ModerationLogs";
import SettingsPage from "../pages/SettingsPage";
import MessagePage from "../pages/MessagePage";

function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* User Functionality */}
      <Route path="/ask" element={<AskQuestion />} />
      <Route path="/videos" element={<ShortVideoFeed />} />

      <Route path="/:identifier" element={<ProfilePage />} />
      <Route path="/questions/:id" element={<QuestionDetail />} />
      <Route path="/search" element={<SearchResult />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/messages" element={<MessagePage />} />

      {/* 🎥 Trang upload video */}
      <Route path="/upload-detail" element={<UploadDetailPage />} />

      {/* Admin Panel */}
      <Route path="/admin/approve" element={<ApprovePanel />} />
      <Route path="/admin/words" element={<FilteredWords />} />
      <Route path="/admin/stats" element={<Statistics />} />
      <Route path="/admin/questions" element={<AdminQuestionList />} />
      <Route path="/admin/users" element={<AdminUserList />} />
      <Route path="/admin/hashtags" element={<AdminHashtagManager />} />
      <Route path="/admin/moderation-logs" element={<ModerationLogs />} />
    </Routes>
  );
}

export default AppRouter;
