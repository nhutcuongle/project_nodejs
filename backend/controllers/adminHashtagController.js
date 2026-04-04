import * as hashtagService from "../services/hashtagService.js";
import Question from "../models/Question.js";

export const getAllHashtags = async (req, res) => {
  try {
    const result = await hashtagService.getAllHashtagsWithCounts(req.query.search);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách hashtag" });
  }
};

export const updateHashtag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    await hashtagService.createHashtagLogic(name); // Check name exist
    // Update logic 
    const hashtag = await Hashtag.findByIdAndUpdate(id, { name }, { new: true });
    res.json({ message: "Cập nhật thành công.", hashtag });
  } catch (err) {
    res.status(err.message === "HASHTAG_EXISTS" ? 400 : 500).json({ message: "Lỗi cập nhật." });
  }
};

export const deleteHashtag = async (req, res) => {
  try {
    await hashtagService.deleteHashtagLogic(req.params.id);
    res.json({ message: "Xoá hashtag thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xoá hashtag." });
  }
};

export const searchHashtags = async (req, res) => {
  try {
    const { keyword } = req.query;
    if (!keyword?.trim()) return res.status(400).json({ message: "Từ khoá không hợp lệ." });

    const result = await hashtagService.getAllHashtagsWithCounts(keyword);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Lỗi tìm kiếm." });
  }
};

export const getQuestionsByHashtag = async (req, res) => {
  try {
    const questions = await Question.find({ hashtags: req.params.id })
      .select("_id title author createdAt")
      .populate("author", "fullName avatar identifier")
      .sort({ createdAt: -1 });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách bài viết." });
  }
};

export const bulkDeleteHashtags = async (req, res) => {
  try {
    const { ids } = req.body;
    const result = await hashtagService.bulkDeleteHashtagsLogic(ids);
    res.json({ message: `Đã xoá ${result.deletedCount} hashtag` });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi xoá hàng loạt." });
  }
};
