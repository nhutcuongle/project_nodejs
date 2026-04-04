import Notification from "../models/Notification.js";
import User from "../models/User.js";

export const sendGlobalNotification = async (req, res) => {
  try {
    const { message, link } = req.body;

    if (!message) return res.status(400).json({ message: "Thiếu nội dung thông báo." });

    const users = await User.find({}, "_id");

    const notiList = users.map(user => ({
      user: user._id,
      message,
      link
    }));

    await Notification.insertMany(notiList);

    // Gửi socket đến tất cả người dùng
    const io = req.app.get("io");
    users.forEach(user => {
      io.to(user._id.toString()).emit("global_notification", {
        message,
        link
      });
    });

    res.status(200).json({ message: "Đã gửi thông báo đến toàn bộ người dùng." });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi gửi thông báo.", error: err.message });
  }
};
// [GET] /api/notifications
export const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy thông báo.", error: err.message });
  }
};
// [PUT] /api/notifications/mark-all-read
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, read: false },
      { $set: { read: true } }
    );
    res.status(200).json({ message: "Đã đánh dấu tất cả thông báo là đã đọc." });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi cập nhật thông báo.", error: err.message });
  }
};
