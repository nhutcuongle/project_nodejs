import React, { useEffect, useState } from "react";
import axiosClient from "../../services/axiosClient";
import { toast } from "react-hot-toast";
import {
  FaTrash,
  FaLock,
  FaUnlock,
  FaUserShield,
  FaBan,
  FaQuestion,
  FaReply,
} from "react-icons/fa";

const AdminUserList = () => {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async (reset = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await axiosClient.get("/admin/users", {
        params: { page, limit: 10, identifier: query },
      });

      if (reset) {
        setUsers(res.data.users);
      } else {
        setUsers((prev) => [...prev, ...res.data.users]);
      }

      const totalLoaded = reset
        ? res.data.users.length
        : users.length + res.data.users.length;

      setHasMore(totalLoaded < res.data.total);
    } catch (err) {
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(true);
  }, [query]);

  useEffect(() => {
    if (page > 1) fetchUsers();
  }, [page]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop + 100 >=
        document.documentElement.scrollHeight
      ) {
        if (hasMore && !loading) {
          setPage((prev) => prev + 1);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, loading]);

  const handleAction = async (userId, actionType) => {
    try {
      let res;

      switch (actionType) {
        case "toggle-disable":
          res = await axiosClient.put(`/admin/users/${userId}/toggle-disable`);
          toast.success(res.data.message);
          break;
        case "delete":
          if (window.confirm("Bạn có chắc muốn xoá người dùng này?")) {
            res = await axiosClient.delete(`/admin/users/${userId}`);
            toast.success("Đã xoá người dùng");
          }
          break;
        case "grant-admin":
          res = await axiosClient.patch(`/admin/users/${userId}/set-admin`);
          toast.success(res.data.message);
          break;
        case "toggle-ask":
          res = await axiosClient.patch(`/admin/users/${userId}/toggle-ask`);
          toast.success(res.data.message);
          break;
        case "toggle-answer":
          res = await axiosClient.patch(`/admin/users/${userId}/toggle-answer`);
          toast.success(res.data.message);
          break;
        default:
          return;
      }

      setPage(1); // reset phân trang và load lại
      fetchUsers(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Thao tác thất bại");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Quản lý người dùng
      </h1>

      <input
        type="text"
        placeholder="Tìm theo mã định danh"
        className="mb-4 px-4 py-2 border rounded-md w-full max-w-md"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setPage(1);
            fetchUsers(true);
          }
        }}
      />

      <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="bg-gradient-to-r from-green-100 to-teal-100 text-gray-700">
            <tr>
              <th className="px-4 py-3"> Email</th>
              <th className="px-4 py-3"> Mã định danh</th>
              <th className="px-4 py-3"> Vai trò</th>
              <th className="px-4 py-3"> Quyền hỏi</th>
              <th className="px-4 py-3"> Quyền trả lời</th>
              <th className="px-4 py-3"> Trạng thái</th>
              <th className="px-4 py-3"> Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr
                key={user._id}
                className={`transition duration-200 ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:bg-teal-50`}
              >
                <td className="px-4 py-3 font-medium">{user.email}</td>
                <td className="px-4 py-3">@{user.identifier || "—"}</td>
                <td className="px-4 py-3">
                  {user.role === "admin" ? (
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Admin
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      Người dùng
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {user.permissions?.canAsk !== false ? (
                    <span className="text-green-600 font-semibold">✔</span>
                  ) : (
                    <span className="text-red-600 font-semibold">✖</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {user.permissions?.canAnswer !== false ? (
                    <span className="text-green-600 font-semibold">✔</span>
                  ) : (
                    <span className="text-red-600 font-semibold">✖</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {user.isDisabled ? (
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-600">
                      Vô hiệu hóa
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                      Đang hoạt động
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 flex flex-wrap gap-2">
                  {user.role !== "admin" && (
                    <>
                      <button
                        onClick={() => handleAction(user._id, "grant-admin")}
                        className="flex items-center gap-1 px-3 py-1 rounded-md text-sm bg-blue-500 text-white hover:bg-blue-600"
                      >
                        <FaUserShield /> Admin
                      </button>
                      <button
                        onClick={() => handleAction(user._id, "toggle-ask")}
                        className="flex items-center gap-1 px-3 py-1 rounded-md text-sm bg-yellow-500 text-white hover:bg-yellow-600"
                      >
                        <FaQuestion />
                        {user.permissions?.canAsk !== false ? "Cấm hỏi" : "Cho hỏi"}
                      </button>
                      <button
                        onClick={() => handleAction(user._id, "toggle-answer")}
                        className="flex items-center gap-1 px-3 py-1 rounded-md text-sm bg-indigo-500 text-white hover:bg-indigo-600"
                      >
                        <FaReply />
                        {user.permissions?.canAnswer !== false ? "Cấm trả lời" : "Cho trả lời"}
                      </button>
                      <button
                        onClick={() => handleAction(user._id, "toggle-disable")}
                        className="flex items-center gap-1 px-3 py-1 rounded-md text-sm bg-purple-500 text-white hover:bg-purple-600"
                      >
                        {user.isDisabled ? <FaUnlock /> : <FaLock />}
                        {user.isDisabled ? "Mở khóa" : "Khóa"}
                      </button>
                      <button
                        onClick={() => handleAction(user._id, "delete")}
                        className="flex items-center gap-1 px-3 py-1 rounded-md text-sm bg-red-500 text-white hover:bg-red-600"
                      >
                        <FaTrash /> Xoá
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading && (
          <p className="text-center py-4 text-gray-500">Đang tải...</p>
        )}

        {users.length === 0 && !loading && (
          <p className="text-center text-gray-500 py-4">
            Không có người dùng nào.
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminUserList;
