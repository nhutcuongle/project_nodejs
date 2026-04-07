// utils/enrichQuestions.js
import Answer from "../models/Answer.js";
import Vote from "../models/Vote.js";

export const enrichQuestions = async (questions, userId) => {
  return Promise.all(
    questions.map(async (q) => {
      const [answerCount, upvotes, downvotes] = await Promise.all([
        Answer.countDocuments({ question: q._id, approved: true }),
        Vote.countDocuments({ targetType: "question", targetId: q._id, voteType: "up" }),
        Vote.countDocuments({ targetType: "question", targetId: q._id, voteType: "down" }),
      ]);

      let userVote = null;
      let savedByUser = false;

      if (userId) {
        const vote = await Vote.findOne({ targetType: "question", targetId: q._id, user: userId });
        userVote = vote?.voteType || null;
      }

      return {
        ...q.toObject(),
        answerCount,
        upvotes,
        downvotes,
        userVote,
      };
    })
  );
};
