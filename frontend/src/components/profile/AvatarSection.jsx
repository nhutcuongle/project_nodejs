import React from "react";

const AvatarSection = ({ avatarUrl, isMe, onUpload }) => {
  return (
    <div className="relative group cursor-pointer">
      <img
        src={avatarUrl || "/default-avatar.png"}
        alt="avatar"
        className="w-48 h-48 sm:w-56 sm:h-56 rounded-full object-cover shadow-lg transition-all duration-300 group-hover:opacity-80"
      />
      {isMe && (
        <>
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 transition">
            <span className="text-white text-3xl font-bold">+</span>
          </div>
          <input
            type="file"
            onChange={onUpload}
            accept="image/*"
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </>
      )}
    </div>
  );
};

export default AvatarSection;
