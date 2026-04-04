import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import commentService from "../../services/commentService";
import replyService from "../../services/replyService";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import ReplyList from "./ReplyList";
import ThreeDotMenu from "../UI/ThreeDotMenu";

// Modal xác nhận xóa
function ConfirmModal({ open, title, message, onCancel, onConfirm }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 text-gray-100 rounded-lg shadow-lg w-80 p-5 flex flex-col gap-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p>{message}</p>

        <div className="flex justify-end gap-3 mt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded bg-red-600 hover:bg-red-500"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CommentItem({ comment, socket }) {
  const { token, user } = useAuth();

  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReplyInput, setShowReplyInput] = useState(false);

  const [isLiked, setIsLiked] = useState(comment.likes?.includes(user?._id));
  const [likesCount, setLikesCount] = useState(comment.likes?.length || 0);

  const [replyCount, setReplyCount] = useState(comment.replyCount || 0); // ✅ thêm state replyCount
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [currentText, setCurrentText] = useState(comment.text);
  const [isEdited, setIsEdited] = useState(comment.isEdited);

  // Cập nhật like realtime
  useEffect(() => {
    setIsLiked(comment.likes?.includes(user?._id));
    setLikesCount(comment.likes?.length || 0);
  }, [comment.likes, user?._id]);

  // Lắng nghe reply thêm/xóa realtime
  useEffect(() => {
    if (!socket) return;

    const handleReplyDeleted = ({ commentId: cId }) => {
      if (cId === comment._id) setReplyCount(prev => Math.max(prev - 1, 0));
    };

    const handleNewReply = (r) => {
      if (r.comment === comment._id) setReplyCount(prev => prev + 1);
    };

    const handleCommentUpdated = (updated) => {
      if (updated._id === comment._id) {
        setCurrentText(updated.text);
        setIsEdited(updated.isEdited);
        setEditText(updated.text);
      }
    };

    socket.on("reply_deleted", handleReplyDeleted);
    socket.on("new_reply", handleNewReply);
    socket.on("comment_updated", handleCommentUpdated);

    return () => {
      socket.off("reply_deleted", handleReplyDeleted);
      socket.off("new_reply", handleNewReply);
      socket.off("comment_updated", handleCommentUpdated);
    };
  }, [socket, comment._id]);

  // Xóa bình luận
  const handleDelete = async () => {
    try {
      await commentService.deleteComment(comment._id, token);
      toast.success("Đã xóa bình luận");
      setShowDeleteModal(false);
      // socket?.emit("delete_comment", ...) -> Đã có server emit
    } catch {
      toast.error("Không thể xóa bình luận");
    }
  };

  // Sửa bình luận
  const handleEditSubmit = async () => {
    if (!editText.trim() || editText === currentText) {
      setIsEditing(false);
      return;
    }

    try {
      await commentService.editComment(comment._id, editText, token);
      toast.success("Đã cập nhật bình luận");
      setIsEditing(false);
    } catch {
      toast.error("Không thể cập nhật bình luận");
    }
  };

  // Tym
  const handleLike = async () => {
    if (!user) return toast.error("Vui lòng đăng nhập để tym");

    try {
      const res = await commentService.toggleLike(comment._id, token);

      setIsLiked(res.isLiked);
      setLikesCount(res.likesCount);
      // socket?.emit("like_comment", ...) -> Đã có server emit
    } catch {
      toast.error("Không thể tym bình luận");
    }
  };

  // Gửi reply
  const handleReplySubmit = async () => {
    if (!replyText.trim()) return;

    try {
      await replyService.addReply(comment._id, replyText, token);

      toast.success("Đã gửi phản hồi!");

      setReplyText("");
      setShowReplyInput(false);
      if (!showReplies) setShowReplies(true);
      // socket?.emit("new_reply", ...) -> Đã có server emit
    } catch {
      toast.error("Không thể gửi phản hồi");
    }
  };

  return (
    <div className="flex gap-3 text-gray-100 mb-6 relative">
      {/* Avatar */}
      <img
        src={comment.user?.avatar || "/default-avatar.png"}
        alt="avatar"
        className="w-10 h-10 rounded-full border border-gray-700 object-cover"
      />

      <div className="flex-1">
        {/* Header */}
        <div className="flex justify-between items-start">
          <p className="font-semibold text-[15px] text-gray-200">
            {comment.user?.username || "Ẩn danh"}
          </p>

          {user?._id === comment.user?._id && (
            <ThreeDotMenu 
               onDelete={() => setShowDeleteModal(true)} 
               onEdit={() => setIsEditing(true)} // ✅ thêm nút sửa
            />
          )}
        </div>

        {/* Nội dung bình luận */}
        {isEditing ? (
          <div className="mt-2 flex flex-col gap-2">
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full bg-gray-800 p-2 rounded-lg text-sm border border-gray-700 focus:border-blue-400 outline-none"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleEditSubmit();
                if (e.key === "Escape") setIsEditing(false);
              }}
            />
            <div className="flex gap-2 text-[12px]">
              <button onClick={handleEditSubmit} className="text-blue-400 font-medium">Lưu</button>
              <button onClick={() => setIsEditing(false)} className="text-gray-400">Hủy</button>
            </div>
          </div>
        ) : (
          <p className="text-[15px] leading-snug mt-1 text-gray-100">
            {currentText}
            {isEdited && (
              <span className="text-[12px] text-gray-500 ml-2 italic">
                (Đã chỉnh sửa)
              </span>
            )}
          </p>
        )}

        {/* Hành động */}
        <div className="mt-2 flex items-center gap-4 text-[13px] text-gray-400">
          <span>{comment.timeAgo || "vừa xong"}</span>
          <button
            className="hover:text-gray-200"
            onClick={() => setShowReplyInput(x => !x)}
          >
            Trả lời
          </button>

          {/* Tym */}
          <div
            className="flex items-center gap-1 ml-10 cursor-pointer"
            onClick={handleLike}
          >
            <Heart
              size={14}
              className={`transition ${
                isLiked ? "text-red-500 fill-red-500" : "hover:text-red-500"
              }`}
            />
            <span>{likesCount}</span>
          </div>
        </div>

        {/* Ô nhập reply */}
        {showReplyInput && (
          <div className="mt-2 ml-12 flex flex-col gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Viết phản hồi..."
              className="w-full bg-gray-800 p-2 rounded-lg text-sm border border-gray-700 focus:border-blue-400 outline-none"
            />
            <div className="flex justify-end">
              <button
                onClick={handleReplySubmit}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
              >
                Gửi
              </button>
            </div>
          </div>
        )}

        {/* Xem reply */}
        {replyCount > 0 && !showReplies && (
          <button
            onClick={() => setShowReplies(true)}
            className="mt-3 ml-10 text-[13px] text-gray-400 hover:text-gray-200"
          >
            Xem {replyCount} phản hồi
          </button>
        )}

        {showReplies && (
          <div className="mt-6">
            <ReplyList commentId={comment._id} onHide={() => setShowReplies(false)} />
          </div>
        )}
      </div>

      {/* Modal xóa */}
      <ConfirmModal
        open={showDeleteModal}
        title="Xác nhận xóa bình luận"
        message="Bạn có chắc muốn xóa bình luận này không?"
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
