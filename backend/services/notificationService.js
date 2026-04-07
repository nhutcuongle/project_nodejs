import Notification from "../models/Notification.js";
import User from "../models/User.js";
import Follow from "../models/Follow.js";

/**
 * Service to handle notifications for a new question.
 */
export const notifyFollowersOfNewQuestion = async (authorId, question, io) => {
  try {
    const followers = await Follow.find({ following: authorId }).populate("follower");
    const authorData = await User.findById(authorId);
    const identifier = authorData.identifier || authorData.username || "Người dùng";

    for (const { follower } of followers) {
      if (!follower) continue;
      const message = `${identifier} đã đăng một câu hỏi mới`;
      const link = `/questions/${question._id}`;

      if (io) {
        io.to(follower._id.toString()).emit("new_question", {
          type: "new_question",
          identifier,
          questionId: question._id,
          message,
          link,
        });
      }

      await Notification.create({
        user: follower._id,
        sender: authorId,
        type: "new_question",
        message,
        link,
        read: false,
      });
    }
  } catch (error) {
    console.error("❌ [NOTIFICATION] Lỗi khi gửi thông báo:", error);
  }
};

/**
 * Generic notification for votes.
 */
export const sendVoteNotification = async (targetOwnerId, message, link, io) => {
  try {
    if (io) {
      io.to(targetOwnerId.toString()).emit("vote_notification", { message, link });
    }
    await Notification.create({
      user: targetOwnerId,
      message,
      link,
      read: false,
    });
  } catch (error) {
    console.error("❌ [NOTIFICATION] Lỗi khi gửi thông báo vote:", error);
  }
};

/**
 * Notification for a new answer.
 */
export const notifyNewAnswer = async (userId, message, link, io, data = {}) => {
  try {
    if (io) {
      io.to(userId.toString()).emit("new_answer", {
        message,
        link,
        ...data
      });
    }
    await Notification.create({
      user: userId,
      message,
      link,
      read: false,
    });
  } catch (error) {
    console.error("❌ [NOTIFICATION] Lỗi khi gửi thông báo câu trả lời:", error);
  }
};

/**
 * Generic notification send.
 */
export const sendGenericNotification = async (userId, message, link) => {
  try {
    await Notification.create({
      user: userId,
      message,
      link,
      read: false,
    });
  } catch (error) {
    console.error("❌ [NOTIFICATION] Lỗi khi gửi thông báo chung:", error);
  }
};

export const sendGlobalNotificationLogic = async (message, link, io) => {
  const users = await User.find({}, "_id");
  const notiList = users.map(user => ({
    user: user._id,
    message,
    link
  }));

  await Notification.insertMany(notiList);

  users.forEach(user => {
    io.to(user._id.toString()).emit("global_notification", { message, link });
  });

  return { message: "Đã gửi thông báo đến toàn bộ người dùng." };
};

export const getUserNotificationsLogic = async (userId) => {
  return await Notification.find({ user: userId }).sort({ createdAt: -1 });
};

export const markAllAsReadLogic = async (userId) => {
  await Notification.updateMany(
    { user: userId, read: false },
    { $set: { read: true } }
  );
  return { message: "Đã đánh dấu tất cả thông báo là đã đọc." };
};
