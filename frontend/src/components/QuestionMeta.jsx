import {
  BsBookmark,
  BsBookmarkFill,
  BsEye,
  BsEyeSlash,
  BsTrash,
} from "react-icons/bs";
import { useAuth } from "../context/AuthContext";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { useState } from "react";

function QuestionMeta({ question, activeTab, fetchQuestions }) {
  const { user, token } = useAuth();
  const [isSaved, setIsSaved] = useState(question.savedByUser);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false); // 👈 Modal state

  const toggleSave = async () => {
    try {
      const url = isSaved ? "unsave" : "save";
      const res = await fetch(
        `http://localhost:5000/api/bookmarks/${url}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ targetId: question._id, targetType: "Question" }),
        }
      );

      if (!res.ok) throw new Error();
      toast.success(isSaved ? "Đã bỏ lưu" : "Đã lưu câu hỏi", {
        position: "top-center",
      });
      setIsSaved(!isSaved);
      fetchQuestions?.();
    } catch {
      toast.error("Lỗi khi cập nhật lưu", { position: "top-center" });
    }
  };

  const toggleHide = async () => {
    try {
      const action = activeTab === "hidden" ? "unhide" : "hide";
      await fetch(
        `http://localhost:5000/api/questions/${question._id}/${action}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(action === "hide" ? "Đã ẩn câu hỏi" : "Đã hiện câu hỏi", {
        position: "top-center",
      });
      fetchQuestions?.();
    } catch {
      toast.error("Lỗi khi cập nhật trạng thái câu hỏi", {
        position: "top-center",
      });
    }
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/questions/${question._id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error();
      toast.success("🗑️ Đã xóa câu hỏi", { position: "top-center" });
      fetchQuestions?.();
    } catch {
      toast.error("Lỗi khi xóa câu hỏi", { position: "top-center" });
    } finally {
      setShowConfirmDelete(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 mb-2">
        <Link
          to={`/${question.author?.identifier}`} 
          className="flex items-center gap-2"
        >
          <img
            src={
              question.author?.avatar || "https://www.gravatar.com/avatar?d=mp"
            }
            alt="avatar"
            className="w-8 h-8 rounded-full object-cover border"
          />
          <div>
            <p className="font-semibold text-gray-800 hover:underline">
              {question.author?.username || "Ẩn danh"}
            </p>
            <p className="text-xs text-gray-500">
              🕒 {dayjs(question.createdAt).fromNow()}
            </p>
          </div>
        </Link>

        {token && (
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={toggleSave}
              className="p-1 hover:bg-gray-100 rounded-full group"
              title={isSaved ? "Bỏ lưu" : "Lưu câu hỏi"}
            >
              {isSaved ? (
                <BsBookmarkFill className="text-yellow-500" />
              ) : (
                <BsBookmark className="text-gray-500 group-hover:text-gray-700" />
              )}
            </button>

            {question.author?._id === user?._id && (
              <>
                <button
                  onClick={toggleHide}
                  className="p-1 hover:bg-gray-100 rounded-full"
                  title={activeTab === "hidden" ? "Hiện câu hỏi" : "Ẩn câu hỏi"}
                >
                  {activeTab === "hidden" ? (
                    <BsEye className="text-gray-500" />
                  ) : (
                    <BsEyeSlash className="text-gray-500" />
                  )}
                </button>

                <button
                  onClick={() => setShowConfirmDelete(true)}
                  className="p-1 hover:bg-red-100 rounded-full"
                  title="Xóa câu hỏi"
                >
                  <BsTrash className="text-red-500" />
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* ✅ Modal xác nhận xóa */}
      {showConfirmDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm w-full">
            <h2 className="text-lg font-bold text-red-600 mb-2">
              Xác nhận xóa
            </h2>
            <p className="mb-4 text-gray-700">
              Bạn có chắc chắn muốn xóa câu hỏi này không?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-gray-700"
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default QuestionMeta;
