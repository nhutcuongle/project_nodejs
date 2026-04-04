import React from "react";

const PasswordForm = ({ passwordForm, setPasswordForm, onChangePassword }) => {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-2">🔒 Đổi mật khẩu</h3>

      <input
        type="password"
        placeholder="Mật khẩu hiện tại"
        name="currentPassword"
        value={passwordForm.currentPassword}
        onChange={(e) =>
          setPasswordForm((prev) => ({
            ...prev,
            currentPassword: e.target.value,
          }))
        }
        className="w-full border p-2 mb-2"
      />
      <input
        type="password"
        placeholder="Mật khẩu mới"
        name="newPassword"
        value={passwordForm.newPassword}
        onChange={(e) =>
          setPasswordForm((prev) => ({
            ...prev,
            newPassword: e.target.value,
          }))
        }
        className="w-full border p-2 mb-4"
      />
      <button
        onClick={onChangePassword}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Đổi mật khẩu
      </button>
    </div>
  );
};

export default PasswordForm;
