import React from "react";

const ProfileForm = ({ form, onChange, onSave }) => {
  return (
    <div>
      <input
        type="text"
        placeholder="Tên người dùng"
        name="username"
        value={form.username}
        onChange={onChange}
        className="w-full border p-2 mb-2"
      />
      <input
        type="text"
        placeholder="Mã định danh"
        name="identifier"
        value={form.identifier}
        onChange={onChange}
        className="w-full border p-2 mb-2"
      />
      <input
        type="email"
        value={form.email}
        disabled
        className="w-full border p-2 mb-2 bg-gray-100"
      />
      <input
        type="text"
        placeholder="Số điện thoại"
        name="phoneNumber"
        value={form.phoneNumber}
        onChange={onChange}
        className="w-full border p-2 mb-2"
      />
      <input
        type="text"
        placeholder="Địa chỉ"
        name="address"
        value={form.address}
        onChange={onChange}
        className="w-full border p-2 mb-4"
      />
      <button
        onClick={() => onSave()}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Lưu thay đổi
      </button>
    </div>
  );
};

export default ProfileForm;
