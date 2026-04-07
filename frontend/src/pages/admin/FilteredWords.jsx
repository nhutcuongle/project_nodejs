import { useEffect, useState } from "react";
import axios from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

const FilteredWords = () => {
  const { token } = useAuth();
  const [textWords, setTextWords] = useState([]);
  const [newTextWord, setNewTextWord] = useState("");
  const [action, setAction] = useState("pending");

  const fetchWords = async () => {
    try {
      const res = await axios.get("/filtered-words", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Lọc bỏ hashtag (nếu còn sót từ DB) vì ta không dùng nữa
      setTextWords(res.data.filter((w) => w.type !== "hashtag"));
    } catch (err) {
      console.error("Lỗi tải danh sách từ cấm:", err);
    }
  };

  useEffect(() => {
    fetchWords();
  }, []);

  const handleAdd = async () => {
    if (!newTextWord.trim()) return;
    try {
      const payload = { 
        word: newTextWord, 
        type: "text", 
        action 
      };
      
      const res = await axios.post("/filtered-words", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Thông thường backend trả về { word: { ... } } hoặc trực tiếp { ... }
      const addedWord = res.data.word || res.data;
      setTextWords((prev) => [...prev, addedWord]);
      setNewTextWord("");
    } catch (err) {
      console.error("Lỗi thêm từ:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/filtered-words/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTextWords((prev) => prev.filter((w) => w._id !== id));
    } catch (err) {
      console.error("Lỗi xoá từ:", err);
    }
  };

  const renderTable = (words, title, inputVal, setInputVal) => (
    <div className="mt-10">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">{title}</h2>

      {/* Form thêm từ mới */}
      <div className="flex flex-wrap gap-3 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <input
          type="text"
          placeholder="Nhập từ cấm mới..."
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          className="flex-1 min-w-[200px] border rounded-md px-4 py-2 focus:outline-none focus:ring focus:border-blue-400"
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        
        <div className="flex gap-2">

          <select 
            value={action} 
            onChange={(e) => setAction(e.target.value)} 
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="pending">Chờ Duyệt</option>
            <option value="censor">Che tên (***)</option>
            <option value="block">Chặn đứng</option>
          </select>

          <button
            onClick={handleAdd}
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition duration-200 font-bold"
          >
            ➕ Thêm
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="min-w-full table-auto text-sm text-left text-gray-700">
          <thead className="bg-gradient-to-r from-indigo-100 to-blue-100 text-gray-700">
            <tr>
              <th className="px-4 py-3">🚫 Từ cấm</th>
              <th className="px-4 py-3">Xử lý</th>
              <th className="px-4 py-3 text-center">Lượt chặn</th>
              <th className="px-4 py-3">⚙️ Hành động</th>
            </tr>
          </thead>
          <tbody>
            {words.map((w, index) => (
              <tr
                key={w._id}
                className={`transition duration-200 ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:bg-red-50`}
              >
                <td className="px-4 py-3 font-medium">{w.word}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                    w.action === "block" ? "bg-red-100 text-red-700" :
                    w.action === "censor" ? "bg-yellow-100 text-yellow-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>
                    {w.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-center font-bold text-gray-500">{w.hitCount || 0}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDelete(w._id)}
                    className="px-3 py-1 rounded-md text-white text-xs bg-red-500 hover:bg-red-600 transition duration-200"
                  >
                    Xoá
                  </button>
                </td>
              </tr>
            ))}
            {words.length === 0 && (
              <tr>
                <td colSpan="4" className="px-4 py-6 text-center text-gray-500">
                  Chưa có từ cấm nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto min-h-screen bg-gray-50/50">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-red-100 text-red-600 rounded-2xl">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Quản lý Từ Cấm</h1>
          <p className="text-gray-500 text-sm">Thiết lập các từ ngữ bị hạn chế để bảo vệ cộng đồng</p>
        </div>
      </div>

      {renderTable(textWords, "Danh sách từ hạn chế", newTextWord, setNewTextWord)}
    </div>
  );
};

export default FilteredWords;
