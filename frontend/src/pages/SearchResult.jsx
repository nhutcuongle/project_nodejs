
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import QuestionList from "../components/QuestionList";
import { useAuth } from "../context/AuthContext";

const SearchResult = () => {
  const { token } = useAuth();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const keyword = params.get("keyword");
  const field = params.get("field");

  const [questions, setQuestions] = useState([]);
  const [sort, setSort] = useState("newest");
  const [range, setRange] = useState("all");

  const fetchSearch = async () => {
    try {
      const query = new URLSearchParams({
        keyword,
        field,
        sort,
        range,
      }).toString();

      const res = await fetch(`http://localhost:5000/api/questions/search?${query}`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const data = await res.json();
      setQuestions(data.questions || []);
    } catch (err) {
      console.error("❌ Lỗi khi tìm kiếm:", err.message);
    }
  };

  useEffect(() => {
    if (token) fetchSearch();
  }, [keyword, field, sort, range, token]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">🔍 Kết quả tìm kiếm</h2>

      {/* Bộ lọc */}
      <div className="flex gap-4 mb-4">
        <select
          className="p-2 border rounded"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
        </select>

        <select
          className="p-2 border rounded"
          value={range}
          onChange={(e) => setRange(e.target.value)}
        >
          <option value="all">Tất cả</option>
          <option value="24h">24 giờ</option>
          <option value="3d">3 ngày</option>
          <option value="7d">7 ngày</option>
          <option value="1m">1 tháng</option>
        </select>
      </div>

      <QuestionList questions={questions} />
    </div>
  );
};

export default SearchResult;
