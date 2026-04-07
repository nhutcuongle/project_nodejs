import Question from "../models/Question.js";
import Hashtag from "../models/Hashtag.js";
import User from "../models/User.js";
import * as voteService from "./voteService.js";
import * as answerService from "./answerService.js";

/**
 * Enriches a single question with statistics and user-specific status.
 */
export const enrichQuestionData = async (question, userId) => {
  const [ { upvotes, downvotes }, answerCount ] = await Promise.all([
    voteService.getVoteCounts(question._id, "question"),
    answerService.getAnswerCount(question._id),
  ]);

  const userVote = await voteService.getUserVote(userId, question._id, "question");
  const savedByUser = false; // Move to savedQuestionService if needed

  return {
    ...question.toObject ? question.toObject() : question,
    answerCount,
    upvotes,
    downvotes,
    userVote,
    savedByUser,
  };
};

/**
 * Enriches multiple questions.
 */
export const enrichQuestionsData = async (questions, userId) => {
  if (!questions || questions.length === 0) return [];

  const questionIds = questions.map((q) => q._id);

  const [voteStats, answerCounts] = await Promise.all([
    voteService.getBulkVotesStats(questionIds, "question", userId),
    answerService.getBulkAnswerCounts(questionIds),
  ]);

  return questions.map((q) => {
    const idStr = q._id.toString();
    const stats = voteStats[idStr] || { upvotes: 0, downvotes: 0, userVote: null };
    const answerCount = answerCounts[idStr] || 0;

    return {
      ...q.toObject ? q.toObject() : q,
      answerCount,
      upvotes: stats.upvotes,
      downvotes: stats.downvotes,
      userVote: stats.userVote,
      savedByUser: false, // Handle savedQuestionService if necessary
    };
  });
};

/**
 * Gets a full question with enriched answers recursively.
 */
export const getQuestionFullData = async (questionId, userId) => {
  const question = await Question.findById(questionId)
    .populate("author", "username avatar identifier")
    .populate("hashtags", "name");

  if (!question || !question.approved) return null;

  const [ { upvotes, downvotes }, userVote, enrichedAnswers ] = await Promise.all([
    voteService.getVoteCounts(questionId, "question"),
    voteService.getUserVote(userId, questionId, "question"),
    answerService.getQuestionAnswersFlatEnriched(questionId, userId),
  ]);

  return {
    ...question.toObject(),
    answers: enrichedAnswers,
    upvotes,
    downvotes,
    userVote,
    savedByUser: false, // Placeholder
  };
};

/**
 * Searches for questions based on metadata.
 */
export const searchQuestionsInDb = async (filters, userId) => {
  const { keyword = "", field = "title", sort = "newest", range = "all" } = filters;

  const query = {
    approved: true,
    isHidden: false,
  };

  if (keyword.trim()) {
    const regex = new RegExp(keyword, "i");
    switch (field) {
      case "title":
        query.title = { $regex: regex };
        break;
      case "content":
        query.content = { $regex: regex };
        break;
      case "hashtag":
        const matchedHashtags = await Hashtag.find({ name: regex });
        query.hashtags = matchedHashtags.length
          ? { $in: matchedHashtags.map((h) => h._id) }
          : { $in: [] };
        break;
      case "user":
        const user = await User.findOne({
          $or: [{ username: regex }, { _id: keyword }],
        });
        query.author = user ? user._id : null;
        break;
    }
  }

  if (range !== "all") {
    const now = new Date();
    let fromDate = new Date();
    switch (range) {
      case "24h": fromDate.setHours(now.getHours() - 24); break;
      case "3d": fromDate.setDate(now.getDate() - 3); break;
      case "7d": fromDate.setDate(now.getDate() - 7); break;
      case "1m": fromDate.setMonth(now.getMonth() - 1); break;
    }
    query.createdAt = { $gte: fromDate };
  }

  const sortOption = sort === "oldest" ? 1 : -1;

  const questions = await Question.find(query)
    .populate("author", "username avatar identifier")
    .populate("hashtags", "name")
    .sort({ createdAt: sortOption });

  return enrichQuestionsData(questions, userId);
};

import * as notificationService from "./notificationService.js";
import { containsFilteredWord } from "../utils/checkFilteredWords.js";
import { processHashtags } from "../utils/hashtagUtils.js";
import { containsBannedHashtag } from "../utils/checkHashtagBan.js";

/**
 * Logic for creating a question with moderation checks.
 */
export const createQuestionLogic = async (data, author, io) => {
  const { title, content, images, hashtags } = data;

  // Moderation
  const filter = await containsFilteredWord(title + " " + content);
  const bannedHashtags = await containsBannedHashtag(hashtags);
  
  let action = filter.action;
  if (bannedHashtags && action !== "block") action = "pending";

  if (action === "block") throw new Error("CONTENT_BLOCKED");

  let finalTitle = title;
  let finalContent = content;

  if (action === "censor") {
    finalTitle = (await containsFilteredWord(title)).processedText;
    finalContent = (await containsFilteredWord(content)).processedText;
  }

  const isApproved = action !== "pending";
  const hashtagIds = await processHashtags(hashtags);

  // Check for duplicate pending
  if (!isApproved) {
    const existing = await Question.findOne({ title: finalTitle, content: finalContent, author: author.id, approved: false });
    if (existing) return { status: 202, question: existing, message: "Đang chờ kiểm duyệt." };
  }

  const question = new Question({
    title: finalTitle,
    content: finalContent,
    images: images || [],
    hashtags: hashtagIds,
    author: author.id,
    approved: isApproved,
  });

  await question.save();

  if (isApproved && io) {
    notificationService.notifyFollowersOfNewQuestion(author.id, question, io);
  }

  return {
    status: isApproved ? 201 : 202,
    question,
    message: isApproved ? "Đăng câu hỏi thành công." : "Đang chờ kiểm duyệt."
  };
};

/**
 * Deletes all related data of a question.
 */
export const cleanupQuestionData = async (questionId) => {
  await Promise.all([
    Question.deleteOne({ _id: questionId }),
    answerService.cleanupAnswers(questionId),
    voteService.cleanupVotes(questionId, "question"),
  ]);
};

/**
 * Logic for updating a question with moderation checks.
 */
export const updateQuestionLogic = async (questionId, data, authorId) => {
  const { title, content, images, hashtags } = data;

  const question = await Question.findById(questionId);
  if (!question) throw new Error("NOT_FOUND");
  if (question.author.toString() !== authorId.toString()) throw new Error("UNAUTHORIZED");

  // Moderation
  let action = "allow";
  let finalTitle = question.title;
  let finalContent = question.content;
  let hashtagIds = question.hashtags;

  if (title || content) {
    const textToCheck = (title || question.title) + " " + (content || question.content);
    const filter = await containsFilteredWord(textToCheck);
    action = filter.action;
    
    if (action === "block") throw new Error("CONTENT_BLOCKED");
    
    if (title) finalTitle = action === "censor" ? (await containsFilteredWord(title)).processedText : title;
    if (content) finalContent = action === "censor" ? (await containsFilteredWord(content)).processedText : content;
  }

  if (hashtags) {
    const bannedHashtags = await containsBannedHashtag(hashtags);
    if (bannedHashtags && action !== "block") action = "pending";
    hashtagIds = await processHashtags(hashtags);
  }

  const isApproved = action !== "pending";

  question.title = finalTitle;
  question.content = finalContent;
  if (images) question.images = images;
  if (hashtags) question.hashtags = hashtagIds;
  question.approved = isApproved;

  await question.save();

  return {
    status: isApproved ? 200 : 202,
    question,
    message: isApproved ? "Cập nhật câu hỏi thành công." : "Cập nhật thành công. Đang chờ kiểm duyệt lại."
  };
};

export const getAllQuestionsAdminLogic = async () => {
  return await Question.find()
    .populate("author", "username")
    .populate("hashtags", "name")
    .sort({ createdAt: -1 });
};

export const updateQuestionAdminLogic = async (id, updates) => {
  const updated = await Question.findByIdAndUpdate(id, updates, { new: true });
  if (!updated) throw new Error("NOT_FOUND");
  return updated;
};

export const deleteQuestionAdminLogic = async (id) => {
  const question = await Question.findById(id);
  if (!question) throw new Error("NOT_FOUND");
  await cleanupQuestionData(id);
};

export const deleteQuestionLogic = async (questionId, userId) => {
  const question = await Question.findById(questionId);
  if (!question) throw new Error("NOT_FOUND");
  if (question.author.toString() !== userId.toString()) throw new Error("UNAUTHORIZED");
  await cleanupQuestionData(questionId);
};

export const getAllQuestionsLogic = async (page, limit, userId) => {
  const skip = (page - 1) * limit;
  const filter = { approved: true, isHidden: false };

  const [totalQuestions, questions] = await Promise.all([
    Question.countDocuments(filter),
    Question.find(filter)
      .populate("author", "username avatar identifier")
      .populate("hashtags", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
  ]);

  const questionsWithStats = await enrichQuestionsData(questions, userId);

  return {
    questions: questionsWithStats,
    pagination: { totalQuestions, totalPages: Math.ceil(totalQuestions / limit), currentPage: page }
  };
};

export const toggleHideQuestionLogic = async (questionId, userId, isHidden) => {
  const question = await Question.findById(questionId);
  if (!question || question.author.toString() !== userId.toString()) throw new Error("UNAUTHORIZED");
  question.isHidden = isHidden;
  await question.save();
  return question;
};

export const getQuestionsByFilterLogic = async (filter, userId) => {
  const questions = await Question.find(filter)
    .populate("author", "username avatar identifier")
    .populate("hashtags", "name")
    .sort({ createdAt: -1 });

  return await enrichQuestionsData(questions, userId);
};
