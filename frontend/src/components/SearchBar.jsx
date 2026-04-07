// src/components/SearchBar.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SearchBar = () => {
  const [keyword, setKeyword] = useState("");
  const [field, setField] = useState("title");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (keyword.trim()) {
      navigate(
        `/search?keyword=${encodeURIComponent(keyword)}&field=${field}`
      );
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-2 mb-6">
      <select
        className="border p-2 rounded"
        value={field}
        onChange={(e) => setField(e.target.value)}
      >
        <option value="title">Tiêu đề</option>
        <option value="content">Nội dung</option>
        <option value="user">User ID / Username</option>
      </select>

      <input
        className="flex-1 border p-2 rounded"
        type="text"
        placeholder="Từ khóa tìm kiếm..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />

      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={handleSearch}
      >
        Tìm kiếm
      </button>
    </div>
  );
};

export default SearchBar;
