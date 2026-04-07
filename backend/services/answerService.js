import Answer from "../models/Answer.js";
import * as voteService from "./voteService.js";
import Question from "../models/Question.js";

/**
 * Gets the number of approved answers for a question.
 */
export const getAnswerCount = async (questionId) => {
  return Answer.countDocuments({ question: questionId, approved: true });
};

/**
 * Gets the number of approved answers for multiple questions in bulk.
 */
export const getBulkAnswerCounts = async (questionIds) => {
  const answers = await Answer.aggregate([
    { $match: { question: { $in: questionIds }, approved: true } },
    { $group: { _id: "$question", count: { $sum: 1 } } }
  ]);
  
  const counts = {};
  questionIds.forEach((id) => {
    counts[id.toString()] = 0;
  });

  answers.forEach((a) => {
    counts[a._id.toString()] = a.count;
  });

  return counts;
};

/**
 * Fetches all answers for a question and organizes them into a hierarchy with votes.
 */
export const getQuestionAnswersEnriched = async (questionId, userId) => {
  const rawAnswers = await Answer.find({ question: questionId, approved: true })
    .populate("author", "username avatar identifier")
    .sort({ createdAt: 1 })
    .lean();

  const answerIds = rawAnswers.map((a) => a._id);
  
  // Organizing by parentId for quick lookup
  const childAnswersMap = {};
  rawAnswers.forEach((a) => {
    if (a.parentAnswer) {
      const parentId = a.parentAnswer.toString();
      if (!childAnswersMap[parentId]) childAnswersMap[parentId] = [];
      childAnswersMap[parentId].push(a);
    }
  });

  const enrichAnswerRecursive = async (answer) => {
    const { upvotes, downvotes } = await voteService.getVoteCounts(answer._id, "answer");
    const userVote = await voteService.getUserVote(userId, answer._id, "answer");
    
    // Process children
    const rawChildren = childAnswersMap[answer._id.toString()] || [];
    const children = await Promise.all(rawChildren.map(enrichAnswerRecursive));

    return {
      ...answer,
      upvotes,
      downvotes,
      userVote,
      children,
    };
  };

  const parentAnswers = rawAnswers.filter((a) => !a.parentAnswer);
  return Promise.all(parentAnswers.map(enrichAnswerRecursive));
};

/**
 * Fetches all answers and returns them as a flat enriched list.
 */
export const getQuestionAnswersFlatEnriched = async (questionId, userId) => {
  const rawAnswers = await Answer.find({ 
    question: questionId,
    approved: true 
  })
    .populate("author", "username avatar identifier")
    .sort({ createdAt: 1 })
    .lean();

  const enriched = await Promise.all(
    rawAnswers.map(async (ans) => {
      const [votes, userVote] = await Promise.all([
        voteService.getVoteCounts(ans._id, "answer"),
        voteService.getUserVote(userId, ans._id, "answer")
      ]);
      
      return {
        ...ans,
        upvotes: votes.upvotes,
        downvotes: votes.downvotes,
        userVote,
      };
    })
  );

  return enriched;
};

/**
 * Creates a new answer and handles moderation notifications.
 */
export const createAnswerLogic = async (data, author, io) => {
  const { questionId, content, images, parentAnswerId, isApproved = true } = data;

  const newAnswer = new Answer({
    content,
    images,
    author: author.id,
    question: questionId,
    parentAnswer: parentAnswerId || null,
    approved: isApproved, 
  });

  await newAnswer.save();

  const populatedAnswer = await Answer.findById(newAnswer._id).populate(
    "author",
    "username avatar identifier"
  );

  const question = await Question.findById(questionId).populate("author");

  // Socket emit
  if (io) {
    io.to(questionId.toString()).emit("new_answer_public", {
      ...populatedAnswer.toObject(),
      question: questionId,
    });
  }

  return populatedAnswer;
};

/**
 * Bulk cleanup of answers for a question.
 */
export const cleanupAnswers = async (questionId) => {
  await Answer.deleteMany({ question: questionId });
};

/**
 * Updates an existing answer.
 */
export const updateAnswerLogic = async (answerId, userId, data, io) => {
  const { content, images } = data;
  const answer = await Answer.findById(answerId);

  if (!answer) throw new Error("Không tìm thấy câu trả lời.");
  if (answer.author.toString() !== userId) throw new Error("Bạn không có quyền sửa câu trả lời này.");

  answer.content = content || answer.content;
  if (images) answer.images = images;
  
  await answer.save();

  const populated = await Answer.findById(answerId).populate("author", "username avatar identifier");

  if (io) {
    io.to(answer.question.toString()).emit("answer_updated", populated);
  }

  return populated;
};

/**
 * Deletes an answer and its sub-answers (recursive cleanup).
 */
export const deleteAnswerLogic = async (answerId, userId, isAdmin = false, io) => {
  const answer = await Answer.findById(answerId);

  if (!answer) throw new Error("Không tìm thấy câu trả lời.");
  
  // Check permission (Author or Admin)
  if (answer.author.toString() !== userId && !isAdmin) {
    throw new Error("Bạn không có quyền xóa câu trả lời này.");
  }

  const questionId = answer.question.toString();

  // Recursive delete for child answers
  const deleteRecursive = async (id) => {
    const children = await Answer.find({ parentAnswer: id });
    for (const child of children) {
      await deleteRecursive(child._id);
    }
    await Answer.findByIdAndDelete(id);
    // Also clean up votes
    await voteService.cleanupVotes(id, "answer");
  };

  await deleteRecursive(answerId);

  if (io) {
    io.to(questionId).emit("answer_deleted", { answerId });
  }

  return { success: true };
};
