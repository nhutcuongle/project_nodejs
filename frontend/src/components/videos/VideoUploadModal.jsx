import { useState } from "react";
import videoService from "../../services/videoService";

export default function VideoUploadModal({ onClose, token }) {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleUpload = async () => {
    if (!file) return alert("Chưa chọn video");
    setLoading(true);

    const formData = new FormData();
    formData.append("video", file);
    formData.append("description", description);

    try {
      await videoService.upload(formData, token);
      alert("Đăng video thành công!");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Lỗi khi upload video");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[400px] text-center">
        <h2 className="text-xl font-semibold mb-4">Đăng video mới</h2>

        <input
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          className="mb-3"
        />

        {preview && (
          <video src={preview} controls className="w-full mb-3 rounded-xl" />
        )}

        <textarea
          placeholder="Mô tả video..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded-md mb-3"
        />

        <button
          onClick={handleUpload}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          {loading ? "Đang tải..." : "Đăng video"}
        </button>

        <button
          onClick={onClose}
          className="ml-3 text-gray-500 hover:underline"
        >
          Hủy
        </button>
      </div>
    </div>
  );
}
