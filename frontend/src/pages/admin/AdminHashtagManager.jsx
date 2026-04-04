import { useEffect, useState } from "react";
import axiosClient from "../../services/axiosClient";
import { toast } from "react-hot-toast";
import HashtagQuestionList from "../../components/HashtagQuestionList";

function AdminHashtagManager() {
  const [hashtags, setHashtags] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedHashtagId, setSelectedHashtagId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    fetchHashtags();
  }, []);

  const fetchHashtags = async () => {
    try {
      const res = await axiosClient.get("/admin/hashtags");
      setHashtags(res.data);
    } catch (err) {
      toast.error("Không thể tải danh sách hashtag");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xoá hashtag này?")) return;
    try {
      await axiosClient.delete(`/admin/hashtags/${id}`);
      setHashtags((prev) => prev.filter((h) => h._id !== id));
      toast.success("Đã xoá hashtag.");
    } catch (err) {
      toast.error("Lỗi khi xoá hashtag");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast.error("Bạn chưa chọn hashtag nào.");
      return;
    }

    if (!window.confirm("Bạn chắc chắn muốn xoá các hashtag đã chọn?")) return;

    try {
      await axiosClient.delete(`/admin/hashtags/bulk-delete`, {
        data: { ids: selectedIds },
      });
      toast.success(`Đã xoá ${selectedIds.length} hashtag.`);
      fetchHashtags();
      setSelectedIds([]);
      setSelectAll(false);
    } catch (err) {
      toast.error("Lỗi khi xoá hàng loạt hashtag");
    }
  };

  const handleUpdate = async (id, newName) => {
    try {
      await axiosClient.put(`/admin/hashtags/${id}`, { name: newName });
      toast.success("Đã cập nhật hashtag.");
      fetchHashtags();
    } catch (err) {
      toast.error("Lỗi khi cập nhật");
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
      setSelectAll(false);
    } else {
      setSelectedIds(filtered.map((h) => h._id));
      setSelectAll(true);
    }
  };

  const filtered = hashtags.filter((h) =>
    h.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800"> Quản lý Hashtag</h1>

      <div className="flex gap-4 mb-4 items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Tìm kiếm hashtag..."
          className="border border-gray-300 p-2 rounded w-full max-w-sm shadow-sm"
        />
        <button
          onClick={handleBulkDelete}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 shadow"
        >
          🗑️ Xoá hàng loạt
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
        <table className="min-w-full table-auto text-sm text-left text-gray-700">
          <thead className="bg-gradient-to-r from-pink-100 to-rose-100 text-gray-700">
            <tr>
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="px-4 py-3">🏷️ Tên hashtag</th>
              <th className="px-4 py-3">📊 Số câu hỏi</th>
              <th className="px-4 py-3">📅 Ngày tạo</th>
              <th className="px-4 py-3">⚙️ Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((h, index) => (
              <tr
                key={h._id}
                className={`transition duration-200 ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:bg-rose-50`}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(h._id)}
                    onChange={() => toggleSelect(h._id)}
                  />
                </td>
                <td className="px-4 py-3">
                  <EditableCell
                    value={h.name}
                    onSave={(newName) => handleUpdate(h._id, newName)}
                  />
                </td>
                <td className="px-4 py-3">
                  <button
                    className="text-indigo-600 hover:underline"
                    onClick={() => setSelectedHashtagId(h._id)}
                  >
                    {h.questionCount}
                  </button>
                </td>
                <td className="px-4 py-3">
                  {new Date(h.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <button
                    onClick={() => handleDelete(h._id)}
                    className="px-3 py-1 rounded-md text-white text-sm bg-red-500 hover:bg-red-600 shadow-sm"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedHashtagId && (
        <HashtagQuestionList
          hashtagId={selectedHashtagId}
          onClose={() => setSelectedHashtagId(null)}
        />
      )}
    </div>
  );
}

function EditableCell({ value, onSave }) {
  const [editing, setEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const handleBlur = () => {
    if (tempValue.trim() && tempValue !== value) {
      onSave(tempValue.trim());
    }
    setEditing(false);
  };

  return editing ? (
    <input
      autoFocus
      value={tempValue}
      onChange={(e) => setTempValue(e.target.value)}
      onBlur={handleBlur}
      className="border p-1 w-full rounded"
    />
  ) : (
    <span
      onClick={() => setEditing(true)}
      className="cursor-pointer text-indigo-600 hover:underline"
    >
      {value}
    </span>
  );
}

export default AdminHashtagManager;
