import { useEffect, useState } from "react";
import {
  followUser,
  unfollowUser,
  getFollowStatus,
} from "../services/followService";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { toast } from "react-hot-toast";

const FollowButton = ({ targetUserId }) => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowedByTarget, setIsFollowedByTarget] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchFollowStatus = async () => {
    try {
      const res = await getFollowStatus(targetUserId);
      setIsFollowing(res.data.isFollowing);
      setIsFollowedByTarget(res.data.isFollowedByTarget);
    } catch (err) {
      toast.error("Lỗi khi kiểm tra trạng thái theo dõi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (targetUserId && user?._id !== targetUserId) {
      fetchFollowStatus();
    }
  }, [targetUserId, user]);

  const handleFollow = async () => {
    try {
      await followUser(targetUserId);
      setIsFollowing(true);
      toast.success("Đã theo dõi");

      // ❌ Xóa socket.emit
    } catch {
      toast.error("Lỗi khi theo dõi");
    }
  };

  const handleUnfollow = async () => {
    try {
      await unfollowUser(targetUserId);
      setIsFollowing(false);
      toast.success("Đã bỏ theo dõi");

      // ❌ Xóa socket.emit
    } catch {
      toast.error("Lỗi khi bỏ theo dõi");
    }
  };

  if (loading || user._id === targetUserId) return null;

  return (
    <div className="text-center mt-2">
      {isFollowing && isFollowedByTarget ? (
        <p className="text-green-600 font-medium">💚 Bạn bè</p>
      ) : isFollowing ? (
        <button
          onClick={handleUnfollow}
          className="bg-gray-300 text-gray-800 px-4 py-1 rounded hover:bg-gray-400"
        >
          Đang theo dõi
        </button>
      ) : (
        <button
          onClick={handleFollow}
          className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
        >
          Theo dõi
        </button>
      )}
    </div>
  );
};

export default FollowButton;
