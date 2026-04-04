import React, { useEffect, useState } from "react";
import { getFollowers, getFollowing } from "../../services/followService";
import { Link } from "react-router-dom";

const FollowListModal = ({ type, userId, onClose }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const fetchList = async () => {
      try {
        const res =
          type === "followers"
            ? await getFollowers(userId)
            : await getFollowing(userId);
        setUsers(res.data);
      } catch (err) {
        console.error("Lỗi khi tải danh sách theo dõi:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, [type, userId]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-80 max-h-[80vh] overflow-y-auto shadow-lg">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold">
            {type === "followers" ? "Người theo dõi" : "Đang theo dõi"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✖
          </button>
        </div>
        {loading ? (
          <p className="p-4 text-center text-sm text-gray-500">Đang tải...</p>
        ) : users.length === 0 ? (
          <p className="p-4 text-center text-sm text-gray-500">
            Không có người dùng nào.
          </p>
        ) : (
          <ul className="divide-y">
            {users
              .filter((u) => u && u._id) // 🔒 Lọc an toàn
              .map((user) => (
                <li key={user._id} className="flex items-center gap-3 p-3">
                  <img
                    src={user.avatar || "https://www.gravatar.com/avatar?d=mp"}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <Link
                      to={`/${user.identifier}`} // ✅ Dẫn đúng sang trang profile theo identifier
                      onClick={onClose}
                      className="text-blue-600 hover:underline"
                    >
                      {user.username}
                    </Link>
                    <div className="text-sm text-gray-500">
                      @{user.identifier}
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FollowListModal;
