import React, { useState } from "react";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Edit3, Trash2, X, Check, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";
import axios from "../services/axiosClient";

dayjs.extend(relativeTime);

function AnswerItem({
  answer,
  user,
  questionAuthorId,
  replyInputs,
  setReplyInputs,
  handleReplySubmit,
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(answer.content);
  const toggleReplyForm = () => setShowReplyForm((prev) => !prev);

  const isAuthor = user && (user._id === answer.author?._id || user.id === answer.author?._id);
  const isAdmin = user && user.role === "admin";

  const authorIdentifier = answer.author?.identifier || answer.author?._id;
  const replyKey = answer._id;
  const replyValue = replyInputs[replyKey] || "";
  const suggestedIdentifier = answer.author?.identifier || answer.author?._id;
  const prefillContent = `@${suggestedIdentifier} `;

  const handleTextareaFocus = () => {
    if (!replyValue.startsWith(`@${suggestedIdentifier}`)) {
      setReplyInputs((prev) => ({
        ...prev,
        [replyKey]: prefillContent + (prev[replyKey] || ""),
      }));
    }
  };

  const handleUpdate = async () => {
    if (!editContent.trim()) return;
    try {
      await axios.put(`/answers/${answer._id}`, { content: editContent });
      toast.success("Đã cập nhật câu trả lời");
      setIsEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi cập nhật");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa câu trả lời này?")) return;
    try {
      await axios.delete(`/answers/${answer._id}`);
      toast.success("Đã xóa câu trả lời");
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi xóa");
    }
  };

  const renderContentWithMentions = (text) => {
    if (!text) return null;
    return text.split(/(@\w+)/g).map((part, i) => {
      if (part.startsWith("@")) {
        const identifier = part.slice(1);
        return (
          <Link
            key={i}
            to={`/${identifier}`}
            className="text-blue-600 hover:underline font-medium"
          >
            {part}
          </Link>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="bg-white border-b border-gray-100 p-4 last:border-0 hover:bg-gray-50/50 transition-colors">
      {/* Header Info */}
      <div className="flex items-start justify-between group">
        <div className="flex items-start gap-3 flex-1">
          <Link to={`/${authorIdentifier}`}>
            <img
              src={answer.author?.avatar?.trim() || "https://www.gravatar.com/avatar?d=mp"}
              alt="avatar"
              className="w-10 h-10 rounded-full object-cover border border-gray-200"
            />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Link to={`/${authorIdentifier}`} className="font-semibold text-gray-900 hover:underline">
                {answer.author?.username || "Ẩn danh"}
              </Link>
              <span className="text-xs text-gray-400">
                {dayjs(answer.createdAt).fromNow()}
              </span>
            </div>

            {/* Content Area */}
            <div className="mt-1.5">
              {isEditing ? (
                <div className="mt-2">
                  <textarea
                    className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    rows={3}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                  />
                  <div className="flex gap-2 mt-2">
                    <button onClick={handleUpdate} className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-blue-700">
                      <Check size={14} /> Lưu
                    </button>
                    <button onClick={() => setIsEditing(false)} className="flex items-center gap-1 bg-gray-100 text-gray-600 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-gray-200">
                      <X size={14} /> Hủy
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">
                  {renderContentWithMentions(answer.content)}
                </p>
              )}
            </div>

            {/* Actions Bar */}
            {!isEditing && (
              <div className="flex items-center gap-5 mt-3">

                {/* Reply Button */}
                {user && (
                  <button onClick={toggleReplyForm} className="flex items-center gap-1 text-gray-500 hover:text-blue-600 text-xs font-medium transition-colors">
                    <MessageSquare size={14} /> Phản hồi
                  </button>
                )}

                {/* Author/Admin Actions */}
                <div className="flex items-center gap-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                  {isAuthor && (
                    <button onClick={() => { setIsEditing(true); setEditContent(answer.content); }} className="text-gray-400 hover:text-blue-600 transition-colors" title="Sửa bài">
                      <Edit3 size={15} />
                    </button>
                  )}
                  {(isAuthor || isAdmin) && (
                    <button onClick={handleDelete} className="text-gray-400 hover:text-red-500 transition-colors" title="Xóa bài">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reply Form */}
      {showReplyForm && (
        <div className="mt-4 ml-12">
          <form onSubmit={(e) => { handleReplySubmit(e, answer._id); setShowReplyForm(false); }}>
            <textarea
              className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50"
              placeholder={`Trả lời ${answer.author?.username}...`}
              value={replyValue}
              onFocus={handleTextareaFocus}
              onChange={(e) => setReplyInputs({ ...replyInputs, [replyKey]: e.target.value })}
            />
            <div className="flex justify-end gap-2 mt-2">
              <button type="button" onClick={() => setShowReplyForm(false)} className="px-4 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 rounded-lg">
                Hủy
              </button>
              <button type="submit" className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 shadow-sm shadow-blue-200">
                Gửi phản hồi
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default AnswerItem;
