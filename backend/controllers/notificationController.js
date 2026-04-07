import * as notificationService from "../services/notificationService.js";

export const sendGlobalNotification = async (req, res) => {
  try {
    const { message, link } = req.body;

    if (!message) return res.status(400).json({ message: "Thiếu nội dung thông báo." });

    const result = await notificationService.sendGlobalNotificationLogic(message, link, req.app.get("io"));

    res.status(200).json({ message: "Đã gửi thông báo đến toàn bộ người dùng." });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi gửi thông báo.", error: err.message });
  }
};
// [GET] /api/notifications
export const getUserNotifications = async (req, res) => {
  try {
    const notifications = await notificationService.getUserNotificationsLogic(req.user.id);
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy thông báo.", error: err.message });
  }
};
// [PUT] /api/notifications/mark-all-read
export const markAllAsRead = async (req, res) => {
  try {
    const result = await notificationService.markAllAsReadLogic(req.user.id);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi cập nhật thông báo.", error: err.message });
  }
};
