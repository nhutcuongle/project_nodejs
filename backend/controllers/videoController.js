import Video from "../models/Video.js";
import * as videoService from "../services/videoService.js";

export const uploadVideo = async (req, res) => {
  try {
    if (!req.file?.path) return res.status(400).json({ message: "Thiếu file." });
    const video = await videoService.createVideo(req.user.id, req.body.description, req.file.path);
    res.status(201).json({ success: true, video });
  } catch (err) {
    res.status(500).json({ message: "Lỗi upload.", error: err.message });
  }
};

export const updateVideo = async (req, res) => {
  try {
    const video = await videoService.updateVideoLogic(req.params.id, req.user.id, req.body.description);
    res.json({ success: true, message: "Cập nhật video thành công.", video });
  } catch (err) {
    if (err.message === "NOT_FOUND") return res.status(404).json({ message: "Không tìm thấy." });
    if (err.message === "UNAUTHORIZED") return res.status(403).json({ message: "Không có quyền." });
    res.status(500).json({ message: "Lỗi cập nhật.", error: err.message });
  }
};

export const getVideoFeed = async (req, res) => {
  try {
    const [trending, random] = await Promise.all([
      videoService.getTrendingVideos(),
      videoService.getRandomVideos()
    ]);

    const combined = [...trending, ...random];
    const unique = combined.filter((v, i, arr) => 
      arr.findIndex(x => x._id?.toString() === v._id?.toString()) === i
    );

    res.json({ videos: unique });
  } catch (err) {
    res.status(500).json({ message: "Lỗi tải feed.", error: err.message });
  }
};

export const likeVideo = async (req, res) => {
  try {
    const result = await videoService.toggleLikeVideoLogic(req.params.id, req.user.id, req.app.get("io"));
    res.json(result);
  } catch (err) {
    if (err.message === "NOT_FOUND") return res.status(404).json({ message: "Không tìm thấy." });
    res.status(500).json({ message: "Lỗi like.", error: err.message });
  }
};

export const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Không tìm thấy." });
    if (video.user.toString() !== req.user.id) return res.status(403).json({ message: "Không có quyền." });

    await videoService.deleteVideoFromCloudinary(video.videoUrl);
    await video.deleteOne();
    res.json({ success: true, message: "Đã xóa." });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xóa.", error: err.message });
  }
};
