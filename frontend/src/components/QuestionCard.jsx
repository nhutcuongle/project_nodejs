import { Link } from "react-router-dom";
import HashtagList from "./HashtagList";
import QuestionMeta from "./QuestionMeta";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { useState } from "react";

function QuestionCard({ question, activeTab, fetchQuestions }) {
  const { token } = useAuth();
  const [localVote, setLocalVote] = useState(question.userVote);
  const [upvotes, setUpvotes] = useState(question.upvotes || 0);
  const [downvotes, setDownvotes] = useState(question.downvotes || 0);

  const handleVote = async (type) => {
    if (!token) {
      toast.error("Vui lòng đăng nhập để bình chọn");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/votes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetType: "question",
          targetId: question._id,
          voteType: type === "upvote" ? "up" : "down",
        }),
      });

      if (!res.ok) throw new Error("Vote failed");

      // Cập nhật giao diện tạm thời (optimistic UI)
      if (type === "upvote") {
        setLocalVote((prev) => (prev === "up" ? null : "up"));
        setUpvotes((prev) => (localVote === "up" ? prev - 1 : prev + 1));
        if (localVote === "down") setDownvotes((prev) => prev - 1);
      } else {
        setLocalVote((prev) => (prev === "down" ? null : "down"));
        setDownvotes((prev) => (localVote === "down" ? prev - 1 : prev + 1));
        if (localVote === "up") setUpvotes((prev) => prev - 1);
      }

      fetchQuestions?.(); // Optional: tải lại nếu cần đồng bộ
    } catch {
      toast.error("Lỗi khi bình chọn");
    }
  };

  return (
    <div className="relative border p-4 rounded shadow">
      <QuestionMeta
        question={question}
        activeTab={activeTab}
        fetchQuestions={fetchQuestions}
      />

      <hr className="my-2 border-gray-300" />

      <Link to={`/questions/${question._id}`}>
        <h3 className="text-lg font-semibold text-blue-600 hover:underline">
          {question.title}
        </h3>
      </Link>

      <p className="text-gray-700 mt-1">
        {question.content.length > 20 ? (
          <>
            {question.content.substring(0, 20)}...
            <Link
              to={`/questions/${question._id}`}
              className="text-blue-500 hover:underline ml-1"
            >
              Xem thêm
            </Link>
          </>
        ) : (
          question.content
        )}
      </p>

      <HashtagList hashtags={question.hashtags} />

      <div className="flex items-center mt-3 space-x-4">
        <button
          onClick={() => handleVote("upvote")}
          className={`hover:underline ${
            localVote === "up" ? "text-green-800 font-bold" : "text-green-600"
          }`}
        >
          👍 {upvotes}
        </button>
        <button
          onClick={() => handleVote("downvote")}
          className={`hover:underline ${
            localVote === "down"
              ? "text-red-800 font-bold"
              : "text-red-600"
          }`}
        >
          👎 {downvotes}
        </button>
        <span className="text-blue-600">
          💬 {question.answerCount || 0} trả lời
        </span>
      </div>
    </div>
  );
}

export default QuestionCard;
