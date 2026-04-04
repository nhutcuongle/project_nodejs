import * as bookmarkService from "../services/bookmarkService.js";

// Lưu bookmark (question hoặc video)
export const addBookmark = async (req, res) => {
  const { targetId, targetType = "Question" } = req.body;
  try {
    const bookmark = await bookmarkService.addBookmarkLogic(req.user.id, targetId, targetType);
    res.status(201).json({ message: "Đã lưu thành công.", bookmark });
  } catch (err) {
    if (err.message === "ALREADY_BOOKMARKED") {
      return res.status(400).json({ message: "Bạn đã lưu nội dung này rồi." });
    }
    res.status(500).json({ message: "Lỗi lưu.", error: err.message });
  }
};

// Bỏ bookmark
export const removeBookmark = async (req, res) => {
  const { targetId, targetType = "Question" } = req.body;
  try {
    await bookmarkService.removeBookmarkLogic(req.user.id, targetId, targetType);
    res.status(200).json({ message: "Đã bỏ lưu." });
  } catch (err) {
    res.status(500).json({ message: "Lỗi bỏ lưu.", error: err.message });
  }
};

// Lấy danh sách bookmark của chính mình
export const getMyBookmarks = async (req, res) => {
  try {
    const items = await bookmarkService.getUserBookmarksEnriched(req.user.id, req.query.type, req.user.id);
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách.", error: err.message });
  }
};

// Lấy danh sách bookmark theo userId
export const getBookmarksByUserId = async (req, res) => {
  try {
    const items = await bookmarkService.getUserBookmarksEnriched(req.params.userId, req.query.type, req.user?.id);
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách.", error: err.message });
  }
};
