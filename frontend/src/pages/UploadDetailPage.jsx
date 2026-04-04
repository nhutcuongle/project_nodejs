
import { useLocation, useNavigate } from "react-router-dom";
import videoService from "../services/videoService";
import React, { useState, useMemo, useEffect } from "react";

const UploadDetailPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const files = state?.files || [];

  // ✅ Tạo preview chỉ 1 lần để tránh giật khi nhập
  const previews = useMemo(() => {
    return files.map((file) => URL.createObjectURL(file));
  }, [files]);

  // ✅ Dọn bộ nhớ khi rời trang
  useEffect(() => {
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, [previews]);

  const handleUpload = async () => {
    if (!files.length) return alert("⚠️ Không có tệp để tải lên!");

    const token = localStorage.getItem("token");
    if (!token) return alert(" Bạn cần đăng nhập để đăng video!");

    const formData = new FormData();
    formData.append("video", files[0]); // Backend nhận key 'video'
    formData.append("description", description); // khớp với API backend

    try {
      setLoading(true);
      const res = await videoService.upload(formData, token);
      if (res.success) {
        alert(" Đăng video thành công!");
        navigate("/home");
      } else {
        alert("Lỗi khi đăng video. Vui lòng thử lại.");
      }
    } catch (err) {
      console.error("Lỗi khi tải lên:", err);
      alert(err.response?.data?.message || "Lỗi khi đăng video!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">Đăng nội dung mới</h2>

      {/* ✅ Preview mượt và thống nhất */}
      {files.map((file, idx) =>
        file.type.startsWith("video") ? (
          <video
            key={idx}
            src={previews[idx]}
            controls
            className="rounded-xl mb-4 w-full shadow"
          />
        ) : (
          <img
            key={idx}
            src={previews[idx]}
            alt="preview"
            className="rounded-xl mb-4 w-full object-cover shadow"
          />
        )
      )}

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Thêm mô tả cho video..."
        className="w-full border rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        rows={4}
      />

      <button
        onClick={handleUpload}
        disabled={loading}
        className={`${
          loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
        } text-white px-6 py-2 rounded-full transition w-full`}
      >
        {loading ? "Đang tải lên..." : "Đăng"}
      </button>
    </div>
  );
};

export default UploadDetailPage;
