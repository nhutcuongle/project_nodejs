import React, { useRef } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import { BsBookmark, BsBookmarkFill } from "react-icons/bs";
import useClickOutside from "../hooks/useClickOutside";
import { Link } from "react-router-dom";
import AnswerForm from "./AnswerForm";
dayjs.extend(relativeTime);
dayjs.locale("vi");

const QuestionContent = ({
  question,
  showAllImages,
  setShowAllImages,
  handleVote,
  userVote,
  token,
  handleSave,
  handleUnsave,
  showAnswerForm,
  setShowAnswerForm,
  newAnswer, // 👈 thêm
  setNewAnswer, // 👈 thêm
  handleSubmit,
}) => {
  const formRef = useRef(); // ✅ Khởi tạo ref cho form
  useClickOutside(formRef, () => setShowAnswerForm(false), showAnswerForm); // ✅ Kích hoạt ẩn khi click ngoài

  return (
    <div className="bg-white rounded shadow p-4 mb-6">
      {/* Người đăng + avatar + thời gian */}
      <div className="flex items-center gap-3 mb-4">
        <Link
          to={`/users/${question.author?.identifier || question.author?._id}`}
        >
          <img
            src={
              question.author?.avatar || "https://www.gravatar.com/avatar?d=mp"
            }
            alt="avatar"
            className="w-10 h-10 rounded-full border object-cover hover:opacity-80"
          />
        </Link>
        <div>
          <p className="font-semibold text-gray-800">
            {question.author?.username || "Ẩn danh"}
          </p>
          <p className="text-sm text-gray-500">
            🕒 {dayjs(question.createdAt).fromNow()}
          </p>
        </div>

        {/* Bookmark */}
        {token && (
          <button
            onClick={() =>
              question.savedByUser
                ? handleUnsave(question._id)
                : handleSave(question._id)
            }
            className="ml-auto p-2 rounded-full hover:bg-gray-100"
            title={question.savedByUser ? "Bỏ lưu" : "Lưu câu hỏi"}
          >
            {question.savedByUser ? (
              <BsBookmarkFill className="text-yellow-500" />
            ) : (
              <BsBookmark className="text-gray-500" />
            )}
          </button>
        )}
      </div>

      {/* Tiêu đề + nội dung */}
      <h1 className="text-2xl font-bold mb-2 text-blue-600">
        {question.title}
      </h1>
      <p className="text-gray-800 mb-3">{question.content}</p>

      {/* Hình ảnh */}
      {question.images?.length > 0 && (
        <div className="my-4">
          {!showAllImages ? (
            <div
              className="relative inline-block cursor-pointer"
              onClick={() => setShowAllImages(true)}
            >
              <img
                src={
                  typeof question.images[0] === "string"
                    ? question.images[0]
                    : question.images[0]?.url
                }
                alt="preview"
                className="w-64 h-auto rounded shadow"
              />
              {question.images.length > 1 && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-semibold text-lg rounded">
                  Xem thêm
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {question.images.map((img, index) => {
                const url = typeof img === "string" ? img : img?.url;
                const key =
                  typeof img === "object" && img?._id
                    ? img._id
                    : `${url}-${index}`;
                return (
                  <img
                    key={key}
                    src={url}
                    alt={`image-${index}`}
                    className="w-48 h-auto rounded shadow"
                  />
                );
              })}
              <button
                onClick={() => setShowAllImages(false)}
                className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 font-medium rounded hover:bg-blue-200"
              >
                Ẩn bớt
              </button>
            </div>
          )}
        </div>
      )}

      {/* Hashtags */}
      {question.hashtags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {question.hashtags.map((tag, index) => {
            const key = tag?._id || `${tag?.name || "tag"}-${index}`;
            return (
              <span
                key={key}
                className="px-2 py-1 text-sm bg-gray-200 text-gray-800 rounded-full"
              >
                {tag?.name || "hashtag"}
              </span>
            );
          })}
        </div>
      )}

      {/* Vote + Trả lời */}
      <div className="flex items-center mt-4 space-x-4">
        <button
          onClick={() => handleVote(question._id, "upvote")}
          className={`hover:underline ${
            userVote === "up" ? "text-green-800 font-bold" : "text-green-600"
          }`}
        >
          👍 {question.upvotes || 0}
        </button>
        <button
          onClick={() => handleVote(question._id, "downvote")}
          className={`hover:underline ${
            userVote === "down" ? "text-red-800 font-bold" : "text-red-600"
          }`}
        >
          👎 {question.downvotes || 0}
        </button>

        {/* Nút Trả lời */}
        {token && (
          <button
            onClick={() => setShowAnswerForm((prev) => !prev)}
            className="text-blue-600 hover:underline text-sm"
          >
            {showAnswerForm ? "Ẩn trả lời" : "Trả lời"}
          </button>
        )}
      </div>

      {/* Form trả lời (nếu có) */}
      {token && showAnswerForm && (
        <div className="mt-4" ref={formRef}>
          <AnswerForm
            newAnswer={newAnswer}
            setNewAnswer={setNewAnswer}
            handleSubmit={(e) => {
              handleSubmit(e);
              setShowAnswerForm(false);
            }}
          />
        </div>
      )}

      <hr className="my-4" />
    </div>
  );
};

export default QuestionContent;
