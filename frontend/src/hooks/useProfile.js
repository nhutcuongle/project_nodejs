import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatar,
} from "../services/profileService";
import {
  getFollowStatus,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
} from "../services/followService";

export default function useProfile(identifier, currentUser, setUser) {
  const [form, setForm] = useState(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followStatus, setFollowStatus] = useState("none");
  const [followList, setFollowList] = useState([]);
  const [modalType, setModalType] = useState(null);
  const isMe = !identifier || currentUser?.identifier === identifier;

  const fetchProfile = async () => {
  try {
    const res = await getProfile(identifier);
    const data = res.data;

       setForm(data);

    setFollowersCount(data.followersCount || 0);
    setFollowingCount(data.followingCount || 0);
  } catch {
    toast.error("Không thể tải hồ sơ người dùng");
  }
};


  const fetchFollowStatus = async () => {
    if (isMe || !form?._id) return;
    try {
      const res = await getFollowStatus(form._id);
      setFollowStatus(res.data.status);
    } catch {
      /* ignore */
    }
  };

  const handleFollowToggle = async () => {
    if (!form?._id) return;
    try {
      if (["none", "followed_by"].includes(followStatus)) {
        await followUser(form._id);
        setFollowStatus((prev) =>
          prev === "followed_by" ? "friend" : "following"
        );
        toast.success("Đã theo dõi");
      } else {
        if (!window.confirm("Bạn có muốn hủy theo dõi không?")) return;
        await unfollowUser(form._id);
        setFollowStatus((prev) => (prev === "friend" ? "followed_by" : "none"));
        toast.success("Đã hủy theo dõi");
      }
      fetchProfile();
    } catch {
      toast.error("Thao tác thất bại");
    }
  };

  const handleShowModal = async (type) => {
    try {
      setModalType(type);
      const fetchFn = type === "followers" ? getFollowers : getFollowing;
      const res = await fetchFn(form._id);
      setFollowList(res.data);
    } catch {
      toast.error("Không thể lấy danh sách");
    }
  };

  const handleSaveProfile = async (updatedForm = form) => {
    try {
      await updateProfile(updatedForm);
      toast.success("Cập nhật hồ sơ thành công");
      const { data } = await getProfile(identifier);
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      fetchProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi cập nhật");
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await uploadAvatar(file);
      const updatedForm = { ...form, avatar: res.data.urls[0] };
      setForm(updatedForm);
      await handleSaveProfile(updatedForm);
      toast.success("Đã cập nhật ảnh đại diện!");
    } catch {
      toast.error("Lỗi khi cập nhật avatar");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [identifier, currentUser]);

  useEffect(() => {
    fetchFollowStatus();
  }, [form?._id]);

  return {
    isMe,
    form,
    setForm,
    followersCount,
    followingCount,
    followStatus,
    handleFollowToggle,
    handleAvatarUpload,
    handleShowModal,
    handleSaveProfile,
    followList,
    modalType,
    setModalType,
  };
}
