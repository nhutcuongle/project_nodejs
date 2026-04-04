import { useEffect, useState } from "react";
import axios from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

const ModerationLogs = () => {
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get("/moderation/logs", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setLogs(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Lỗi khi lấy logs kiểm duyệt:", err);
      }
    };

    fetchLogs();
  }, [token]);

  if (loading) return <p className="p-4">Đang tải lịch sử kiểm duyệt...</p>;

  return (
    <div className="max-w-6xl mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">🧾 Lịch sử kiểm duyệt nội dung</h1>

      {logs.length === 0 ? (
        <p className="text-gray-500 italic">Chưa có hành động kiểm duyệt nào.</p>
      ) : (
        <table className="w-full table-auto border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2">Thời gian</th>
              <th className="border px-3 py-2">Người kiểm duyệt</th>
              <th className="border px-3 py-2">Loại nội dung</th>
              <th className="border px-3 py-2">ID nội dung</th>
              <th className="border px-3 py-2">Hành động</th>
              <th className="border px-3 py-2">Lý do (nếu xoá)</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log._id} className="border-t">
                <td className="border px-3 py-2 text-sm text-gray-500">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="border px-3 py-2">{log.moderator?.username || log.moderator?.fullName || "Ẩn danh"}</td>
                <td className="border px-3 py-2">{log.targetType}</td>
                <td className="border px-3 py-2 text-sm font-mono text-blue-600">
                  {log.targetId}
                </td>
                <td className="border px-3 py-2 font-semibold">
                  {log.action === "approve" ? (
                    <span className="text-green-600">✅ Đã duyệt</span>
                  ) : (
                    <span className="text-red-600">🗑 Đã xoá</span>
                  )}
                </td>
                <td className="border px-3 py-2 text-sm italic text-gray-700">
                  {log.reason || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ModerationLogs;
