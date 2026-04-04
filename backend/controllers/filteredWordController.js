import * as filteredWordService from "../services/filteredWordService.js";

export const getFilteredWords = async (req, res) => {
  try {
    const words = await filteredWordService.getFilteredWordsLogic(req.query.type);
    res.json(words);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách.", error: err.message });
  }
};

export const addFilteredWord = async (req, res) => {
  try {
    const result = await filteredWordService.addFilteredWordLogic(req.body, req.user?.id);
    res.status(201).json({ message: "Đã thêm từ cấm.", word: result });
  } catch (err) {
    if (err.message === "WORD_EXISTS") return res.status(400).json({ message: "Từ này đã tồn tại." });
    if (err.message === "WORD_MISSING") return res.status(400).json({ message: "Thiếu từ ngữ." });
    res.status(500).json({ message: "Lỗi thêm từ cấm.", error: err.message });
  }
};

export const deleteFilteredWord = async (req, res) => {
  try {
    await filteredWordService.deleteFilteredWordLogic(req.params.id);
    res.json({ message: "Đã xoá thành công." });
  } catch (err) {
    res.status(err.message === "NOT_FOUND" ? 404 : 500).json({ message: "Lỗi xoá." });
  }
};
