import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

function AskQuestion() {
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const [violationMessage, setViolationMessage] = useState("");
  const [pendingQuestion, setPendingQuestion] = useState(null);


  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  const handleAddImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImages((prev) => [...prev, file]);
    }
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImagesToCloudinary = async () => {
    const urls = [];
    for (const img of images) {
      const formData = new FormData();
      formData.append("file", img);
      formData.append("upload_preset", "unsigned_qna_upload");

      try {
        const res = await fetch(
          "https://api.cloudinary.com/v1_1/di1fq0myi/image/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || "Upload thất bại");
        urls.push(data.secure_url);
      } catch (error) {
        console.error("Lỗi upload ảnh:", error);
        throw error;
      }
    }
    return urls;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setViolationMessage("");
    setPendingQuestion(null);

    try {
      const imageUrls = await uploadImagesToCloudinary();

      const res = await fetch("http://localhost:5000/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          content,
          images: imageUrls,
        }),
      });

      const data = await res.json();

      if (res.status === 201) {
        toast.success("🎉 Câu hỏi đã được đăng thành công!");
        navigate("/home");
      } else if (res.status === 202) {
        // Câu hỏi chứa từ cấm → hiện cảnh báo
        setViolationMessage(data.message);
        setPendingQuestion({
          _id: data.question._id,
          title,
          content,
          images: imageUrls,
        });
      } else {
        toast.error(data.message || "Lỗi khi gửi câu hỏi.");
      }
    } catch (err) {
      console.error("Lỗi submit:", err);
      toast.error("Đã xảy ra lỗi khi gửi câu hỏi.");
    } finally {
      setLoading(false);
    }
  };

  const handleForceSubmit = async () => {
    if (!pendingQuestion) return;

    try {
      const res = await fetch("http://localhost:5000/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(pendingQuestion),
      });

      const data = await res.json();

      if (res.status === 201 || res.status === 202) {
        toast.success("🎉 Câu hỏi đã được gửi để admin duyệt.");
        navigate("/home");
      } else {
        toast.error(data.message || "Lỗi khi gửi lại câu hỏi.");
      }
    } catch (err) {
      console.error("Lỗi gửi lại:", err);
      toast.error("Gửi lại thất bại.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow relative">
      <h2 className="text-2xl font-bold mb-4">Đặt câu hỏi mới</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Tiêu đề câu hỏi"
          className="w-full border p-2 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          placeholder="Nội dung chi tiết"
          className="w-full border p-2 rounded"
          rows="5"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        ></textarea>

        {/* Image preview and add */}
        <div className="flex gap-2 flex-wrap">
          {images.map((img, index) => (
            <div key={index} className="relative w-24 h-24">
              <img
                src={URL.createObjectURL(img)}
                alt={`preview-${index}`}
                className="w-full h-full object-cover rounded shadow"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
              >
                ×
              </button>
            </div>
          ))}

          <label className="w-24 h-24 border-dashed border-2 border-gray-400 flex items-center justify-center text-2xl text-gray-500 cursor-pointer rounded hover:border-blue-500 hover:text-blue-500">
            +
            <input
              type="file"
              accept="image/*"
              onChange={handleAddImage}
              className="hidden"
            />
          </label>
        </div>

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          disabled={loading}
        >
          {loading ? "Đang gửi..." : "Gửi câu hỏi"}
        </button>
      </form>

      {/* Modal từ cấm */}
      {violationMessage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg text-center max-w-md">
            <h3 className="text-xl font-semibold mb-2 text-red-600">
              ⚠️ Nội dung vi phạm
            </h3>
            <p className="mb-4">{violationMessage}</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setViolationMessage("");
                  setPendingQuestion(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Hủy
              </button>
              <button
                onClick={handleForceSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Vẫn gửi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AskQuestion;
