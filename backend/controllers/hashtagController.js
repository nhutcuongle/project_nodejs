import * as hashtagService from "../services/hashtagService.js";

export const getAllHashtags = async (req, res) => {
  try {
    const hashtags = await hashtagService.getAllHashtagsLogic();
    res.json(hashtags);
  } catch {
    res.status(500).json({ message: "Lỗi khi lấy hashtag" });
  }
};

export const searchHashtags = async (req, res) => {
  try {
    const q = req.query.q || "";
    const hashtags = await hashtagService.searchHashtagsLogic(q);
    res.json(hashtags);
  } catch {
    res.status(500).json({ message: "Lỗi tìm kiếm." });
  }
};

export const createHashtag = async (req, res) => {
  try {
    const newHashtag = await hashtagService.createHashtagLogic(req.body.name);
    res.status(201).json(newHashtag);
  } catch (err) {
    res.status(err.message === "HASHTAG_EXISTS" ? 400 : 500).json({ message: "Lỗi tạo hashtag." });
  }
};

export const updateHashtag = async (req, res) => {
  try {
    const updated = await hashtagService.updateHashtagLogic(req.params.id, req.body);
    res.json(updated);
  } catch {
    res.status(500).json({ message: "Lỗi cập nhật." });
  }
};

export const deleteHashtag = async (req, res) => {
  try {
    await hashtagService.deleteHashtagLogic(req.params.id);
    res.json({ message: "Đã xoá hashtag" });
  } catch {
    res.status(500).json({ message: "Lỗi xoá." });
  }
};
