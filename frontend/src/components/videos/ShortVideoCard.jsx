

import { useRef, useEffect, useState, useContext } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  Volume,
  VolumeX,
  Trash2,
  Copy,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { SocketContext } from "../../context/SocketContext";
import videoService from "../../services/videoService";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import commentService from "../../services/commentService";

export default function ShortVideoCard({
  video,
  muted,
  setMuted,
  onDeleted,
  onShowComments,
}) {
  if (!video?.videoUrl) return null;

  const videoRef = useRef(null);
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { socket } = useContext(SocketContext);
  const [isPortrait, setIsPortrait] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(video.likes?.length || 0);
  const [playing, setPlaying] = useState(true);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [commentsCount, setCommentsCount] = useState(video.commentsCount || 0);

  // ✅ Kiểm tra người dùng đã like chưa
  useEffect(() => {
    if (user && video.likes?.includes(user._id)) setIsLiked(true);
  }, [user, video.likes]);

  // ✅ Tự động play/pause khi cuộn qua video
  useEffect(() => {
    if (!videoRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!videoRef.current) return;
        if (entry.isIntersecting) {
          videoRef.current.play().catch(() => {});
          setPlaying(true);
        } else {
          videoRef.current.pause();
          setPlaying(false);
        }
      },
      { threshold: 0.6 }
    );
    observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  // ✅ Đồng bộ âm thanh và load metadata
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted;
    }
  }, [muted]);

  // ✅ Socket realtime likes
  useEffect(() => {
    if (!socket || !video._id) return;
    socket.emit("join_video", video._id);

    const handleUpdateLikes = ({ likesCount: newLikesCount }) =>
      setLikesCount(newLikesCount);

    socket.on("updateLikesCount", handleUpdateLikes);
    return () => {
      socket.emit("leave_video", video._id);
      socket.off("updateLikesCount", handleUpdateLikes);
    };
  }, [socket, video._id]);

  // 🔹 Load tổng comment lần đầu
  useEffect(() => {
    // Reset comment count trước khi fetch
    setCommentsCount(video.commentsCount || 0);

    const fetchCommentsCount = async () => {
      try {
        const comments = await commentService.getComments(video._id);
        const totalReplies = comments.reduce(
          (acc, c) => acc + (c.replyCount || 0),
          0
        );
        setCommentsCount(comments.length + totalReplies);
      } catch (err) {
        console.error("Lỗi load comment count:", err);
      }
    };

    fetchCommentsCount();
  }, [video._id]);

  // 🔹 Realtime update comment count
  useEffect(() => {
    if (!socket) return;
    socket.emit("join_video", video._id);

    const handleUpdateComments = ({ totalComments }) => {
      setCommentsCount(totalComments);
    };

    socket.on("updateCommentsCount", handleUpdateComments);

    return () => {
      socket.emit("leave_video", video._id);
      socket.off("updateCommentsCount", handleUpdateComments);
    };
  }, [socket, video._id]);

  // ❤️ Like video
  const handleLike = async () => {
    if (!token) return toast.error("Bạn cần đăng nhập để like video!");
    try {
      const res = await videoService.likeVideo(video._id, token);
      setIsLiked(res.liked);
      setLikesCount(res.likesCount);
      socket?.emit("like_video_realtime", {
        videoId: video._id,
        senderId: user._id,
        liked: res.liked,
      });
    } catch {
      toast.error("Lỗi khi like video!");
    }
  };

  // 🗑️ Xóa video
  const handleDelete = async () => {
    try {
      await videoService.deleteVideo(video._id, token);
      toast.success("Đã xoá video!");
      setShowDeleteConfirm(false);
      setShowShareMenu(false);
      onDeleted?.(video._id);
    } catch {
      toast.error("Xoá video thất bại!");
    }
  };

  // 📋 Sao chép link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/video/${video._id}`
    );
    toast.success("Đã sao chép liên kết!");
    setShowShareMenu(false);
  };

  // 👤 Mở hồ sơ
  const handleGoToProfile = () => {
    if (video.user?.identifier) navigate(`/${video.user.identifier}`);
    else toast.error("Không thể mở hồ sơ người dùng");
  };

  return (
    <div className="relative h-screen w-full flex justify-center items-center bg-black overflow-hidden">
      {/* 🎥 KHUNG VIDEO CỐ ĐỊNH 9:16 */}
      <div
        className="relative bg-black rounded-2xl overflow-hidden shadow-lg flex justify-center items-center"
        style={{
          height: "90vh",
          width: "min(56.25vh, 100vw)", // tỉ lệ 9:16 cố định
        }}
      >
        <video
          ref={videoRef}
          src={video.videoUrl}
          className="absolute inset-0 w-full h-full cursor-pointer bg-black"
          style={{
            objectFit: isPortrait ? "cover" : "contain",
          }}
          loop
          playsInline
          muted={muted}
          onLoadedMetadata={(e) => {
            const vid = e.target;
            const ratio = vid.videoWidth / vid.videoHeight;
            setIsPortrait(ratio < 1); // nếu cao > rộng → video dọc
          }}
          onClick={() => {
            if (!videoRef.current) return;
            playing ? videoRef.current.pause() : videoRef.current.play();
            setPlaying(!playing);
          }}
        />

        {/* Âm thanh */}
        <button
          onClick={() => setMuted(!muted)}
          className="absolute top-4 left-4 bg-black/40 hover:bg-black/60 p-2 rounded-full text-white z-20"
        >
          {muted ? <VolumeX size={24} /> : <Volume size={24} />}
        </button>

        {/* Mô tả */}
        <div className="absolute bottom-12 left-4 text-white max-w-[60%] z-20">
          <p className="font-semibold">@{video.user?.username || "unknown"}</p>
          <p className="text-sm">{video.description}</p>
        </div>
      </div>

      {/* 🎯 CỘT NÚT CỐ ĐỊNH (KHÔNG PHỤ THUỘC ASPECT RATIO) */}
      <div className="absolute right-[calc(50%-min(56.25vh,100vw)/2-80px)] bottom-[120px] flex flex-col items-center gap-5 text-white z-20">
        <div
          onClick={handleGoToProfile}
          className="w-14 h-14 rounded-full overflow-hidden border-2 border-white cursor-pointer hover:scale-105 transition-transform"
        >
          <img
            src={video.user?.avatar || "/default-avatar.png"}
            alt="avatar"
            className="w-full h-full object-cover"
          />
        </div>

        <button
          onClick={handleLike}
          className="flex flex-col items-center gap-1"
        >
          <Heart
            size={36}
            color={isLiked ? "red" : "white"}
            fill={isLiked ? "red" : "none"}
          />
          <span className="text-xs">{likesCount}</span>
        </button>

        <button
          onClick={() => onShowComments(true)}
          className="flex flex-col items-center gap-1"
        >
          <MessageCircle size={36} />
          <span className="text-xs">{commentsCount}</span>
        </button>

        {/* SHARE */}
        <div className="relative">
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="flex flex-col items-center gap-1"
          >
            <Share2 size={36} />
            <span className="text-xs">Chia sẻ</span>
          </button>

          {showShareMenu && (
            <div className="absolute bottom-14 right-0 bg-white text-black rounded-xl shadow-lg w-48 py-2 z-30">
              <button
                onClick={handleCopyLink}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
              >
                <Copy size={18} /> Sao chép liên kết
              </button>

              {user && video.user && video.user._id === user._id && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-red-600"
                >
                  <Trash2 size={18} /> Xóa video
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 🔥 XÁC NHẬN XOÁ */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-black/70 flex justify-center items-center z-40">
          <div className="bg-white rounded-xl p-6 text-center w-80">
            <p className="text-lg font-semibold mb-4">
              Bạn có chắc muốn xóa video này?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Xoá
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="bg-gray-300 text-black px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Huỷ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
