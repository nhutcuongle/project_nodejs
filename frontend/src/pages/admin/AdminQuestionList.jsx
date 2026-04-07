import React, { useEffect, useState } from "react";
import axios from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast"; 

function AdminQuestionList() {
  const [questions, setQuestions] = useState([]);
  const [expandedQuestionIds, setExpandedQuestionIds] = useState([]);
  const { token } = useAuth();

  const fetchQuestions = async () => {
    try {
      const res = await axios.get("/admin/questions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuestions(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy câu hỏi:", err);
      toast.error("Không thể tải danh sách câu hỏi.");
    }
  };

  const handleToggleHidden = async (id, current) => {
    try {
      await axios.patch(
        `/admin/questions/${id}`,
        { isHidden: !current },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchQuestions();
      toast.success(`Đã ${current ? "hiện" : "ẩn"} câu hỏi.`);
    } catch (err) {
      console.error("Lỗi khi ẩn/hiện:", err);
      toast.error("Không thể cập nhật trạng thái câu hỏi.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa câu hỏi này?")) return;
    try {
      await axios.delete(`/admin/questions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchQuestions();
      toast.success("Đã xóa câu hỏi.");
    } catch (err) {
      console.error("Lỗi khi xóa:", err);
      toast.error("Không thể xóa câu hỏi.");
    }
  };

  const toggleExpand = (questionId) => {
    setExpandedQuestionIds((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Quản lý Câu hỏi</h1>
      <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
        <table className="min-w-full table-auto text-sm text-left text-gray-700">
          <thead className="bg-gradient-to-r from-indigo-100 to-purple-100 text-gray-700">
            <tr>
              <th className="px-4 py-3">Người đăng</th>
              <th className="px-4 py-3">Tiêu đề</th>
              <th className="px-4 py-3">Nội dung</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q, index) => {
              return (
                <tr
                  key={q._id}
                  className={`transition duration-200 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-indigo-50`}
                >
                  <td className="px-4 py-3 font-medium">
                    {q.author?.username || "Ẩn danh"}
                  </td>
                  <td className="px-4 py-3 font-semibold text-indigo-700">
                    {q.title || "Không có tiêu đề"}
                  </td>
                  <td className="px-4 py-3 line-clamp-2">{q.content}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                        q.isHidden
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {q.isHidden ? "Đã ẩn" : "Đang hiển thị"}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => handleToggleHidden(q._id, q.isHidden)}
                      className="px-3 py-1 rounded-md text-white text-sm bg-yellow-500 hover:bg-yellow-600 transition duration-200 shadow-sm"
                    >
                      {q.isHidden ? "Hiện" : "Ẩn"}
                    </button>
                    <button
                      onClick={() => handleDelete(q._id)}
                      className="px-3 py-1 rounded-md text-white text-sm bg-red-500 hover:bg-red-600 transition duration-200 shadow-sm"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminQuestionList;
