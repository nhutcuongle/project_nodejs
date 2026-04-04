// import { useEffect, useState } from "react";
// import axios from "../../utils/api";
// import { useAuth } from "../../context/AuthContext";

// const FilteredWords = () => {
//   const { token } = useAuth();
//   const [words, setWords] = useState([]);
//   const [newWord, setNewWord] = useState("");

//   const fetchWords = async () => {
//     try {
//       const res = await axios.get("/filtered-words", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setWords(res.data);
//     } catch (err) {
//       console.error("Lỗi tải danh sách từ cấm:", err);
//     }
//   };

//   useEffect(() => {
//     fetchWords();
//   }, []);

//   const handleAdd = async () => {
//     if (!newWord.trim()) return;
//     try {
//       const res = await axios.post(
//         "/filtered-words",
//         { word: newWord },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setWords([...words, res.data.word]);
//       setNewWord("");
//     } catch (err) {
//       console.error("Lỗi thêm từ:", err);
//     }
//   };

//   const handleDelete = async (id) => {
//     try {
//       await axios.delete(`/filtered-words/${id}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setWords(words.filter((w) => w._id !== id));
//     } catch (err) {
//       console.error("Lỗi xoá từ:", err);
//     }
//   };

//   return (
//     <div className="p-6 max-w-4xl mx-auto">
//       <h1 className="text-3xl font-bold mb-6 text-gray-800">🧼 Quản lý Từ Cấm</h1>

//       <div className="flex gap-3 mb-6">
//         <input
//           type="text"
//           placeholder="Nhập từ cấm mới..."
//           value={newWord}
//           onChange={(e) => setNewWord(e.target.value)}
//           className="flex-1 border rounded-md px-4 py-2 focus:outline-none focus:ring focus:border-blue-400"
//         />
//         <button
//           onClick={handleAdd}
//           className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200"
//         >
//           ➕ Thêm
//         </button>
//       </div>

//       <div className="overflow-x-auto bg-white rounded-xl shadow">
//         <table className="min-w-full table-auto text-sm text-left text-gray-700">
//           <thead className="bg-gradient-to-r from-rose-100 to-pink-100 text-gray-700">
//             <tr>
//               <th className="px-4 py-3">🚫 Từ cấm</th>
//               <th className="px-4 py-3">⚙️ Hành động</th>
//             </tr>
//           </thead>
//           <tbody>
//             {words.map((w, index) => (
//               <tr
//                 key={w._id}
//                 className={`transition duration-200 ${
//                   index % 2 === 0 ? "bg-white" : "bg-gray-50"
//                 } hover:bg-red-50`}
//               >
//                 <td className="px-4 py-3 font-medium">{w.word}</td>
//                 <td className="px-4 py-3">
//                   <button
//                     onClick={() => handleDelete(w._id)}
//                     className="px-3 py-1 rounded-md text-white text-sm bg-red-500 hover:bg-red-600 transition duration-200 shadow-sm"
//                   >
//                     Xoá
//                   </button>
//                 </td>
//               </tr>
//             ))}
//             {words.length === 0 && (
//               <tr>
//                 <td colSpan="2" className="px-4 py-6 text-center text-gray-500">
//                   Chưa có từ cấm nào.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default FilteredWords;


// ✅ Quản lý từ cấm: text & hashtag riêng biệt
import { useEffect, useState } from "react";
import axios from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

const FilteredWords = () => {
  const { token } = useAuth();
  const [textWords, setTextWords] = useState([]);
  const [hashtagWords, setHashtagWords] = useState([]);
  const [newTextWord, setNewTextWord] = useState("");
  const [newHashtag, setNewHashtag] = useState("");
  const [severity, setSeverity] = useState("medium");
  const [category, setCategory] = useState("general");
  const [action, setAction] = useState("pending");

  const fetchWords = async () => {
    try {
      const res = await axios.get("/filtered-words", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTextWords(res.data.filter((w) => w.type !== "hashtag"));
      setHashtagWords(res.data.filter((w) => w.type === "hashtag"));
    } catch (err) {
      console.error("Lỗi tải danh sách từ cấm:", err);
    }
  };

  useEffect(() => {
    fetchWords();
  }, []);

  const handleAdd = async (type) => {
    const word = type === "hashtag" ? newHashtag : newTextWord;
    if (!word.trim()) return;
    try {
      const payload = { word, type, severity, category, action };
      const res = await axios.post(
        "/filtered-words",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (type === "hashtag") {
        setHashtagWords([...hashtagWords, res.data.word]);
        setNewHashtag("");
      } else {
        setTextWords([...textWords, res.data.word]);
        setNewTextWord("");
      }
    } catch (err) {
      console.error("Lỗi thêm từ:", err);
    }
  };

  const handleDelete = async (id, type) => {
    try {
      await axios.delete(`/filtered-words/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (type === "hashtag") {
        setHashtagWords(hashtagWords.filter((w) => w._id !== id));
      } else {
        setTextWords(textWords.filter((w) => w._id !== id));
      }
    } catch (err) {
      console.error("Lỗi xoá từ:", err);
    }
  };

  const renderTable = (words, title, type, inputVal, setInputVal) => (
    <div className="mt-10">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">{title}</h2>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder={`Nhập ${type === "hashtag" ? "hashtag" : "từ cấm"} mới...`}
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          className="flex-1 border rounded-md px-4 py-2 focus:outline-none focus:ring focus:border-blue-400"
        />
        <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="border rounded-md px-3 py-2">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="border rounded-md px-3 py-2">
          <option value="general">Khác</option>
          <option value="spam">Spam</option>
          <option value="hate_speech">Chửi bới / Thù ghét</option>
          <option value="politics">Chính trị</option>
        </select>
        <select value={action} onChange={(e) => setAction(e.target.value)} className="border rounded-md px-3 py-2">
          <option value="pending">Chờ Duyệt (Pending)</option>
          <option value="censor">Che tên (Censor ***)</option>
          <option value="block">Chặn đứng (Block)</option>
        </select>

        <button
          onClick={() => handleAdd(type)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200 min-w-max"
        >
          ➕ Thêm
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="min-w-full table-auto text-sm text-left text-gray-700">
          <thead className="bg-gradient-to-r from-indigo-100 to-blue-100 text-gray-700">
            <tr>
              <th className="px-4 py-3">🚫 {type === "hashtag" ? "Hashtag cấm" : "Từ cấm"}</th>
              <th className="px-4 py-3">Mức độ</th>
              <th className="px-4 py-3">Phân loại</th>
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
                <td className="px-4 py-3">{w.severity}</td>
                <td className="px-4 py-3">{w.category}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
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
                    onClick={() => handleDelete(w._id, type)}
                    className="px-3 py-1 rounded-md text-white text-sm bg-red-500 hover:bg-red-600 transition duration-200 shadow-sm"
                  >
                    Xoá
                  </button>
                </td>
              </tr>
            ))}
            {words.length === 0 && (
              <tr>
                <td colSpan="6" className="px-4 py-6 text-center text-gray-500">
                  Chưa có {type === "hashtag" ? "hashtag cấm" : "từ cấm"} nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">🧼 Quản lý Từ Cấm</h1>
      {renderTable(textWords, "Từ cấm nội dung", "text", newTextWord, setNewTextWord)}
      {renderTable(hashtagWords, "Hashtag bị cấm", "hashtag", newHashtag, setNewHashtag)}
    </div>
  );
};

export default FilteredWords;
