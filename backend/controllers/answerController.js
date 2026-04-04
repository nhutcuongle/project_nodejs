import * as answerService from "../services/answerService.js";
import { containsFilteredWord } from "../utils/checkFilteredWords.js";

export const createAnswer = async (req, res) => {
  try {
    const { user, body, app } = req;
    if (user.permissions?.canAnswer === false) {
      return res.status(403).json({ message: "Tài khoản của bạn đã bị cấm trả lời." });
    }

    let { questionId, content, images, parentAnswer } = body;
    
    // Moderation check
    const filter = await containsFilteredWord(content);
    if (filter.action === "block") {
      return res.status(403).json({ message: "Nội dung vi phạm chính sách cộng đồng." });
    }

    const isApproved = filter.action !== "pending";
    const processedContent = filter.action === "censor" ? filter.processedText : content;

    const answer = await answerService.createAnswerLogic(
      { questionId, content: processedContent, images, parentAnswerId: parentAnswer, isApproved },
      user,
      app.get("io")
    );

    res.status(isApproved ? 201 : 202).json({
      message: isApproved ? "Trả lời thành công." : "Đang chờ kiểm duyệt.",
      answer
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi hệ thống.", error: err.message });
  }
};

export const getAnswersByQuestion = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id; // Fix: pass current user ID to show their pending answers
    const answers = await answerService.getQuestionAnswersFlatEnriched(req.params.questionId, userId);
    res.json({ answers });
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách.", error: err.message });
  }
};

export const updateAnswer = async (req, res) => {
  try {
    const { answerId } = req.params;
    let { content, images } = req.body;

    const filter = await containsFilteredWord(content);
    if (filter.action === "block") return res.status(403).json({ message: "Nội dung vi phạm." });
    
    const finalContent = filter.action === "censor" ? filter.processedText : content;

    const updated = await answerService.updateAnswerLogic(answerId, req.user.id, { content: finalContent, images }, req.app.get("io"));
    res.json({ message: "Cập nhật thành công.", answer: updated });
  } catch (err) {
    res.status(403).json({ message: err.message });
  }
};

export const deleteAnswer = async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin";
    const result = await answerService.deleteAnswerLogic(req.params.answerId, req.user.id, isAdmin, req.app.get("io"));
    res.json(result);
  } catch (err) {
    res.status(403).json({ message: err.message });
  }
};
