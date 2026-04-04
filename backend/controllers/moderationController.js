import * as moderationService from "../services/moderationService.js";

export const getPendingItems = async (req, res) => {
  try {
    const data = await moderationService.getPendingItemsLogic();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách.", error: err.message });
  }
};

export const approveItem = async (req, res) => {
  try {
    const { targetType, targetId } = req.body;
    const item = await moderationService.approveItemLogic(req.user.id, targetType, targetId);
    res.json({ message: "Duyệt thành công.", item });
  } catch (err) {
    if (err.message === "INVALID_TYPE") return res.status(400).json({ message: "Loại không hợp lệ." });
    if (err.message === "ITEM_NOT_FOUND") return res.status(404).json({ message: "Không tìm thấy." });
    res.status(500).json({ message: "Lỗi duyệt.", error: err.message });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const { targetType, targetId, reason } = req.body;
    const result = await moderationService.deleteItemLogic(req.user.id, targetType, targetId, reason);
    res.json({ message: "Đã xoá nội dung vi phạm.", ...result });
  } catch (err) {
    if (err.message === "INVALID_TYPE") return res.status(400).json({ message: "Loại không hợp lệ." });
    if (err.message === "ITEM_NOT_FOUND") return res.status(404).json({ message: "Không tìm thấy." });
    res.status(500).json({ message: "Lỗi xoá.", error: err.message });
  }
};
