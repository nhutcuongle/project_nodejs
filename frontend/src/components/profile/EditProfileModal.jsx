export default function EditProfileModal({ form, setForm, onSave, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 overflow-y-auto z-50">
      {/* lớp bao để căn giữa ngang, có padding top-bottom */}
      <div className="min-h-screen flex justify-center items-start py-10">
        <div className="bg-neutral-900 text-white w-full max-w-lg rounded-2xl p-6 relative shadow-lg">
          {/* ❌ Nút đóng */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-white text-lg"
          >
            ✕
          </button>

          <h2 className="text-2xl font-semibold mb-6 text-center">Sửa hồ sơ</h2>

          {/* Ảnh đại diện */}
          <div className="flex flex-col items-center mb-6">
            <img
              src={form.avatar || "https://www.gravatar.com/avatar?d=mp"}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover mb-2"
            />
            <label className="text-sm text-blue-400 cursor-pointer hover:underline">
              Thay đổi ảnh
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    avatarFile: e.target.files[0],
                  }))
                }
              />
            </label>
          </div>

          {/* TikTok ID */}
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-1">
              Pro ID
            </label>
            <input
              type="text"
              name="identifier"
              value={form.identifier || ""}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, identifier: e.target.value }))
              }
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-white"
            />
          </div>

          {/* Tên người dùng */}
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-1">
              Tên người dùng
            </label>
            <input
              type="text"
              name="username"
              value={form.username || ""}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, username: e.target.value }))
              }
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-white"
            />
          </div>

          {/* Tiểu sử */}
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-1">Tiểu sử</label>
            <textarea
              name="bio"
              value={form.bio || ""}
              maxLength={80}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, bio: e.target.value }))
              }
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-white resize-none"
            />
            <p className="text-right text-xs text-gray-500">
              {form.bio?.length || 0}/80
            </p>
          </div>

          {/* Số điện thoại */}
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-1">
              Số điện thoại
            </label>
            <input
              type="text"
              name="phoneNumber"
              value={form.phoneNumber || ""}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, phoneNumber: e.target.value }))
              }
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-white"
            />
          </div>

          {/* Địa chỉ */}
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-1">Địa chỉ</label>
            <input
              type="text"
              name="address"
              value={form.address || ""}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, address: e.target.value }))
              }
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-white"
            />
          </div>

          {/* Nút hành động */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 transition"
            >
              Hủy
            </button>
            <button
              onClick={() => onSave(form)}
              className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 transition font-semibold"
            >
              Lưu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
