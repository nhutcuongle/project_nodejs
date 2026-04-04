import React from "react";

const ReplyItem = ({ reply, renderReplies }) => {
  return (
    <div key={reply._id} className="ml-6 mt-2 border-l-2 pl-4">
      <p>{reply.content}</p>
      <p className="text-sm text-gray-400">
        Người dùng {reply.author?.username || "Ẩn danh"} đã phản hồi.
      </p>
      {renderReplies(reply._id)}
    </div>
  );
};

export default ReplyItem;
