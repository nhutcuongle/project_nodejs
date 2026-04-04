import React, { useState } from "react";
import PasswordForm from "../components/profile/PasswordForm";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("password");

  // 🧩 Thêm state quản lý form đổi mật khẩu
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });

  // 🧩 Hàm xử lý đổi mật khẩu
  const onChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      // Gửi request API đổi mật khẩu ở đây
      // (bạn có thể thay bằng axios.post("/api/users/change-password", passwordForm))
      console.log("🔒 Gửi đổi mật khẩu:", passwordForm);

      alert("Đổi mật khẩu thành công!");
      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch (error) {
      console.error("Lỗi khi đổi mật khẩu:", error);
      alert("Đổi mật khẩu thất bại!");
    }
  };

  return (
    <div className="w-full min-h-screen bg-black text-white flex">
      {/* Cột trái */}
      <div className="w-64 bg-neutral-900 border-r border-neutral-800 p-4 flex flex-col gap-2">
        <h2 className="text-lg font-semibold mb-3">Cài đặt</h2>

        <button
          onClick={() => setActiveTab("password")}
          className={`text-left px-3 py-2 rounded-lg ${
            activeTab === "password"
              ? "bg-red-500 text-white"
              : "hover:bg-neutral-800"
          }`}
        >
          Đổi mật khẩu
        </button>

        <button
          onClick={() => setActiveTab("privacy")}
          className={`text-left px-3 py-2 rounded-lg ${
            activeTab === "privacy"
              ? "bg-red-500 text-white"
              : "hover:bg-neutral-800"
          }`}
        >
          Quyền riêng tư
        </button>
      </div>

      {/* Cột phải */}
      <div className="flex-1 p-8">
        {activeTab === "password" && (
          <PasswordForm
            passwordForm={passwordForm}
            setPasswordForm={setPasswordForm}
            onChangePassword={onChangePassword}
          />
        )}

        {activeTab === "privacy" && (
          <p className="text-gray-400">
            Tính năng quyền riêng tư đang phát triển...
          </p>
        )}
      </div>
    </div>
  );
}
