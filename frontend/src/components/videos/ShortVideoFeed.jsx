import { useEffect, useState, useRef } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import videoService from "../../services/videoService";
import ShortVideoCard from "./ShortVideoCard";
import CommentSidebar from "./CommentSidebar";
import VideoUploadButton from "../UI/VideoUploadButton";
import { Plus } from "lucide-react";

export default function ShortVideoFeed() {
  const [videos, setVideos] = useState([]);
  const [muted, setMuted] = useState(true);
  const containerRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Khóa cuộn trang
  useEffect(() => {
    const main = document.querySelector("main");
    const body = document.body;
    if (main) main.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      if (main) main.style.overflow = "auto";
      body.style.overflow = "auto";
    };
  }, []);

  // ✅ Lấy danh sách video
  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await videoService.getFeed();
        setVideos(res.videos || []);
      } catch (err) {
        console.error("Lỗi khi tải video feed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, []);

  // ✅ Cuộn giữa các video
  const scrollToVideo = (index) => {
    if (!containerRef.current || index < 0 || index >= videos.length) return;
    const videoElements =
      containerRef.current.querySelectorAll(".video-section");
    videoElements[index]?.scrollIntoView({ behavior: "smooth" });
    setCurrentIndex(index);
  };

  const handleNext = () => scrollToVideo(currentIndex + 1);
  const handlePrev = () => scrollToVideo(currentIndex - 1);

  // ✅ Cuộn bằng chuột
  useEffect(() => {
    const handleWheel = (e) => {
      if (isScrolling) return;
      setIsScrolling(true);

      if (e.deltaY > 50) scrollToVideo(currentIndex + 1);
      else if (e.deltaY < -50) scrollToVideo(currentIndex - 1);

      setTimeout(() => setIsScrolling(false), 800);
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [currentIndex, videos.length, isScrolling]);

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden">
      {!loading && videos.length === 0 ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-50">
          <p className="text-xl text-gray-400 mb-6 font-semibold">Chưa có thước phim nào. Hãy là người đầu tiên!</p>
          <VideoUploadButton className="flex items-center justify-center p-6 bg-pink-600 hover:bg-pink-700 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95">
             <Plus className="w-10 h-10 text-white" />
          </VideoUploadButton>
          <span className="mt-4 text-sm text-gray-500">Tải video từ thiết bị</span>
        </div>
      ) : (
        <>
          {/* 🎥 VIDEO LIST */}
          <div
            ref={containerRef}
            className="h-full w-full overflow-hidden snap-y snap-mandatory scroll-smooth"
          >
            {videos.map((v) => (
              <div
                key={v._id}
                className={`video-section snap-start h-screen flex justify-center items-center transition-transform duration-500 ease-in-out ${
                  showComments ? "-translate-x-[200px]" : "translate-x-0"
                }`}
              >
                <ShortVideoCard
                  video={v}
                  muted={muted}
                  setMuted={setMuted}
                  onShowComments={setShowComments}
                />
              </div>
            ))}
          </div>

          {/* ⚙️ Nút điều hướng (nổi riêng, không bị che) */}
          {videos.length > 0 && (
            <div
              className={`fixed top-1/2 -translate-y-1/2 flex flex-col gap-4 z-[60] transition-all duration-500 ease-in-out ${
                showComments ? "right-[420px]" : "right-6"
              }`}
            >
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="bg-black/60 hover:bg-black/80 text-white p-3 rounded-full shadow-lg disabled:opacity-30"
              >
                <ChevronUp size={28} />
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex === videos.length - 1}
                className="bg-black/60 hover:bg-black/80 text-white p-3 rounded-full shadow-lg disabled:opacity-30"
              >
                <ChevronDown size={28} />
              </button>
            </div>
          )}

          {/* 📤 Nút thêm video nhanh (luôn hiển thị) */}
          <div className={`fixed transition-all duration-500 ease-in-out z-[60] ${showComments ? "bottom-8 right-[420px]" : "bottom-8 right-8"}`}>
            <VideoUploadButton className="flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-full shadow-2xl shadow-pink-500/20 transition-all hover:scale-110 active:scale-90 border-2 border-white/20">
               <Plus size={32} strokeWidth={3} />
            </VideoUploadButton>
          </div>

          {/* 🗨️ Sidebar bình luận */}
          <div
            className={`fixed top-0 right-0 h-full z-50 transition-transform duration-500 ease-in-out ${
              showComments ? "translate-x-0" : "translate-x-[400px]"
            }`}
          >
            <CommentSidebar
              visible={showComments}
              onClose={() => setShowComments(false)}
              videoId={videos[currentIndex]?._id}
            />
          </div>
        </>
      )}
    </div>

  );
}
