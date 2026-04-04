import React from "react";

const InfoSection = ({ username, identifier, bio, createdAt }) => (
  <div className="flex-1 text-center sm:text-left">
    <div className="flex flex-row items-center gap-3">
      <p className="text-2xl text-gray-300 font-semibold">@{identifier}</p>
      <h2 className="text-2xl font-extrabold">{username}</h2>
    </div>
    {createdAt && (
      <p className="text-gray-500 text-sm mt-1">
        Tham gia: {new Date(createdAt).toLocaleDateString("vi-VN")}
      </p>
    )}
  </div>
);

export default InfoSection;
