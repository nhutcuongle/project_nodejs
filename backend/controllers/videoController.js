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
    const result = await videoService.deleteVideoLogic(req.params.id, req.user.id);
    res.json(result);
  } catch (err) {
    if (err.message === "NOT_FOUND") return res.status(404).json({ message: "Không tìm thấy." });
    if (err.message === "UNAUTHORIZED") return res.status(403).json({ message: "Không có quyền." });
    res.status(500).json({ message: "Lỗi xóa.", error: err.message });
  }
};

export const updateVideo = async (req, res) => {
  try {
    const { description } = req.body;
    const video = await videoService.updateVideoLogic(req.params.id, req.user.id, description);
    res.json({ success: true, video });
  } catch (err) {
    if (err.message === "NOT_FOUND") return res.status(404).json({ message: "Không tìm thấy video." });
    if (err.message === "UNAUTHORIZED") return res.status(403).json({ message: "Không có quyền sửa video này." });
    res.status(500).json({ message: "Lỗi cập nhật.", error: err.message });
  }
};

export const getVideoById = async (req, res) => {
  try {
    const video = await videoService.getVideoByIdLogic(req.params.id);
    res.json(video);
  } catch (err) {
    if (err.message === "NOT_FOUND") return res.status(404).json({ message: "Không tìm thấy video." });
    res.status(500).json({ message: "Lỗi lấy chi tiết video.", error: err.message });
  }
};
