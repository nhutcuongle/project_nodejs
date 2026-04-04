import { useEffect, useState, useContext } from "react";
import { X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { SocketContext } from "../../context/SocketContext";
import commentService from "../../services/commentService";
import CommentItem from "./CommentItem";

export default function CommentSidebar({ videoId, onClose, visible }) {
  const { user, token } = useAuth();
  const { socket } = useContext(SocketContext);

  const [comments, setComments] = useState([]);
  const [totalComments, setTotalComments] = useState(0); // ✅ tổng số comment
  const [text, setText] = useState("");

  useEffect(() => {
    if (!socket) return;

    // Xóa bình luận realtime
    const handleCommentDeleted = ({ commentId }) => {
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      setTotalComments((prev) => prev - 1);
    };

    socket.on("comment_deleted", handleCommentDeleted);

    return () => {
      socket.off("comment_deleted", handleCommentDeleted);
    };
  }, [socket]);

  // Fetch comments khi load sidebar hoặc videoId thay đổi
  useEffect(() => {
    if (!videoId) return;

    const fetchComments = async () => {
      try {
        const data = await commentService.getComments(videoId);
        setComments(data);

        // Tổng số comment = comments + tất cả replies
        const totalReplies = data.reduce(
          (acc, c) => acc + (c.replyCount || 0),
          0
        );
        setTotalComments(data.length + totalReplies);
      } catch (err) {
        console.error("Lỗi tải bình luận:", err);
      }
    };
    fetchComments();

    // Join room video để nhận realtime
    socket?.emit("join_video", videoId);

    // Khi có comment mới realtime
    const handleNewComment = (comment) => {
      if (comment.video === videoId) {
        setComments((prev) => [comment, ...prev]);
        setTotalComments((prev) => prev + 1); // cập nhật tổng comment
      }
    };

    // Khi có người tym comment realtime
    const handleCommentLiked = ({ commentId, userId, isLiked }) => {
      setComments((prev) =>
        prev.map((c) => {
          if (c._id !== commentId) return c;

          let newLikes;
          if (isLiked) {
            newLikes = [...c.likes, userId];
          } else {
            newLikes = c.likes.filter((id) => id !== userId);
          }

          return { ...c, likes: newLikes };
        })
      );
    };

    // Khi có người sửa comment realtime
    const handleCommentUpdated = (updated) => {
      setComments((prev) =>
        prev.map((c) => (c._id === updated._id ? updated : c))
      );
    };

    socket?.on("new_comment", handleNewComment);
    socket?.on("comment_liked", handleCommentLiked);
    socket?.on("comment_updated", handleCommentUpdated);

    return () => {
      socket?.emit("leave_video", videoId);
      socket?.off("new_comment", handleNewComment);
      socket?.off("comment_liked", handleCommentLiked);
      socket?.off("comment_updated", handleCommentUpdated);
    };
  }, [videoId, socket]);
  useEffect(() => {
    if (!socket) return;

    const handleUpdateCommentsCount = ({ totalComments }) => {
      setTotalComments(totalComments);
    };

    socket.on("updateCommentsCount", handleUpdateCommentsCount);

    return () => {
      socket.off("updateCommentsCount", handleUpdateCommentsCount);
    };
  }, [socket]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await commentService.addComment(videoId, text, token);
      // Không cần setComments hay emit socket ở đây nữa vì server-side service đã emit 'new_comment' cho room
      setText("");
    } catch {
      alert("Không thể gửi bình luận");
    }
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-[420px] bg-[#121212] text-white z-50 flex flex-col shadow-lg transition-transform duration-500 ${
        visible ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-800">
        <h2 className="text-lg font-semibold">Bình luận ({totalComments})</h2>
        <button onClick={onClose}>
          <X size={22} className="text-gray-300 hover:text-white" />
        </button>
      </div>

      {/* Danh sách bình luận */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-400 text-sm">Chưa có bình luận nào.</p>
        ) : (
          comments.map((c) => <CommentItem key={c._id} comment={c} socket={socket} />)
        )}
      </div>

      {/* Form bình luận */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-gray-800 p-3 flex gap-2 bg-[#1a1a1a]"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Thêm bình luận..."
          className="flex-1 bg-[#2a2a2a] rounded-full px-4 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-500"
        />
        <button
          type="submit"
          className="bg-red-500 hover:bg-red-600 px-4 py-2 text-sm rounded-full"
        >
          Đăng
        </button>
      </form>
    </div>
  );
}
