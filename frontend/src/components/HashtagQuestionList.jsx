import { useEffect, useState } from "react";
import axiosClient from "../services/axiosClient";
import { toast } from "react-hot-toast";

function HashtagQuestionList({ hashtagId, onClose }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestionsByHashtag = async () => {
      try {
        const response = await axiosClient.get(
          `/admin/hashtags/${hashtagId}/questions`
        );
        console.log("🔍 Dữ liệu câu hỏi theo hashtag:", response.data);
        setQuestions(response.data);
      } catch (error) {
        console.error("❌ Lỗi khi tải câu hỏi:", error);
        toast.error("Lỗi khi tải danh sách câu hỏi.");
      } finally {
        setLoading(false);
      }
    };

    if (hashtagId) {
      setLoading(true);
      fetchQuestionsByHashtag();
    }
  }, [hashtagId]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start pt-20 z-50">
      <div className="bg-white p-5 rounded-xl shadow-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-600 text-xl"
        >
          ✖
        </button>
        <h2 className="text-xl font-semibold mb-4">Danh sách câu hỏi</h2>

        {loading ? (
          <p>⏳ Đang tải...</p>
        ) : questions.length === 0 ? (
          <p>⚠️ Không có câu hỏi nào sử dụng hashtag này.</p>
        ) : (
          <ul className="space-y-4">
            {questions.map((q) => (
              <li
                key={q._id}
                className="border rounded-lg p-3 hover:bg-gray-50 transition"
              >
                <a
                  href={`/questions/${q._id}`}
                  className="text-blue-600 hover:underline text-base font-medium"
                  target="_blank"
                  rel="noreferrer"
                >
                  {q.title}
                </a>

                <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                  <img
                    src={q.author?.avatar || "/default-avatar.png"}
                    alt="avatar"
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <span>{q.author?.fullName || "Người dùng ẩn danh"}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default HashtagQuestionList;
