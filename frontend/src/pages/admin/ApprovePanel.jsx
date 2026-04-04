import { useEffect, useState } from "react";

const ITEMS_PER_PAGE = 5;

const ApprovePanel = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [questionPage, setQuestionPage] = useState(1);
  const [answerPage, setAnswerPage] = useState(1);

  useEffect(() => {
    fetchPendingItems();
  }, []);

  const fetchPendingItems = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/moderation/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      setQuestions(data.questions || []);
      setAnswers(data.answers || []);
    } catch (err) {
      console.error("Failed to fetch pending items:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (item, type) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/api/moderation/approve", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetType: type, targetId: item._id }),
      });

      if (res.ok) {
        if (type === "question") {
          setQuestions((prev) => prev.filter((q) => q._id !== item._id));
        } else {
          setAnswers((prev) => prev.filter((a) => a._id !== item._id));
        }
      } else {
        alert("Phê duyệt thất bại");
      }
    } catch (err) {
      console.error("Approve error:", err);
    }
  };

  const handleDelete = async (item, type) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/api/moderation/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetType: type, targetId: item._id }),
      });

      if (res.ok) {
        if (type === "question") {
          setQuestions((prev) => prev.filter((q) => q._id !== item._id));
        } else {
          setAnswers((prev) => prev.filter((a) => a._id !== item._id));
        }
      } else {
        alert("Xoá thất bại");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const paginate = (items, page) =>
    items.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const totalQuestionPages = Math.ceil(questions.length / ITEMS_PER_PAGE);
  const totalAnswerPages = Math.ceil(answers.length / ITEMS_PER_PAGE);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-10">
      <h1 className="text-3xl font-bold text-gray-800">
        🕵️ Danh sách chờ duyệt
      </h1>

      {loading ? (
        <p className="text-gray-600">Đang tải dữ liệu...</p>
      ) : (
        <>
          {/* ====== BẢNG CÂU HỎI ====== */}
          <div>
            <h2 className="text-xl font-semibold mb-2">📋 Câu hỏi chờ duyệt</h2>
            <div className="rounded-xl overflow-hidden shadow-lg bg-white">
              <table className="min-w-full table-auto text-sm text-left">
                <thead className="bg-blue-50 text-gray-700">
                  <tr>
                    <th className="px-4 py-3">🧠 Tiêu đề</th>
                    <th className="px-4 py-3">🏷️ Hashtag</th>
                    <th className="px-4 py-3">📄 Nội dung</th>
                    <th className="px-4 py-3">👤 Người đăng</th>
                    <th className="px-4 py-3">⚙️ Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {paginate(questions, questionPage).map((q, idx) => (
                    <tr
                      key={q._id}
                      className={`transition duration-200 ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-blue-50`}
                    >
                      <td className="px-4 py-3 text-indigo-700 font-medium">
                        {q.title}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {q.hashtags?.map((tag) => (
                            <span
                              key={tag._id}
                              className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs"
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">{q.content}</td>
                      <td className="px-4 py-3">
                        {q.author?.username || "Ẩn danh"}
                      </td>
                      <td className="px-4 py-3 flex gap-2">
                        <button
                          onClick={() => handleApprove(q, "question")}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm"
                        >
                          Duyệt
                        </button>
                        <button
                          onClick={() => handleDelete(q, "question")}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
                        >
                          Xoá
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* PHÂN TRANG CÂU HỎI */}
              <div className="flex justify-center p-3 gap-2">
                {Array.from({ length: totalQuestionPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setQuestionPage(i + 1)}
                    className={`px-3 py-1 text-sm rounded-md ${
                      questionPage === i + 1
                        ? "bg-indigo-500 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ====== BẢNG TRẢ LỜI ====== */}
          <div>
            <h2 className="text-xl font-semibold mb-2">📝 Trả lời chờ duyệt</h2>
            <div className="rounded-xl overflow-hidden shadow-lg bg-white">
              <table className="min-w-full table-auto text-sm text-left">
                <thead className="bg-purple-50 text-gray-700">
                  <tr>
                    <th className="px-4 py-3">📄 Nội dung</th>
                    <th className="px-4 py-3">👤 Người đăng</th>
                    <th className="px-4 py-3">⚙️ Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {paginate(answers, answerPage).map((a, idx) => (
                    <tr
                      key={a._id}
                      className={`transition duration-200 ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-purple-50`}
                    >
                      <td className="px-4 py-3">{a.content}</td>
                      <td className="px-4 py-3">
                        {a.author?.username || "Ẩn danh"}
                      </td>
                      <td className="px-4 py-3 flex gap-2">
                        <button
                          onClick={() => handleApprove(a, "answer")}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm"
                        >
                          Duyệt
                        </button>
                        <button
                          onClick={() => handleDelete(a, "answer")}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
                        >
                          Xoá
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* PHÂN TRANG TRẢ LỜI */}
              <div className="flex justify-center p-3 gap-2">
                {Array.from({ length: totalAnswerPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setAnswerPage(i + 1)}
                    className={`px-3 py-1 text-sm rounded-md ${
                      answerPage === i + 1
                        ? "bg-purple-500 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ApprovePanel;
