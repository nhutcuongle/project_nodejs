import * as statisticsService from "../services/statisticsService.js";
import User from "../models/User.js";
import Question from "../models/Question.js";
import Vote from "../models/Vote.js";

export const getStats = async (req, res) => {
  try {
    const data = await statisticsService.getSystemStats();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Lỗi thống kê." });
  }
};

export const getQuestionsByTime = async (req, res) => {
  try {
    const data = await statisticsService.getCountsByTime(Question, req.query.type);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Lỗi thống kê câu hỏi." });
  }
};

export const getUsersByTime = async (req, res) => {
  try {
    const data = await statisticsService.getCountsByTime(User, req.query.type);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Lỗi thống kê user." });
  }
};

export const getUserRoleDistribution = async (req, res) => {
  try {
    const data = await User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Lỗi thống kê role." });
  }
};

export const getVotesByTime = async (req, res) => {
  try {
    const data = await statisticsService.getCountsByTime(Vote, req.query.type);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Lỗi thống kê vote." });
  }
};

export const getTopUsersByQuestions = async (req, res) => {
  try {
    const data = await statisticsService.getTopAnswerers();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Lỗi thống kê top user." });
  }
};
